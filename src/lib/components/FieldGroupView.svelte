<script lang="ts">
	import FieldAnnotationControl from '$components/FieldAnnotationControl.svelte';
	import GridPrimitiveField from '$components/GridPrimitiveField.svelte';
	import GridRuntimeFieldGroup from '$components/GridRuntimeFieldGroup.svelte';
	import IconButton from './IconButton.svelte';
	import DetailLabelButton from './DetailLabelButton.svelte';
	import type { SmallEditEntryStyle } from './smallEditContext';
	import { getSmallEditAccess } from './smallEditContext';
	const smallEdit = getSmallEditAccess();
	import {
		formatFieldValue,
		getLabeledDisplayParts,
		isDirectEditablePrimitiveField,
		isInlineRuntimeFieldGroup,
		normalizeData
	} from '$utils/gridContentHelpers';
	import { isGridFieldArray, isGridNestedFields } from '$utils/gridFieldGuards';
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
		// eslint-disable-next-line no-unused-vars
		onTargetField?: (field: GridContentField, invoker: HTMLElement) => void;
		targetEntryStyle?: SmallEditEntryStyle;
		displayMaxCols?: number;
		displayAlign?: 'left' | 'center';
		displayArrayMode?: 'inline' | 'stack';
		displayPrimitiveMode?: 'inline' | 'stacked';
		displaySectionBreakBefore?: string;
		displaySectionBreakLabel?: string;
		interactive?: boolean;
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
		onFocusedSavePatches?: (
			// eslint-disable-next-line no-unused-vars
			_patches: Array<GridContentPatch>
		) => boolean | void;
	}

	let {
		data,
		onTargetField,
		targetEntryStyle = 'label',
		displayMaxCols = 3,
		displayAlign = 'left',
		displayArrayMode = 'inline',
		displayPrimitiveMode = 'inline',
		displaySectionBreakBefore = undefined,
		displaySectionBreakLabel = undefined,
		interactive = true,
		annotationEditorConfig = undefined,
		onFieldSavePatch,
		handleFieldSaveAnnotations,
		onFocusedSavePatches
	}: Props = $props();

	const normalizedData = $derived<GridContentData>(normalizeData(data));
	const displayEntries = $derived(Object.entries(normalizedData));

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
			? 'flex w-full items-center justify-center text-center'
			: 'block w-full'
	);

	const inlineNestedFields = (field: GridContentField) =>
		interactive && isInlineRuntimeFieldGroup(field) && isGridNestedFields(field.value)
			? Object.entries(field.value)
			: undefined;
</script>

