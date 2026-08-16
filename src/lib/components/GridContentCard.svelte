<script lang="ts">
	import GridContentActionMenu from '$components/GridContentActionMenu.svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import FieldGroupView from '$components/FieldGroupView.svelte';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData,
		GridContentField,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { JSONPatchDocument } from 'immutable-json-patch';

	interface Props {
		data: GridContentData;
		displayMaxCols?: number;
		displayAlign?: 'left' | 'center';
		displayArrayMode?: 'inline' | 'stack';
		// Optional domain-level annotation behavior injected by page/feature layers.
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		handleEditSave?: (_payload: GridContentData) => void;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches?: (_patches: Array<GridContentPatch>) => void;
		// eslint-disable-next-line no-unused-vars
		handleFieldSavePatch?: (_patch: JSONPatchDocument) => void;
		handleEditCancel?: () => void;
		hideActions?: boolean;
	}

	let {
		data,
		displayMaxCols = 3,
		displayAlign = 'left',
		displayArrayMode = 'inline',
		annotationEditorConfig = undefined,
		handleEditSave,
		handleEditSavePatches,
		handleFieldSavePatch,
		handleEditCancel = undefined,
		hideActions = false
	}: Props = $props();

	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let cardActionsTriggerEl = $state<HTMLButtonElement>();

	const restoreCardActionsFocus = () => {
		cardActionsTriggerEl?.focus();
	};

	const canEdit = $derived(
		Object.keys(data).length > 0 &&
			(handleEditSavePatches !== undefined || handleEditSave !== undefined)
	);

	const handleFieldSaveAnnotations = (
		path: NonNullable<GridContentField['annotationBindPath']>,
		nextAnnotations: Array<GridContentAnnotation>
	) => {
		handleEditSavePatches?.([{ path, value: nextAnnotations }]);
	};
	const savePrimitiveFieldPatch = (
		patch: JSONPatchDocument,
		compatibilityPatches: Array<GridContentPatch>
	) => {
		if (handleFieldSavePatch) {
			handleFieldSavePatch(patch);
			return;
		}
		if (compatibilityPatches.length > 0) {
			handleEditSavePatches?.(compatibilityPatches);
		}
	};
</script>

<div class="grid-content-shell relative min-h-8" role="presentation">
	{#if !hideActions}
		<div class="absolute top-0 right-0">
			<GridContentActionMenu
				{canEdit}
				onEdit={() => (isEditDialogOpen = true)}
				onNotes={() => (isNotesDialogOpen = true)}
				bind:triggerEl={cardActionsTriggerEl}
			/>
			<GridContentEditDialog
				bind:open={isEditDialogOpen}
				{data}
				{handleEditSave}
				{handleEditSavePatches}
				{handleEditCancel}
				onClosed={restoreCardActionsFocus}
			/>
			<GridContentNotesDialog
				bind:open={isNotesDialogOpen}
				{data}
				{annotationEditorConfig}
				{handleEditSavePatches}
				onClosed={restoreCardActionsFocus}
			/>
		</div>
	{/if}
	<div class={hideActions ? '' : 'grid-content-body'}>
		<FieldGroupView
			{data}
			{displayMaxCols}
			{displayAlign}
			{displayArrayMode}
			{annotationEditorConfig}
			onFieldSavePatch={savePrimitiveFieldPatch}
			{handleFieldSaveAnnotations}
		/>
	</div>
</div>

<style>
	.grid-content-body {
		padding-inline-end: 2.25rem;
	}

	@media (pointer: coarse) {
		.grid-content-body {
			padding-inline-end: 3rem;
		}
	}
</style>
