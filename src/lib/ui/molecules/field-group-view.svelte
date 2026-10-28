<script lang="ts">
	import FieldAnnotationControl from '$lib/ui/molecules/field-annotation-control.svelte';
	import GridPrimitiveField from '$lib/ui/molecules/grid-primitive-field.svelte';
	import GridRuntimeFieldGroup from '$lib/ui/molecules/grid-runtime-field-group.svelte';
	import IconButton from '$lib/ui/atoms/icon-button.svelte';
	import DetailLabelButton from '$lib/ui/atoms/detail-label-button.svelte';
	import Badge from '$lib/ui/atoms/badge.svelte';
	import ReadonlyCheckbox from '$lib/ui/atoms/readonly-checkbox.svelte';
	import StatusIndicator from '$lib/ui/atoms/status-indicator.svelte';
	import type { SmallEditEntryStyle } from '$lib/ui/organisms/small-edit-context';
	import { getSmallEditAccess, usesDetailLabels } from '$lib/ui/organisms/small-edit-context';
	const smallEdit = getSmallEditAccess();
	import {
		formatFieldValue,
		getLabeledDisplayParts,
		isDirectEditablePrimitiveField,
		isInlineRuntimeFieldGroup,
		normalizeData
	} from '$lib/utils/gridContentHelpers';
	import { isGridFieldArray, isGridNestedFields } from '$lib/utils/gridFieldGuards';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData,
		GridContentField,
		GridContentPatch,
		GridContentBindPath
	} from '$lib/utils/gridContentTypes';
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
		) => boolean | void;
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
	const contextualLabel = (parent: string, child?: string) =>
		child && child !== parent ? `${parent} ${child}` : parent;

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
		return onFieldSavePatch?.(patch, compatibilityPatches);
	};

	const displayItemClass = $derived(
		displayAlign === 'center' ? 'block w-full text-center' : 'block w-full text-left'
	);

	const inlineNestedFields = (field: GridContentField) =>
		interactive && isInlineRuntimeFieldGroup(field) && isGridNestedFields(field.value)
			? Object.entries(field.value)
			: undefined;
	const hasDetailNoteEntry = (field: GridContentField) =>
		!!onTargetField &&
		!!field.bindPath &&
		usesDetailLabels(smallEdit) &&
		!!smallEdit?.targeted({ field });
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
					{@const primitiveField =
						interactive &&
						!field.displayStatus &&
						field.displayAs !== 'checkbox' &&
						isDirectEditablePrimitiveField(field)}
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
										{displayAlign}
										{annotationEditorConfig}
										onSavePatches={onFocusedSavePatches}
										onSaveAnnotations={savePrimitiveFieldAnnotations}
									/>
								{:else if primitiveField}
									<GridPrimitiveField
										{fieldKey}
										{field}
										{displayAlign}
										{annotationEditorConfig}
										onTargetDetail={onTargetField
											? (invoker) => onTargetField?.(field, invoker)
											: undefined}
										onSavePatch={savePrimitiveFieldPatch}
										onSaveAnnotations={savePrimitiveFieldAnnotations}
										onSaveFocusedPatches={onFocusedSavePatches}
									/>
								{:else if typeof field.value === 'boolean' || field.displayAs === 'checkbox'}
									<span class="inline-flex items-center gap-2 align-middle">
										<ReadonlyCheckbox
											value={typeof field.value === 'boolean' ? field.value : undefined}
											label={fieldLabel}
											explanation={field.displayExplanation}
										/>
										{@render fieldHeading(field)}
									</span>
								{:else if !field.displayStatus && displayPrimitiveMode === 'stacked' && (typeof field.value === 'string' || typeof field.value === 'number')}
									<span class="block min-w-0">
										<span
											class="theme-text-muted block text-xs font-semibold tracking-wide uppercase"
											>{@render fieldHeading(field, false)}</span
										>
										<span class="mt-1 block truncate font-semibold">{formatFieldValue(field)}</span>
									</span>
								{:else if field.displayStatus || (labeledParts && field.displayLayout === 'indicators')}
									<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
										{#if field.displayStatus}
											<StatusIndicator
												mark={field.displayStatus.mark}
												label={`${fieldLabel}: ${field.displayStatus.label}`}
											/>
										{:else}
											{#each (labeledParts ?? []).filter((part) => typeof part.field.value === 'boolean' || part.field.displayAs === 'checkbox') as part, index (`${fieldKey}-indicator-${index}`)}
												<ReadonlyCheckbox
													value={typeof part.field.value === 'boolean'
														? part.field.value
														: undefined}
													label={contextualLabel(fieldLabel, part.field.fieldName ?? part.label)}
													explanation={part.field.displayExplanation}
												/>
											{/each}
										{/if}
										{@render fieldHeading(field, false)}
										{#each (labeledParts ?? []).filter((part) => typeof part.field.value !== 'boolean' && part.field.displayAs !== 'checkbox') as part, index (`${fieldKey}-context-${index}`)}
											<span class="theme-text-muted text-xs" title={part.field.fieldName}
												>{part.value} {part.label}</span
											>
										{/each}
										{#if smallEdit?.enabled}
											{#each labeledParts ?? [] as part, index (`${fieldKey}-notes-${index}`)}{@render fieldNotes(
													part.field,
													part.field.fieldName ?? ''
												)}{/each}
										{/if}
									</span>
								{:else if labeledParts}
									<span
										class={[
											'inline-flex flex-wrap items-baseline gap-x-1 gap-y-0.5',
											displayAlign === 'center' && 'justify-center'
										]}
									>
										{@render fieldHeading(field)}
										{#each labeledParts as part, idx (`${fieldKey}-${idx}`)}
											{#if idx > 0}
												<span aria-hidden="true">/</span>
											{/if}
											<span class="inline-flex flex-wrap items-center gap-1">
												{#if typeof part.field.value === 'boolean' || part.field.displayAs === 'checkbox'}
													<ReadonlyCheckbox
														value={typeof part.field.value === 'boolean'
															? part.field.value
															: undefined}
														label={contextualLabel(fieldLabel, part.label ?? part.field.fieldName)}
														explanation={part.field.displayExplanation}
													/>
												{:else}{part.value}{/if}
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
									<span>{formatFieldValue(field)}</span>
								{/if}
								{#if field.label}
									<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
								{/if}
								<!-- Primitive fields own their in-box note badge/control and Detail entry. -->
								{#if !primitiveField}{@render fieldNotes(field, fieldLabel)}{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#snippet fieldNotes(field: GridContentField, fieldLabel: string)}
	{#if hasDetailNoteEntry(field)}
		{#if field.annotations?.length}
			<span class="ml-1 inline-flex align-middle"
				><Badge
					label={`${field.annotations.length} ${field.annotations.length === 1 ? 'note' : 'notes'}`}
				/></span
			>
		{/if}
	{:else if field.annotationBindPath}
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
			{#if colon && typeof field.value !== 'boolean' && field.displayAs !== 'checkbox'}<span
					>:
				</span>{/if}
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
