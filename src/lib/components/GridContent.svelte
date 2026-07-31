<script lang="ts">
	import GridContainer from '$components/GridContainer.svelte';
	import GridContentActionMenu from '$components/GridContentActionMenu.svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import FieldAnnotationControl from '$components/FieldAnnotationControl.svelte';
	import GridPrimitiveField from '$components/GridPrimitiveField.svelte';
	import {
		formatFieldValue,
		getLabeledDisplayParts,
		isDirectEditablePrimitiveField,
		normalizeData
	} from '$utils/gridContentHelpers';
	import { isGridFieldArray } from '$utils/gridFieldGuards';
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
		handleEditCancel = undefined
	}: Props = $props();

	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let cardActionsTriggerEl = $state<HTMLButtonElement>();

	const normalizedData = $derived<GridContentData>(normalizeData(data));
	const displayEntries = $derived(Object.entries(normalizedData));
	const leadFieldEntries = $derived(
		displayEntries.filter(
			([, field]) =>
				isDirectEditablePrimitiveField(field) && field.interaction?.editAffordance === 'persistent'
		)
	);
	const gridEntries = $derived(
		displayEntries.filter(
			([, field]) =>
				!(
					isDirectEditablePrimitiveField(field) &&
					field.interaction?.editAffordance === 'persistent'
				)
		)
	);

	const saveFieldAnnotations = (
		field: GridContentField,
		nextAnnotations: Array<GridContentAnnotation>
	) => {
		if (!field.annotationBindPath) return;
		handleEditSavePatches?.([{ path: field.annotationBindPath, value: nextAnnotations }]);
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

	const savePrimitiveFieldAnnotations = (
		nextAnnotations: Array<GridContentAnnotation>,
		annotationPath: GridContentField['annotationBindPath']
	) => {
		if (!annotationPath) return;
		handleEditSavePatches?.([{ path: annotationPath, value: nextAnnotations }]);
	};

	const displayItemClass = $derived(
		displayAlign === 'center'
			? 'inline-flex items-center justify-center text-center'
			: 'inline-block'
	);

	const restoreCardActionsFocus = () => {
		cardActionsTriggerEl?.focus();
	};
</script>

<div class="grid-content-shell relative min-h-8" role="presentation">
	<div class="absolute top-0 right-0">
		<GridContentActionMenu
			canEdit={displayEntries.length > 0 &&
				(handleEditSavePatches !== undefined || handleEditSave !== undefined)}
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
	<div class="grid-content-body">
		{#if leadFieldEntries.length > 0}
			<div class={gridEntries.length > 0 ? 'mb-2 grid gap-2 border-b pb-2' : 'grid gap-2'}>
				{#each leadFieldEntries as [fieldKey, field] (fieldKey)}
					<GridPrimitiveField
						{fieldKey}
						{field}
						{annotationEditorConfig}
						onSavePatch={savePrimitiveFieldPatch}
						onSaveAnnotations={savePrimitiveFieldAnnotations}
					/>
				{/each}
			</div>
		{/if}
		{#if gridEntries.length > 0}
			<div class="@container/gridcontent">
				<div
					class={displayMaxCols === 1
						? 'grid grid-cols-1 gap-2'
						: displayMaxCols === 2
							? 'grid grid-cols-1 @[400px]/gridcontent:grid-cols-2 gap-2'
							: 'grid grid-cols-1 @[400px]/gridcontent:grid-cols-2 @[600px]/gridcontent:grid-cols-3 gap-2'}
				>
					{#each gridEntries as [fieldKey, field] (fieldKey)}
						{@const labeledParts = getLabeledDisplayParts(field)}
						{@const fieldLabel = field.fieldName ?? fieldKey}
						<GridContainer
							classes={displayAlign === 'center' ? 'flex min-w-0 justify-center' : 'min-w-0'}
						>
							<div class={displayAlign === 'center' ? 'min-w-0 text-center' : 'min-w-0'}>
								<span data-grid-auto-item class={displayItemClass}>
									{#if isDirectEditablePrimitiveField(field)}
										<GridPrimitiveField
											{fieldKey}
											{field}
											{annotationEditorConfig}
											onSavePatch={savePrimitiveFieldPatch}
											onSaveAnnotations={savePrimitiveFieldAnnotations}
										/>
									{:else if typeof field.value === 'boolean'}
										<span class="inline-flex items-center gap-2 align-middle">
											<input
												class="theme-input theme-checkbox-readonly h-4 w-4 cursor-not-allowed rounded border"
												type="checkbox"
												checked={field.value}
												aria-label={`${field.fieldName}: ${field.value ? 'enabled' : 'disabled'}`}
												disabled
											/>
											<span class="font-semibold">{field.fieldName}</span>
										</span>
									{:else if labeledParts}
										<span class="inline-flex flex-nowrap items-baseline gap-1 whitespace-nowrap">
											<span class="font-semibold">{field.fieldName}:</span>
											{#each labeledParts as part, idx (`${fieldKey}-${idx}`)}
												{#if idx > 0}
													<span aria-hidden="true">/</span>
												{/if}
												<span>
													{part.value}
													{#if part.label}
														<span class="theme-text-muted text-xs italic">&nbsp;{part.label}</span>
													{/if}
												</span>
											{/each}
										</span>
									{:else if displayArrayMode === 'stack' && isGridFieldArray(field.value)}
										{@const arrayValue = field.value as GridContentField[]}
										<span class="font-semibold">{field.fieldName}:</span>
										<span class="mt-1 block">
											{#if arrayValue.length === 0}
												<span class="theme-text-muted text-sm italic">No entries yet.</span>
											{:else}
												<ul class="mt-1 list-disc space-y-1 pl-5">
													{#each arrayValue as arrayEntry, arrayIdx (`${fieldKey}-${arrayIdx}`)}
														<li>{formatFieldValue(arrayEntry, '___', ' ')}</li>
													{/each}
												</ul>
											{/if}
										</span>
									{:else}
										<span class="font-semibold">{field.fieldName}:</span>
										{formatFieldValue(field)}
									{/if}
									{#if field.label}
										<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
									{/if}
									{#if field.annotationBindPath}
										<span class="ml-1 inline-flex align-middle">
											<FieldAnnotationControl
												{fieldLabel}
												annotations={field.annotations ?? []}
												annotationAffordance="badge"
												{annotationEditorConfig}
												onSaveAnnotations={(nextAnnotations) => {
													saveFieldAnnotations(field, nextAnnotations);
												}}
											/>
										</span>
									{/if}
								</span>
							</div>
						</GridContainer>
					{/each}
				</div>
			</div>
		{/if}
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
