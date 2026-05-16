<script lang="ts">
	import { FieldDraft, type FieldDraftOperation } from '$lib/fieldDraftHelpers';
	import type { JSONPatchDocument, JSONPointer } from 'immutable-json-patch';

	type InlineFieldDraftValue = string | number;
	type EditAffordance = 'persistent' | 'hover' | 'menu';

	interface Props {
		label: string;
		value: InlineFieldDraftValue;
		path: JSONPointer;
		inputKind?: 'text' | 'number';
		suffix?: string;
		ariaLabel?: string;
		editAffordance?: EditAffordance;
		patchOperation?: FieldDraftOperation;
		// eslint-disable-next-line no-unused-vars
		onSavePatch: (_patch: JSONPatchDocument) => void;
	}

	let {
		label,
		value,
		path,
		inputKind = typeof value === 'number' ? 'number' : 'text',
		suffix = '',
		ariaLabel = undefined,
		editAffordance = 'persistent',
		patchOperation = 'replace',
		onSavePatch
	}: Props = $props();

	let draft = $state<FieldDraft<InlineFieldDraftValue> | undefined>(undefined);
	let draftValue = $state('');
	let error = $state<string | undefined>(undefined);

	const displayValue = $derived(value === '' ? '___' : String(value));

	const beginEdit = () => {
		draft = FieldDraft.begin({ kind: 'value', path, value, operation: patchOperation });
		draftValue = String(value);
		error = undefined;
	};

	const cancelEdit = () => {
		draft = draft?.cancel();
		draftValue = '';
		error = undefined;
	};

	const readDraftValue = (): InlineFieldDraftValue => {
		if (inputKind === 'text') return draftValue;

		const parsedValue = Number(draftValue);
		if (!Number.isFinite(parsedValue)) {
			throw new Error('Expected a finite number.');
		}

		return parsedValue;
	};

	const saveEdit = () => {
		if (!draft) return;

		try {
			const nextDraft = draft.update(readDraftValue());
			const patch = nextDraft.prepareAsPatch();
			if (patch.length > 0) {
				onSavePatch(patch);
			}
			cancelEdit();
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

<div
	class="inline-field-draft flex flex-wrap items-center gap-x-2 gap-y-1"
	class:hover-affordance={editAffordance === 'hover'}
>
	{#if draft}
		<label class="inline-flex min-w-0 items-center gap-2">
			<span class="font-semibold">{label}:</span>
			<input
				class="theme-input w-20 rounded-md border px-2 py-1 text-sm"
				type={inputKind}
				value={draftValue}
				aria-label={ariaLabel ?? label}
				oninput={onInput}
				onkeydown={onKeydown}
			/>
			{#if suffix}
				<span class="theme-text-muted text-xs italic">({suffix})</span>
			{/if}
		</label>
		<button
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
			<span class="font-semibold">{label}:</span>
			<span>{displayValue}</span>
			{#if suffix}
				<span class="theme-text-muted text-xs italic">({suffix})</span>
			{/if}
		</span>
		<button
			type="button"
			class="theme-btn-light btn edit-trigger rounded-md border px-2 py-1 text-xs"
			aria-label={`Edit ${ariaLabel ?? label}`}
			onclick={beginEdit}
		>
			{editAffordance === 'menu' ? 'Actions' : 'Edit'}
		</button>
	{/if}

	{#if error}
		<p class="theme-text-muted basis-full text-xs" role="alert">{error}</p>
	{/if}
</div>

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
