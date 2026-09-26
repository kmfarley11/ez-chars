<script lang="ts">
	import { tick } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import FieldGroupView from '$components/FieldGroupView.svelte';
	import FocusedDetailWorkflow, {
		type FocusedDetailMode
	} from '$components/FocusedDetailWorkflow.svelte';
	import GridContentAnnotationsDisplay from '$components/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$components/GridContentAnnotationsEditor.svelte';
	import StructuredForm from '$components/StructuredForm.svelte';
	import {
		cloneAnnotations,
		findRemovedDraftAnnotation,
		restoreRemovedDraftAnnotation,
		validateDraftAnnotations,
		type AnnotationRemoval,
		type DraftCommitResult
	} from '$utils/focusedDraft';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData
	} from '$utils/gridContentTypes';

	type SaveResult = DraftCommitResult<undefined>;

	interface Props {
		open: boolean;
		title: string;
		data: GridContentData;
		annotations?: Array<GridContentAnnotation>;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		provenance?: string;
		referenceSummary?: string;
		wide?: boolean;
		showBrowseBack?: boolean;
		onBrowseBack?: () => void;
		// eslint-disable-next-line no-unused-vars
		onSave: (_data: GridContentData, _annotations: Array<GridContentAnnotation>) => SaveResult;
		onRemove?: () => boolean | void | Promise<boolean | void>;
		removeLabel?: string;
		onClosed?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		data,
		annotations = [],
		annotationEditorConfig = undefined,
		provenance = 'Character-authored record',
		referenceSummary = 'References remain attached to the annotations above.',
		wide = false,
		showBrowseBack = false,
		onBrowseBack = undefined,
		onSave,
		onRemove = undefined,
		removeLabel = 'Remove record',
		onClosed = undefined
	}: Props = $props();

	const uid = $props.id();
	const formId = `${uid}-edit-form`;
	let mode = $state<FocusedDetailMode>('detail');
	let draftAnnotations = $state<Array<GridContentAnnotation>>([]);
	let pendingRemoval = $state<AnnotationRemoval | undefined>();
	let saveError = $state('');
	let removeError = $state('');
	let confirmingRemoval = $state(false);

	const beginEdit = () => {
		draftAnnotations = cloneAnnotations(annotations);
		pendingRemoval = undefined;
		saveError = '';
		confirmingRemoval = false;
		removeError = '';
	};

	const cancelEdit = () => {
		beginEdit();
	};

	const updateAnnotations = (next: Array<GridContentAnnotation>) => {
		pendingRemoval = findRemovedDraftAnnotation(draftAnnotations, next);
		draftAnnotations = next;
		saveError = '';
	};

	const undoAnnotationRemoval = () => {
		if (!pendingRemoval) return;
		draftAnnotations = restoreRemovedDraftAnnotation(draftAnnotations, pendingRemoval);
		pendingRemoval = undefined;
	};

	const save = (draftData: GridContentData) => {
		const annotationError = validateDraftAnnotations(draftAnnotations);
		if (annotationError) {
			saveError = annotationError;
			return;
		}
		const result = onSave(draftData, cloneAnnotations(draftAnnotations));
		if (!result.ok) {
			saveError = result.message;
			return;
		}
		pendingRemoval = undefined;
		saveError = '';
		mode = 'detail';
	};

	const remove = async () => {
		removeError = '';
		try {
			if ((await onRemove?.()) === false) {
				removeError = 'The record could not be removed. Review it and try again.';
				return;
			}
		} catch (error) {
			removeError = error instanceof Error ? error.message : 'The record could not be removed.';
			return;
		}
		confirmingRemoval = false;
		open = false;
		await tick();
	};

	const closed = () => {
		mode = 'detail';
		confirmingRemoval = false;
		removeError = '';
		onClosed?.();
	};
</script>

<FocusedDetailWorkflow
	bind:open
	bind:mode
	{title}
	{wide}
	{showBrowseBack}
	{onBrowseBack}
	onBeginEdit={beginEdit}
	onCancelEdit={cancelEdit}
	onClosed={closed}
>
	{#snippet detail()}
		{#if confirmingRemoval}
			<p role="alert" class="mb-4 rounded-md border border-red-700 p-2 text-sm dark:border-red-300">
				Confirm removal of only this selected record. Other records and their notes remain
				unchanged.
			</p>
		{/if}
		{#if removeError}<p role="alert" class="theme-error mb-4 rounded-md border p-2 text-sm">
				{removeError}
			</p>{/if}
		<div class="space-y-5">
			<section>
				<h3 class="text-sm font-semibold">Authored information</h3>
				<div class="mt-1"><FieldGroupView {data} displayMaxCols={1} interactive={false} /></div>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Provenance</h3>
				<p class="theme-text-muted mt-1 text-sm">{provenance}</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Notes</h3>
				<div class="mt-1"><GridContentAnnotationsDisplay {annotations} /></div>
			</section>
			<section>
				<h3 class="text-sm font-semibold">References</h3>
				<p class="theme-text-muted mt-1 text-sm">{referenceSummary}</p>
			</section>
		</div>
	{/snippet}
	{#snippet edit()}
		<div class="space-y-4">
			<StructuredForm id={formId} {data} onSave={save} />
			<GridContentAnnotationsEditor
				annotations={draftAnnotations}
				referenceTemplates={annotationEditorConfig?.referenceTemplates}
				defaultKind={annotationEditorConfig?.defaultKind}
				defaultOrigin={annotationEditorConfig?.defaultOrigin}
				onChange={updateAnnotations}
			/>
			{#if pendingRemoval}<BaseButton size="sm" onclick={undoAnnotationRemoval}
					>Undo annotation removal</BaseButton
				>{/if}
			{#if saveError}<p class="theme-error text-sm" role="alert">{saveError}</p>{/if}
		</div>
	{/snippet}
	{#snippet detailActions()}
		{#if onRemove}
			{#if confirmingRemoval}
				<BaseButton
					onclick={() => {
						confirmingRemoval = false;
						removeError = '';
					}}>Keep record</BaseButton
				>
				<BaseButton
					classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
					onclick={() => void remove()}>Confirm remove</BaseButton
				>
			{:else}
				<BaseButton
					classes="border-red-700 text-red-700 dark:border-red-300 dark:text-red-300"
					onclick={() => (confirmingRemoval = true)}>{removeLabel}</BaseButton
				>
			{/if}
		{/if}
	{/snippet}
	{#snippet editActions()}
		<button
			type="submit"
			form={formId}
			class="theme-btn-light touch-target btn whitespace-nowrap rounded-lg border px-4 py-2 font-semibold shadow-sm"
		>
			Save
		</button>
	{/snippet}
</FocusedDetailWorkflow>
