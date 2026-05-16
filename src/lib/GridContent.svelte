<script lang="ts">
	import { tick } from 'svelte';
	import GridContainer from '$lib/GridContainer.svelte';
	import FieldAnnotationControl from '$lib/FieldAnnotationControl.svelte';
	import GridContentAnnotationsDisplay from '$lib/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$lib/GridContentAnnotationsEditor.svelte';
	import GridContainerAuto from '$lib/GridContainerAuto.svelte';
	import GridPrimitiveField from '$lib/GridPrimitiveField.svelte';
	import MenuButton from '$lib/MenuButton.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import {
		type HelpAnnotationGroup,
		collectHelpAnnotationGroups,
		collectLeafInputs,
		collectValuePatchesFromData,
		formatFieldValue,
		getLabeledDisplayParts,
		isDirectEditablePrimitiveField,
		normalizeData
	} from '$lib/gridContentHelpers';
	import {
		appendGridArrayItemAtPath,
		removeGridArrayItemAtPath,
		updateGridDataAtPath
	} from '$lib/characterGridHelpers';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import { isGridFieldArray } from '$lib/gridFieldGuards';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData,
		GridContentField,
		GridContentPatch
	} from '$lib/gridContentTypes';
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

	let dialogEl = $state<HTMLDialogElement>();
	let helpDialogEl = $state<HTMLDialogElement>();
	let draftData = $state<GridContentData>({});
	let shouldRenderEditDialog = $state(false);
	let shouldRenderHelpDialog = $state(false);
	let editingHelpAnnotationKey = $state<string | undefined>(undefined);
	let draftHelpAnnotations = $state<Array<GridContentAnnotation>>([]);

	const normalizedData = $derived<GridContentData>(normalizeData(data));

	const helpAnnotationGroups = $derived<Array<HelpAnnotationGroup>>(
		collectHelpAnnotationGroups(normalizedData, {
			includeEditableEmpty: handleEditSavePatches !== undefined
		})
	);

	const closeDialog = () => {
		dialogEl?.close();
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		shouldRenderEditDialog = false;
	};

	const closeHelpDialog = () => {
		helpDialogEl?.close();
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		shouldRenderHelpDialog = false;
		editingHelpAnnotationKey = undefined;
		draftHelpAnnotations = [];
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onHelpCancel = () => {
		closeHelpDialog();
	};

	const onOpen = async () => {
		draftData = structuredClone(normalizedData);
		shouldRenderEditDialog = true;
		await tick();
		dialogEl?.showModal();
	};

	const onHelpOpen = async () => {
		editingHelpAnnotationKey = undefined;
		draftHelpAnnotations = [];
		shouldRenderHelpDialog = true;
		await tick();
		helpDialogEl?.showModal();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onHelpBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onHelpCancel();
		}
	};

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		// Preferred path: emit bind-path patches; fallback preserves legacy payload-based integration.
		if (handleEditSavePatches) {
			handleEditSavePatches(
				collectValuePatchesFromData(draftData).map(({ path, value }) => ({ path, value }))
			);
		} else {
			handleEditSave?.(draftData);
		}
		closeDialog();
	};

	const addArrayItem = (fieldKey: string, template: GridContentField) => {
		draftData = appendGridArrayItemAtPath(
			draftData,
			[fieldKey],
			structuredClone($state.snapshot(template))
		);
	};

	const removeArrayItem = (fieldKey: string, itemIdx: number) => {
		draftData = removeGridArrayItemAtPath(draftData, [fieldKey], itemIdx);
	};

	const isNumberInput = (field: GridContentField) =>
		field.inputKind === 'number' || typeof field.value === 'number';

	const toEditedFieldValue = (field: GridContentField, rawValue: string): string | number => {
		if (!isNumberInput(field)) return rawValue;
		const parsed = Number(rawValue);
		return Number.isFinite(parsed) ? parsed : 0;
	};

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

	const beginHelpAnnotationEdit = (group: HelpAnnotationGroup) => {
		if (!group.annotationBindPath) return;
		editingHelpAnnotationKey = group.key;
		draftHelpAnnotations = structuredClone(group.annotations);
	};

	const cancelHelpAnnotationEdit = () => {
		editingHelpAnnotationKey = undefined;
		draftHelpAnnotations = [];
	};

	const saveHelpAnnotations = (group: HelpAnnotationGroup) => {
		if (!group.annotationBindPath) return;
		handleEditSavePatches?.([{ path: group.annotationBindPath, value: draftHelpAnnotations }]);
		cancelHelpAnnotationEdit();
	};

	const displayItemClass = $derived(
		displayAlign === 'center'
			? 'inline-flex items-center justify-center text-center'
			: 'inline-block'
	);
