<script lang="ts">
	import { tick } from 'svelte';
	import { FieldDraft } from '$lib/fieldDraftHelpers';
	import FieldAnnotationControl from '$lib/FieldAnnotationControl.svelte';
	import { toGridJsonPointer } from '$lib/gridContentHelpers';
	import type { JSONPatchDocument, JSONPointer } from 'immutable-json-patch';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentBindPath,
		GridContentField,
		GridContentPatch,
		GridFieldPatchOperation
	} from '$lib/gridContentTypes';

	type PrimitiveFieldValue = string | number;

	interface Props {
		fieldKey: string;
		field: GridContentField;
		jsonPatchPath?: JSONPointer;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		onSavePatch?: (
			// eslint-disable-next-line no-unused-vars
			_patch: JSONPatchDocument,
			// eslint-disable-next-line no-unused-vars
			_compatibilityPatches: Array<GridContentPatch>
		) => void;
		onSaveAnnotations?: (
			// eslint-disable-next-line no-unused-vars
			_annotations: Array<GridContentAnnotation>,
			// eslint-disable-next-line no-unused-vars
			_annotationPath?: GridContentBindPath
		) => void;
	}

	let {
		fieldKey,
		field,
		jsonPatchPath = undefined,
		annotationEditorConfig = undefined,
		onSavePatch = undefined,
		onSaveAnnotations = undefined
	}: Props = $props();

	let draft = $state<FieldDraft<PrimitiveFieldValue> | undefined>(undefined);
	let draftValue = $state('');
	let error = $state<string | undefined>(undefined);
	let inputEl = $state<HTMLInputElement>();
	let editButtonEl = $state<HTMLButtonElement>();

	const fieldLabel = $derived(field.fieldName ?? fieldKey);
	const valuePatchPath = $derived(field.binding?.valuePatchPath ?? field.bindPath);
	const effectiveJsonPatchPath = $derived(
		jsonPatchPath ?? (valuePatchPath ? toGridJsonPointer(valuePatchPath) : undefined)
	);
	const annotationPatchPath = $derived(
		field.binding?.annotationPatchPath ?? field.annotationBindPath
	);
	const patchOperation = $derived<GridFieldPatchOperation>(
		field.binding?.valuePatchOperation ?? 'replace'
	);
	const inputKind = $derived(
		field.inputKind ?? (typeof field.value === 'number' ? 'number' : 'text')
	);
	const editAffordance = $derived(field.interaction?.editAffordance ?? 'persistent');
	const annotationAffordance = $derived(field.interaction?.annotationAffordance ?? 'persistent');
	const annotations = $derived(field.annotations ?? []);
	const shouldRenderAnnotationControl = $derived(
		annotationPatchPath !== undefined ||
			onSaveAnnotations !== undefined ||
			annotations.length > 0 ||
			annotationAffordance !== 'badge'
	);
	const currentValue = $derived<PrimitiveFieldValue>(
		typeof field.value === 'number' ? field.value : String(field.value)
	);
	const displayValue = $derived(currentValue === '' ? '___' : String(currentValue));

	const focusEditButton = async () => {
		await tick();
		editButtonEl?.focus();
	};

	const beginEdit = async () => {
		if (!effectiveJsonPatchPath) return;
		draft = FieldDraft.begin({
			kind: 'value',
			path: effectiveJsonPatchPath,
			value: currentValue,
			operation: patchOperation
		});
		draftValue = String(currentValue);
		error = undefined;
		await tick();
		inputEl?.focus();
		inputEl?.select();
	};

	const cancelEdit = async () => {
		draft = draft?.cancel();
		draftValue = '';
		error = undefined;
		await focusEditButton();
	};

	const readDraftValue = (): PrimitiveFieldValue => {
		if (inputKind === 'text') return draftValue;

		const parsedValue = Number(draftValue);
		if (!Number.isFinite(parsedValue)) {
			throw new Error('Expected a finite number.');
		}

		return parsedValue;
	};

	const saveEdit = async () => {
		if (!draft) return;

		try {
			const nextDraft = draft.update(readDraftValue());
			const patch = nextDraft.prepareAsPatch();
			if (patch.length > 0) {
				onSavePatch?.(
					patch,
					valuePatchPath ? [{ path: valuePatchPath, value: nextDraft.value }] : []
				);
			}
			await cancelEdit();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not save this field.';
		}
	};

	const onInput = (event: Event) => {
		const target = event.currentTarget;
		if (target instanceof HTMLInputElement) {
			draftValue = target.value;
		}
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveEdit();
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelEdit();
		}
	};
</script>

<span
	class="grid-primitive-field inline-flex flex-wrap items-center gap-x-2 gap-y-1"
	class:hover-affordance={editAffordance === 'hover'}
>
	{#if draft}
		<label class="inline-flex min-w-0 items-center gap-2">
			<span class="font-semibold">{fieldLabel}:</span>
			<input
				bind:this={inputEl}
				class="theme-input w-20 rounded-md border px-2 py-1 text-sm"
				type={inputKind}
				value={draftValue}
				aria-label={fieldLabel}
				oninput={onInput}
				onkeydown={onKeydown}
			/>
			{#if field.label}
				<span class="theme-text-muted text-xs italic">({field.label})</span>
			{/if}
		</label>
		<button
			bind:this={editButtonEl}
			type="button"
			class="theme-btn-light btn rounded-md border px-2 py-1 text-xs font-semibold"
			onclick={saveEdit}
		>
			Save
		</button>
		<button
			type="button"
			class="theme-btn-light btn rounded-md border px-2 py-1 text-xs"
			onclick={cancelEdit}
		>
			Cancel
		</button>
	{:else}
		<span class="min-w-0">
			<span class="font-semibold">{fieldLabel}:</span>
			<span>{displayValue}</span>
			{#if field.label}
				<span class="theme-text-muted text-xs italic">({field.label})</span>
			{/if}
		</span>
		<button
			bind:this={editButtonEl}
			type="button"
			class="theme-btn-light btn edit-trigger rounded-md border px-2 py-1 text-xs"
			aria-label={`Edit ${fieldLabel}`}
			onclick={beginEdit}
		>
			{editAffordance === 'menu' ? 'Actions' : 'Edit'}
		</button>
		{#if shouldRenderAnnotationControl}
			<FieldAnnotationControl
				{annotations}
				{annotationAffordance}
				{annotationEditorConfig}
				{fieldLabel}
				onSaveAnnotations={(nextAnnotations) => {
					onSaveAnnotations?.(nextAnnotations, annotationPatchPath);
				}}
			/>
		{/if}
	{/if}

	{#if error}
		<p class="theme-text-muted basis-full text-xs" role="alert">{error}</p>
	{/if}
</span>

<style>
	.hover-affordance .edit-trigger {
		opacity: 0;
	}

	.hover-affordance:hover .edit-trigger,
	.hover-affordance:focus-within .edit-trigger {
		opacity: 1;
	}

	@media (hover: none) {
		.hover-affordance .edit-trigger {
			opacity: 1;
		}
	}
</style>
