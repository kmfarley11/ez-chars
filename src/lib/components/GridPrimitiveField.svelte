<script lang="ts">
	import { tick } from 'svelte';
	import { getSmallEditAccess } from './smallEditContext';
	const smallEdit = getSmallEditAccess();
	import Badge from '$components/Badge.svelte';
	import DetailLabelButton from './DetailLabelButton.svelte';
	import { FieldDraft } from '$utils/fieldDraftHelpers';
	import FieldAnnotationControl from '$components/FieldAnnotationControl.svelte';
	import FocusedDetailWorkflow, {
		type FocusedDetailMode
	} from '$components/FocusedDetailWorkflow.svelte';
	import GridContentAnnotationsDisplay from '$components/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$components/GridContentAnnotationsEditor.svelte';
	import IconButton from '$components/IconButton.svelte';
	import {
		cloneAnnotations,
		findRemovedDraftAnnotation,
		restoreRemovedDraftAnnotation,
		validateDraftAnnotations,
		type AnnotationRemoval
	} from '$utils/focusedDraft';
	import { toGridJsonPointer } from '$utils/gridContentHelpers';
	import type { JSONPatchDocument, JSONPointer } from 'immutable-json-patch';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentBindPath,
		GridContentField,
		GridContentPatch,
		GridFieldPatchOperation
	} from '$utils/gridContentTypes';

	type PrimitiveFieldValue = string | number;

	interface Props {
		fieldKey: string;
		field: GridContentField;
		// eslint-disable-next-line no-unused-vars
		onTargetDetail?: (invoker: HTMLElement) => void;
		jsonPatchPath?: JSONPointer;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		contextLabel?: string;
		surfaceVariant?: 'standalone' | 'nested';
		onSavePatch?: (
			// eslint-disable-next-line no-unused-vars
			_patch: JSONPatchDocument,
			// eslint-disable-next-line no-unused-vars
			_compatibilityPatches: Array<GridContentPatch>
		) => boolean | void;
		onSaveAnnotations?: (
			// eslint-disable-next-line no-unused-vars
			_annotations: Array<GridContentAnnotation>,
			// eslint-disable-next-line no-unused-vars
			_annotationPath?: GridContentBindPath
		) => void;
		onSaveFocusedPatches?: (
			// eslint-disable-next-line no-unused-vars
			_patches: Array<GridContentPatch>
		) => boolean | void;
	}

	let {
		fieldKey,
		field,
		onTargetDetail,
		jsonPatchPath = undefined,
		annotationEditorConfig = undefined,
		contextLabel = undefined,
		surfaceVariant = 'standalone',
		onSavePatch = undefined,
		onSaveAnnotations = undefined,
		onSaveFocusedPatches = undefined
	}: Props = $props();

	let draft = $state<FieldDraft<PrimitiveFieldValue> | undefined>(undefined);
	let draftValue = $state('');
	let error = $state<string | undefined>(undefined);
	let inputEl = $state<HTMLInputElement>();
	let editButtonEl = $state<HTMLButtonElement>();
	let detailButtonEl = $state<HTMLButtonElement>();
	let focusedOpen = $state(false);
	let focusedMode = $state<FocusedDetailMode>('detail');
	let focusedDraftValue = $state('');
	let focusedDraftAnnotations = $state<Array<GridContentAnnotation>>([]);
	let focusedRemoval = $state<AnnotationRemoval | undefined>();
	let focusedError = $state('');

	const fieldLabel = $derived(field.fieldName ?? fieldKey);
	const actionLabel = $derived(contextLabel ? `${contextLabel} ${fieldLabel}` : fieldLabel);
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
	const isRuntimeField = $derived(field.interaction?.tier === 'runtime');
	const annotationAffordance = $derived(
		field.interaction?.annotationAffordance ?? (isRuntimeField ? 'persistent' : 'badge')
	);
	const annotations = $derived(field.annotations ?? []);
	const shouldRenderAnnotationControl = $derived(
		annotationPatchPath !== undefined ||
			annotations.length > 0 ||
			(annotationAffordance !== 'badge' && onSaveAnnotations !== undefined)
	);
	const currentValue = $derived<PrimitiveFieldValue>(
		typeof field.value === 'number' ? field.value : String(field.value)
	);
	const displayValue = $derived(currentValue === '' ? '___' : String(currentValue));
	const noteCountLabel = $derived(
		`${annotations.length} ${annotations.length === 1 ? 'note' : 'notes'}`
	);

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
		inputEl?.focus({ preventScroll: true });
		if (inputKind === 'text') {
			try {
				inputEl?.select();
			} catch {
				// Non-text inputs do not support select in standard DOM.
			}
		}
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
				const result = onSavePatch?.(
					patch,
					valuePatchPath ? [{ path: valuePatchPath, value: nextDraft.value }] : []
				);
				if (result === false) {
					error = 'Could not save this field.';
					return;
				}
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

	const openFocusedDetail = () => {
		if (onTargetDetail && detailButtonEl) return onTargetDetail(detailButtonEl);
		if (openSmallDetail(false, detailButtonEl)) return;
		focusedMode = 'detail';
		focusedOpen = true;
	};
	const openSmallDetail = (showNotes: boolean, invoker?: HTMLElement, targeted = false): boolean =>
		smallEdit?.openGrid({
			data: { [fieldKey]: field },
			title: fieldLabel,
			annotationEditorConfig,
			showNotes,
			selectedKey: targeted && valuePatchPath ? toGridJsonPointer(valuePatchPath) : undefined,
			onClosed: () => invoker?.focus()
		}) ?? false;

	const beginFocusedEdit = () => {
		focusedDraftValue = String(currentValue);
		focusedDraftAnnotations = cloneAnnotations(annotations);
		focusedRemoval = undefined;
		focusedError = '';
	};

	const updateFocusedAnnotations = (next: Array<GridContentAnnotation>) => {
		focusedRemoval = findRemovedDraftAnnotation(focusedDraftAnnotations, next);
		focusedDraftAnnotations = next;
		focusedError = '';
	};

	const undoFocusedAnnotationRemoval = () => {
		if (!focusedRemoval) return;
		focusedDraftAnnotations = restoreRemovedDraftAnnotation(
			focusedDraftAnnotations,
			focusedRemoval
		);
		focusedRemoval = undefined;
	};

	const saveFocusedEdit = (): boolean => {
		if (!valuePatchPath) {
			focusedError = 'This field is not editable.';
			return false;
		}
		let nextValue: PrimitiveFieldValue;
		if (inputKind === 'number') {
			const parsedValue = Number(focusedDraftValue);
			if (!Number.isFinite(parsedValue)) {
				focusedError = 'Expected a finite number.';
				return false;
			}
			nextValue = parsedValue;
		} else {
			nextValue = focusedDraftValue;
		}
		const annotationError = validateDraftAnnotations(focusedDraftAnnotations);
		if (annotationError) {
			focusedError = annotationError;
			return false;
		}
		const patches: Array<GridContentPatch> = [{ path: valuePatchPath, value: nextValue }];
		if (annotationPatchPath) {
			patches.push({ path: annotationPatchPath, value: cloneAnnotations(focusedDraftAnnotations) });
		}
		try {
			if (onSaveFocusedPatches?.(patches) === false) {
				focusedError = 'Could not save these changes. Review the edited values and try again.';
				return false;
			}
		} catch (error) {
			focusedError = error instanceof Error ? error.message : 'Could not save these changes.';
			return false;
		}
		focusedRemoval = undefined;
		focusedError = '';
		return true;
	};

	const closeFocusedDetail = async () => {
		focusedOpen = false;
		focusedMode = 'detail';
		focusedRemoval = undefined;
		focusedError = '';
		await tick();
		detailButtonEl?.focus();
	};