</script>

<div class="grid-content-shell relative min-h-8" role="presentation">
	<div class="absolute top-0 right-0">
		<MenuButton
			iconVariant="ellipsis"
			buttonSize="sm"
			buttonIconOnly
			buttonClasses="rounded-md"
			ariaLabel="Card actions"
			title="Card actions"
		>
			<MenuItemButton onclick={onOpen}>Edit</MenuItemButton>
			<MenuItemButton onclick={onHelpOpen}>Notes</MenuItemButton>
		</MenuButton>
	</div>
	<div class="pr-9">
		<GridContainerAuto maxCols={displayMaxCols} classes="gap-2">
			{#each Object.entries(normalizedData) as [fieldKey, field] (fieldKey)}
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
								<span class="font-semibold">{field.fieldName}:</span>
								<span class="mt-1 block">
									{#if field.value.length === 0}
										<span class="theme-text-muted text-sm italic">No entries yet.</span>
									{:else}
										<ul class="mt-1 list-disc space-y-1 pl-5">
											{#each field.value as arrayEntry, arrayIdx (`${fieldKey}-${arrayIdx}`)}
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
		</GridContainerAuto>
	</div>
</div>

{#if shouldRenderEditDialog}
	<dialog
		bind:this={dialogEl}
		class="theme-dialog theme-dialog-backdrop z-50 m-auto w-[min(92vw,32rem)] rounded-md border p-0"
		oncancel={onCancel}
		onclick={onBackdropClick}
	>
		<form class="flex flex-col gap-3 p-4" onsubmit={onSubmit}>
			<h3 class="text-lg leading-none font-semibold">Edit Fields</h3>
			{#each Object.entries(draftData) as [fieldKey, field] (fieldKey)}
				<div class="space-y-1">
					<div class="flex items-center justify-between gap-2">
						<p class="font-semibold">
							{field.fieldName}
							{#if field.label}
								<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
							{/if}
						</p>
						{#if isGridFieldArray(field.value) && field.addItemTemplate}
							<button
								type="button"
								class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs"
								onclick={() => addArrayItem(fieldKey, field.addItemTemplate!)}
							>
								{field.addItemLabel ?? 'Add'}
							</button>
						{/if}
					</div>
					{#if isGridFieldArray(field.value)}
						<div class="space-y-2">
							{#if field.value.length === 0}
								<p class="theme-text-muted text-xs italic">No entries yet.</p>
							{/if}
							{#each field.value as arrayItem, itemIdx (`${fieldKey}-${itemIdx}`)}
								{@const itemLeafInputs = collectLeafInputs(
									arrayItem,
									[fieldKey, itemIdx],
									undefined,
									field.bindPath,
									itemIdx
								)}
								{@const visibleItemLeafInputs = itemLeafInputs.filter((leaf) => !leaf.field.hidden)}
								<div class="space-y-2 rounded-md border px-2 py-2">
									<div class="flex items-center justify-between gap-2">
										<p class="text-sm font-semibold">
											{arrayItem.fieldName ?? `${field.fieldName} ${itemIdx + 1}`}
										</p>
										<button
											type="button"
											class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs"
											onclick={() => removeArrayItem(fieldKey, itemIdx)}
										>
											Remove
										</button>
									</div>
									{#each visibleItemLeafInputs as leaf, leafIdx (`${fieldKey}-${itemIdx}-${leafIdx}-${leaf.path.join('.')}`)}
										<div class="space-y-2 rounded-md border px-2 py-2">
											<label class="space-y-1">
												<span class="theme-text-muted text-xs">
													{leaf.field.fieldName}
													{#if leaf.joinedLabel}
														<span class="theme-text-muted text-xs italic">
															({leaf.joinedLabel})
														</span>
													{/if}
												</span>
												{#if typeof leaf.field.value === 'boolean'}
													<label class="flex items-center gap-2">
														<input
															class="theme-input h-4 w-4 rounded border"
															type="checkbox"
															checked={leaf.field.value}
															aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
															onchange={(event) => {
																const target = event.currentTarget as HTMLInputElement;
																draftData = updateGridDataAtPath(
																	draftData,
																	leaf.path,
																	target.checked
																);
															}}
														/>
														<span class="theme-text-muted text-xs">Enabled</span>
													</label>
												{:else if leaf.field.multiline}
													<textarea
														class="theme-input w-full rounded-md border px-2 py-1 font-mono text-sm"
														rows="5"
														aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
														oninput={(event) => {
															const target = event.currentTarget as HTMLTextAreaElement;
															draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
														}}>{displayOrPlaceholder(leaf.field.value, '')}</textarea
													>
												{:else if leaf.field.options && typeof leaf.field.value === 'string'}
													<select
														class="theme-input w-full rounded-md border px-2 py-1"
														value={leaf.field.value}
														aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
														onchange={(event) => {
															const target = event.currentTarget as HTMLSelectElement;
															draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
														}}
													>
														{#each leaf.field.options as option (option)}
															<option value={option}>{option}</option>
														{/each}
													</select>
												{:else}
													<input
														class="theme-input w-full rounded-md border px-2 py-1"
														type={isNumberInput(leaf.field) ? 'number' : 'text'}
														step={isNumberInput(leaf.field) ? '1' : undefined}
														value={displayOrPlaceholder(leaf.field.value, '')}
														aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
														oninput={(event) => {
															const target = event.currentTarget as HTMLInputElement;
															draftData = updateGridDataAtPath(
																draftData,
																leaf.path,
																toEditedFieldValue(leaf.field, target.value)
															);
														}}
													/>
												{/if}
											</label>
										</div>
									{/each}
								</div>
							{/each}
						</div>
					{:else}
						{@const leafInputs = collectLeafInputs(field, [fieldKey])}
						<div class="space-y-2">
							{#if leafInputs.length === 0}
								<p class="theme-text-muted text-xs italic">No entries yet.</p>
							{/if}
							{#each leafInputs.filter((leaf) => !leaf.field.hidden) as leaf, idx (`${fieldKey}-${idx}-${leaf.path.join('.')}`)}
								<div class="space-y-2 rounded-md border px-2 py-2">
									<label class="space-y-1">
										<span class="theme-text-muted text-xs">
											{leaf.field.fieldName}
											{#if leaf.joinedLabel}
												<span class="theme-text-muted text-xs italic">
													({leaf.joinedLabel})
												</span>
											{/if}
										</span>
										{#if typeof leaf.field.value === 'boolean'}
											<label class="flex items-center gap-2">
												<input
													class="theme-input h-4 w-4 rounded border"
													type="checkbox"
													checked={leaf.field.value}
													aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
													onchange={(event) => {
														const target = event.currentTarget as HTMLInputElement;
														draftData = updateGridDataAtPath(draftData, leaf.path, target.checked);
													}}
												/>
												<span class="theme-text-muted text-xs">Enabled</span>
											</label>
										{:else if leaf.field.multiline}
											<textarea
												class="theme-input w-full rounded-md border px-2 py-1 font-mono text-sm"
												rows="5"
												aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
												oninput={(event) => {
													const target = event.currentTarget as HTMLTextAreaElement;
													draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
												}}>{displayOrPlaceholder(leaf.field.value, '')}</textarea
											>
										{:else if leaf.field.options && typeof leaf.field.value === 'string'}
											<select
												class="theme-input w-full rounded-md border px-2 py-1"
												value={leaf.field.value}
												aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
												onchange={(event) => {
													const target = event.currentTarget as HTMLSelectElement;
													draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
												}}
											>
												{#each leaf.field.options as option (option)}
													<option value={option}>{option}</option>
												{/each}
											</select>
										{:else}
											<input
												class="theme-input w-full rounded-md border px-2 py-1"
												type={isNumberInput(leaf.field) ? 'number' : 'text'}
												step={isNumberInput(leaf.field) ? '1' : undefined}
												value={displayOrPlaceholder(leaf.field.value, '')}
												aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
												oninput={(event) => {
													const target = event.currentTarget as HTMLInputElement;
													draftData = updateGridDataAtPath(
														draftData,
														leaf.path,
														toEditedFieldValue(leaf.field, target.value)
													);
												}}
											/>
										{/if}
									</label>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
			<div class="mt-1 flex justify-end gap-2">
				<button
					type="button"
					class="theme-btn-light btn rounded-md border px-3 py-1"
					onclick={onCancel}
				>
					Cancel
				</button>
				<button type="submit" class="theme-btn-dark btn rounded-md border px-3 py-1">Save</button>
			</div>
		</form>
	</dialog>
{/if}

{#if shouldRenderHelpDialog}
	<dialog
		bind:this={helpDialogEl}
		class="theme-dialog theme-dialog-backdrop z-50 m-auto w-[min(92vw,32rem)] rounded-md border p-0"
		oncancel={onHelpCancel}
		onclick={onHelpBackdropClick}
	>
		<div class="flex flex-col gap-3 p-4">
			<h3 class="text-lg leading-none font-semibold">Notes</h3>
			{#if helpAnnotationGroups.length === 0}
				<p class="theme-text-muted text-sm">No field notes available.</p>
			{:else}
				<div class="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
					{#each helpAnnotationGroups as group (group.key)}
						<div class="space-y-1 rounded-md border px-2 py-2">
							<div class="flex items-start justify-between gap-2">
								<p class="text-sm font-semibold">
									{group.title}
									{#if group.joinedLabel}
										<span class="theme-text-muted text-xs italic"> ({group.joinedLabel}) </span>
									{/if}
								</p>
								{#if group.annotationBindPath && handleEditSavePatches && editingHelpAnnotationKey !== group.key}
									<button
										type="button"
										class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs"
										onclick={() => beginHelpAnnotationEdit(group)}
									>
										{group.annotations.length > 0 ? 'Edit' : 'Add'}
									</button>
								{/if}
							</div>
							{#if editingHelpAnnotationKey === group.key}
								<GridContentAnnotationsEditor
									annotations={draftHelpAnnotations}
									referenceTemplates={annotationEditorConfig?.referenceTemplates}
									defaultKind={annotationEditorConfig?.defaultKind}
									defaultOrigin={annotationEditorConfig?.defaultOrigin}
									onChange={(nextAnnotations) => {
										draftHelpAnnotations = nextAnnotations;
									}}
								/>
								<div class="mt-2 flex justify-end gap-2">
									<button
										type="button"
										class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs"
										onclick={cancelHelpAnnotationEdit}
									>
										Cancel
									</button>
									<button
										type="button"
										class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs font-semibold"
										onclick={() => saveHelpAnnotations(group)}
									>
										Save
									</button>
								</div>
							{:else}
								<GridContentAnnotationsDisplay annotations={group.annotations} />
							{/if}
						</div>
					{/each}
				</div>
			{/if}
			<div class="mt-1 flex justify-end">
				<button
					type="button"
					class="theme-btn-light btn rounded-md border px-3 py-1"
					onclick={onHelpCancel}
				>
					Close
				</button>
			</div>
		</div>
	</dialog>
{/if}