<div>
	{#if displayEntries.length > 0}
		<div class="@container/gridcontent">
			<div
				class={displayMaxCols === 1
					? 'grid grid-cols-1 gap-2'
					: displayMaxCols === 2
						? 'grid grid-cols-1 @[400px]/gridcontent:grid-cols-2 gap-2'
						: 'grid grid-cols-1 @[400px]/gridcontent:grid-cols-2 @[600px]/gridcontent:grid-cols-3 gap-2'}
			>
				{#each displayEntries as [fieldKey, field] (fieldKey)}
					{#if fieldKey === displaySectionBreakBefore}
						<div class="col-span-full border-t border-[var(--color-surface-border)] pt-2">
							{#if displaySectionBreakLabel}
								<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">
									{displaySectionBreakLabel}
								</p>
							{/if}
						</div>
					{/if}
					{@const labeledParts = getLabeledDisplayParts(field)}
					{@const fieldLabel = field.fieldName ?? fieldKey}
					{@const runtimeFields = inlineNestedFields(field)}
					<div
						class={displayAlign === 'center'
							? 'flex w-full min-w-0 justify-center'
							: 'w-full min-w-0'}
					>
						<div
							class={displayAlign === 'center' ? 'w-full min-w-0 text-center' : 'w-full min-w-0'}
						>
							<div data-grid-auto-item class={displayItemClass}>
								{#if runtimeFields}
									<GridRuntimeFieldGroup
										label={fieldLabel}
										fields={runtimeFields}
										{annotationEditorConfig}
										onSavePatches={onFocusedSavePatches}
										onSaveAnnotations={savePrimitiveFieldAnnotations}
									/>
								{:else if interactive && isDirectEditablePrimitiveField(field)}
									<GridPrimitiveField
										{fieldKey}
										{field}
										{annotationEditorConfig}
										onTargetDetail={onTargetField
											? (invoker) => onTargetField?.(field, invoker)
											: undefined}
										onSavePatch={savePrimitiveFieldPatch}
										onSaveAnnotations={savePrimitiveFieldAnnotations}
										onSaveFocusedPatches={onFocusedSavePatches}
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
										{@render fieldHeading(field)}
									</span>
								{:else if displayPrimitiveMode === 'stacked' && (typeof field.value === 'string' || typeof field.value === 'number')}
									<span class="block min-w-0">
										<span
											class="theme-text-muted block text-xs font-semibold tracking-wide uppercase"
											>{@render fieldHeading(field, false)}</span
										>
										<span class="mt-1 block truncate font-semibold">{formatFieldValue(field)}</span>
									</span>
								{:else if labeledParts}
									<span class="inline-flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
										{@render fieldHeading(field)}
										{#each labeledParts as part, idx (`${fieldKey}-${idx}`)}
											{#if idx > 0}
												<span aria-hidden="true">/</span>
											{/if}
											<span>
												{part.value}
												{#if part.label}
													<span class="theme-text-muted text-xs italic">
														{#if onTargetField && part.field.bindPath}
															{@render fieldHeading(part.field, false)}
														{:else}&nbsp;{part.label}{/if}
													</span>
												{/if}
												{#if smallEdit?.enabled}{@render fieldNotes(
														part.field,
														part.label ?? ''
													)}{/if}
											</span>
										{/each}
									</span>
								{:else if displayArrayMode === 'stack' && isGridFieldArray(field.value)}
									{@const arrayValue = field.value as GridContentField[]}
									{@render fieldHeading(field)}
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
									{@render fieldHeading(field)}
									{formatFieldValue(field)}
								{/if}
								{#if field.label}
									<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
								{/if}
								{@render fieldNotes(field, fieldLabel)}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#snippet fieldNotes(field: GridContentField, fieldLabel: string)}
	{#if field.annotationBindPath}
		<span class="ml-1 inline-flex align-middle">
			<FieldAnnotationControl
				{fieldLabel}
				annotations={field.annotations ?? []}
				annotationAffordance="badge"
				onOpen={(invoker) =>
					smallEdit?.openGrid({
						data: { field },
						title: fieldLabel,
						annotationEditorConfig,
						showNotes: true,
						onClosed: () => invoker.focus()
					}) ?? false}
				{annotationEditorConfig}
				onSaveAnnotations={(nextAnnotations) => saveFieldAnnotations(field, nextAnnotations)}
			/>
		</span>
	{/if}
{/snippet}

{#snippet fieldHeading(field: GridContentField, colon = true)}
	{#if onTargetField && field.bindPath}
		{#if targetEntryStyle === 'label' || targetEntryStyle === 'button'}
			<DetailLabelButton
				label={field.fieldName ?? ''}
				presentation={targetEntryStyle}
				onclick={(event) => onTargetField?.(field, event.currentTarget as HTMLElement)}
			/>
		{:else}
			<span class="inline-flex items-center gap-1"
				><span class="font-medium">{field.fieldName}</span><IconButton
					variant="detail"
					size="sm"
					ariaLabel={`View ${field.fieldName}`}
					onclick={(event) => onTargetField?.(field, event.currentTarget as HTMLElement)}
				/></span
			>
		{/if}
	{:else}<span class="font-medium"
			>{field.fieldName}{typeof field.value === 'boolean' || !colon ? '' : ':'}</span
		>{/if}
{/snippet}