</script>

{#if isRuntimeField}
	<div
		class={surfaceVariant === 'nested'
			? 'grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-1'
			: 'theme-panel grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2'}
	>
		{#if draft}
			<label class="min-w-0">
				<span class="theme-text-muted block text-xs font-semibold tracking-wide uppercase"
					>{fieldLabel}</span
				>
				<input
					{@attach (element) => {
						inputEl = element;
						return () => {
							if (inputEl === element) inputEl = undefined;
						};
					}}
					class="theme-input touch-target mt-1 h-8 w-full max-w-24 rounded-md border px-2 py-1 text-base font-bold"
					type={inputKind}
					value={draftValue}
					aria-label={actionLabel}
					oninput={onInput}
					onkeydown={onKeydown}
				/>
				{#if field.label}
					<span class="theme-text-muted text-xs italic">({field.label})</span>
				{/if}
			</label>
			<div class="flex min-w-[3.75rem] items-center justify-end gap-1">
				<IconButton
					variant="confirm"
					size="sm"
					ariaLabel={`Confirm ${actionLabel}`}
					onclick={saveEdit}
				/>
				<IconButton
					variant="cancel"
					size="sm"
					ariaLabel={`Cancel editing ${actionLabel}`}
					onclick={cancelEdit}
				/>
			</div>
		{:else}
			<div class="min-w-0">
				<span class="theme-text-muted block text-xs font-semibold tracking-wide uppercase"
					>{fieldLabel}</span
				>
				<span class="runtime-field-value mt-1 flex h-8 items-center text-2xl font-bold tabular-nums"
					>{displayValue}</span
				>
				{#if field.label}
					<span class="theme-text-muted text-xs italic">({field.label})</span>
				{/if}
			</div>
			<div class="flex min-w-[3.75rem] items-center justify-end gap-1">
				<IconButton
					bind:buttonEl={editButtonEl}
					variant="edit"
					size="sm"
					ariaLabel={`Edit ${actionLabel}`}
					onclick={beginEdit}
				/>
				{#if shouldRenderAnnotationControl}
					<FieldAnnotationControl
						{annotations}
						{annotationAffordance}
						{annotationEditorConfig}
						fieldLabel={actionLabel}
						compact={true}
						onOpen={(invoker) => openSmallDetail(true, invoker)}
						onSaveAnnotations={(nextAnnotations) => {
							onSaveAnnotations?.(nextAnnotations, annotationPatchPath);
						}}
					/>
				{/if}
			</div>
		{/if}

		{#if error}
			<p class="theme-error col-span-full text-xs" role="alert">{error}</p>
		{/if}
	</div>
{:else}
	<div
		class="grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border p-2"
	>
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
				<span class="theme-text-muted text-xs font-semibold tracking-wide uppercase"
					>{#if smallEdit?.targeted( { [fieldKey]: field } ) && (smallEdit.entryStyle === 'label' || smallEdit.entryStyle === 'button')}
						<DetailLabelButton
							label={fieldLabel}
							presentation={smallEdit.entryStyle}
							onclick={(event) => {
								const invoker = event.currentTarget as HTMLElement;
								if (onTargetDetail) onTargetDetail(invoker);
								else openSmallDetail(false, invoker, true);
							}}
						/>
					{:else}{fieldLabel}{/if}</span
				>
				{#if annotations.length > 0}<Badge label={noteCountLabel} />{/if}
			</div>
			<span class="mt-1 block truncate font-semibold">{displayValue}</span>
		</div>
		<IconButton
			bind:buttonEl={detailButtonEl}
			variant="detail"
			size="sm"
			ariaLabel={`View ${fieldLabel} details`}
			onclick={openFocusedDetail}
		/>
	</div>

	<FocusedDetailWorkflow
		bind:open={focusedOpen}
		bind:mode={focusedMode}
		title={fieldLabel}
		onBeginEdit={beginFocusedEdit}
		onCancelEdit={beginFocusedEdit}
		onSave={saveFocusedEdit}
		onClosed={closeFocusedDetail}
	>
		{#snippet detail()}
			<div class="space-y-5">
				<section>
					<h3 class="text-sm font-semibold">Authored information</h3>
					<p class="mt-1 whitespace-pre-wrap">{displayValue}</p>
				</section>
				<section>
					<h3 class="text-sm font-semibold">Provenance</h3>
					<p class="theme-text-muted mt-1 text-sm">Character-authored field</p>
				</section>
				<section>
					<h3 class="text-sm font-semibold">Notes</h3>
					<div class="mt-1"><GridContentAnnotationsDisplay {annotations} /></div>
				</section>
				<section>
					<h3 class="text-sm font-semibold">References</h3>
					<p class="theme-text-muted mt-1 text-sm">
						References remain attached to the annotations above.
					</p>
				</section>
			</div>
		{/snippet}
		{#snippet edit()}
			<div class="space-y-4">
				<label class="block space-y-1">
					<span class="text-sm font-semibold">Authored {fieldLabel.toLocaleLowerCase()}</span>
					{#if field.multiline}
						<textarea
							class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
							rows="5"
							bind:value={focusedDraftValue}
						></textarea>
					{:else}
						<input
							class="theme-input touch-target w-full rounded-md border p-2 text-base md:text-sm"
							type={inputKind}
							bind:value={focusedDraftValue}
						/>
					{/if}
				</label>
				<GridContentAnnotationsEditor
					annotations={focusedDraftAnnotations}
					referenceTemplates={annotationEditorConfig?.referenceTemplates}
					defaultKind={annotationEditorConfig?.defaultKind}
					defaultOrigin={annotationEditorConfig?.defaultOrigin}
					onChange={updateFocusedAnnotations}
				/>
				{#if focusedRemoval}
					<button
						type="button"
						class="theme-btn-light touch-target btn rounded-md border px-2 py-1 text-sm"
						onclick={undoFocusedAnnotationRemoval}>Undo annotation removal</button
					>
				{/if}
				{#if focusedError}<p class="theme-error text-sm" role="alert">{focusedError}</p>{/if}
			</div>
		{/snippet}
	</FocusedDetailWorkflow>
{/if}

<style>
	@media (pointer: coarse), (max-width: 767px) {
		.runtime-field-value {
			min-block-size: 44px;
		}
	}
</style>
