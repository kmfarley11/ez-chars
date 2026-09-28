<script lang="ts">
	import FieldGroupView from '$components/FieldGroupView.svelte';
	import GridContentDetailWorkflow from '$components/GridContentDetailWorkflow.svelte';
	import IconButton from '$components/IconButton.svelte';
	import { getSmallEditAccess } from './smallEditContext';
	import { collectLeafInputs, toGridJsonPointer } from '$utils/gridContentHelpers';
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
		inlineFieldControls?: boolean;
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
		inlineFieldControls = true,
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
	const smallEdit = getSmallEditAccess();
	const openDetail = (field?: GridContentField, invoker?: HTMLElement) => {
		const leaf = field ? collectLeafInputs(field, [field.fieldName ?? 'field'])[0] : undefined;
		const path = leaf?.field.binding?.valuePatchPath ?? leaf?.bindPath;
		if (
			smallEdit?.openGrid({
				data,
				title: focusedTitle,
				annotationEditorConfig,
				selectedKey: path ? toGridJsonPointer(path) : undefined,
				onClosed: invoker ? () => invoker.focus() : restoreCardActionsFocus
			})
		)
			return;
		if (
			field &&
			smallEdit?.openGrid({
				data: { field },
				title: field.fieldName ?? focusedTitle,
				selectedKey: path ? toGridJsonPointer(path) : undefined,
				annotationEditorConfig,
				onClosed: invoker ? () => invoker.focus() : restoreCardActionsFocus
			})
		)
			return;
		legacyInvoker = invoker;
		focusedOpen = true;
	};
	let legacyInvoker: HTMLElement | undefined;
	let cardActionsTriggerEl = $state<HTMLButtonElement>();

	const restoreCardActionsFocus = () => {
		(legacyInvoker ?? cardActionsTriggerEl)?.focus();
		legacyInvoker = undefined;
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
				onclick={() => openDetail()}
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
			onTargetField={smallEdit?.enabled && smallEdit.entryStyle !== 'group'
				? openDetail
				: undefined}
			interactive={inlineFieldControls}
			targetEntryStyle={smallEdit?.entryStyle}
			onFieldSavePatch={savePrimitiveFieldPatch}
			{handleFieldSaveAnnotations}
			onFocusedSavePatches={handleEditSavePatches}
		/>
	</div>
	{#if canOpenFocusedDetail && (!smallEdit?.enabled || focusedOpen)}
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
