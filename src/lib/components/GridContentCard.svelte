<script lang="ts">
	import FieldGroupView from '$components/FieldGroupView.svelte';
	import GridContentDetailWorkflow from '$components/GridContentDetailWorkflow.svelte';
	import IconButton from '$components/IconButton.svelte';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData,
		GridContentField,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import { isInlineRuntimeContent } from '$utils/gridContentHelpers';
	import { isGridFieldArray, isGridNestedFields } from '$utils/gridFieldGuards';

	interface Props {
		data: GridContentData;
		displayMaxCols?: number;
		displayAlign?: 'left' | 'center';
		displayArrayMode?: 'inline' | 'stack';
		displayPrimitiveMode?: 'inline' | 'stacked';
		displaySectionBreakBefore?: string;
		displaySectionBreakLabel?: string;
		detailTitle?: string;
		// Optional domain-level annotation behavior injected by page/feature layers.
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		handleEditSave?: (_payload: GridContentData) => boolean | void;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches?: (_patches: Array<GridContentPatch>) => boolean | void;
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
		displayPrimitiveMode = 'inline',
		displaySectionBreakBefore = undefined,
		displaySectionBreakLabel = undefined,
		detailTitle = undefined,
		annotationEditorConfig = undefined,
		handleEditSave,
		handleEditSavePatches,
		handleFieldSavePatch,
		handleEditCancel = undefined,
		hideActions = false
	}: Props = $props();

	let focusedOpen = $state(false);
	let cardActionsTriggerEl = $state<HTMLButtonElement>();

	const restoreCardActionsFocus = () => {
		cardActionsTriggerEl?.focus();
	};
	const hasFocusedContent = $derived(
		Object.values(data).length > 0 && !Object.values(data).every(isInlineRuntimeContent)
	);
	const canOpenFocusedDetail = $derived(
		hasFocusedContent && (handleEditSavePatches !== undefined || handleEditSave !== undefined)
	);
	const focusedTitle = $derived(
		detailTitle ??
			Object.values(data).find(
				(field) => isGridFieldArray(field.value) || isGridNestedFields(field.value)
			)?.fieldName ??
			'Details'
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
	{#if !hideActions && canOpenFocusedDetail}
		<div class="absolute top-0 right-0">
			<IconButton
				bind:buttonEl={cardActionsTriggerEl}
				variant="detail"
				size="sm"
				ariaLabel={`View ${focusedTitle}`}
				onclick={() => (focusedOpen = true)}
			/>
		</div>
	{/if}
	<div class={hideActions || !canOpenFocusedDetail ? '' : 'grid-content-body'}>
		<FieldGroupView
			{data}
			{displayMaxCols}
			{displayAlign}
			{displayArrayMode}
			{displayPrimitiveMode}
			{displaySectionBreakBefore}
			{displaySectionBreakLabel}
			{annotationEditorConfig}
			onFieldSavePatch={savePrimitiveFieldPatch}
			{handleFieldSaveAnnotations}
			onFocusedSavePatches={handleEditSavePatches}
		/>
	</div>
	{#if canOpenFocusedDetail}
		<GridContentDetailWorkflow
			bind:open={focusedOpen}
			title={focusedTitle}
			{data}
			{annotationEditorConfig}
			onSaveData={handleEditSave}
			onSavePatches={handleEditSavePatches}
			onCancel={handleEditCancel}
			onClosed={restoreCardActionsFocus}
		/>
	{/if}
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
