<script lang="ts">
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
		GridContentPatch,
		GridContentBindPath
	} from '$utils/gridContentTypes';
	import type { JSONPatchDocument } from 'immutable-json-patch';

	interface Props {
		data: GridContentData;
		displayMaxCols?: number;
		displayAlign?: 'left' | 'center';
		displayArrayMode?: 'inline' | 'stack';
		annotationEditorConfig?: GridAnnotationEditorConfig;
		onFieldSavePatch?: (
			/* eslint-disable no-unused-vars */
			_patch: JSONPatchDocument,
			_compatibilityPatches: Array<GridContentPatch>
			/* eslint-enable no-unused-vars */
		) => void;
		handleFieldSaveAnnotations?: (
			/* eslint-disable no-unused-vars */
			_path: GridContentBindPath,
			_annotations: Array<GridContentAnnotation>
			/* eslint-enable no-unused-vars */
		) => void;
	}

	let {
		data,
		displayMaxCols = 3,
		displayAlign = 'left',
		displayArrayMode = 'inline',
		annotationEditorConfig = undefined,
		onFieldSavePatch,
		handleFieldSaveAnnotations
	}: Props = $props();

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
		if (!field.annotationBindPath || !handleFieldSaveAnnotations) return;
		handleFieldSaveAnnotations(field.annotationBindPath, nextAnnotations);
	};

	const savePrimitiveFieldAnnotations = (
		nextAnnotations: Array<GridContentAnnotation>,
		annotationPath?: GridContentBindPath
	) => {
		if (!annotationPath || !handleFieldSaveAnnotations) return;
		handleFieldSaveAnnotations(annotationPath, nextAnnotations);
	};

	const savePrimitiveFieldPatch = (
		patch: JSONPatchDocument,
		compatibilityPatches: Array<GridContentPatch>
	) => {
		onFieldSavePatch?.(patch, compatibilityPatches);
	};

	const displayItemClass = $derived(
		displayAlign === 'center'
			? 'inline-flex items-center justify-center text-center'
			: 'inline-block'
	);
</script>

<div>
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
					<div class={displayAlign === 'center' ? 'flex min-w-0 justify-center' : 'min-w-0'}>
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
										<span class="font-medium">{field.fieldName}</span>
									</span>
								{:else if labeledParts}
									<span class="inline-flex flex-nowrap items-baseline gap-1 whitespace-nowrap">
										<span class="font-medium">{field.fieldName}:</span>
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
									<span class="font-medium">{field.fieldName}:</span>
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
									<span class="font-medium">{field.fieldName}:</span>
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
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
