<script lang="ts">
	import GridContainer from '$lib/GridContainer.svelte';
	import GridContentAnnotationsDisplay from '$lib/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$lib/GridContentAnnotationsEditor.svelte';
	import GridContainerAuto from '$lib/GridContainerAuto.svelte';
	import {
		type HelpAnnotationGroup,
		collectHelpAnnotationGroups,
		collectLeafInputs,
		collectPatchesFromData,
		formatFieldValue,
		getLabeledDisplayParts,
		normalizeData
	} from '$lib/gridContentHelpers';
	import {
		appendGridArrayItemAtPath,
		removeGridArrayItemAtPath,
		updateGridAnnotationsAtPath,
		updateGridDataAtPath
	} from '$lib/characterGridHelpers';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import { isGridFieldArray } from '$lib/gridFieldGuards';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentField,
		GridContentPatch
	} from '$lib/gridContentTypes';

	interface Props {
		data: GridContentData;
		displayMaxCols?: number;
		// Optional domain-level annotation behavior injected by page/feature layers.
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		handleEditSave?: (_payload: GridContentData) => void;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches?: (_patches: Array<GridContentPatch>) => void;
		handleEditCancel?: () => void;
	}

	let {
		data,
		displayMaxCols = 3,
		annotationEditorConfig = undefined,
		handleEditSave,
		handleEditSavePatches,
		handleEditCancel = undefined
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined;
	let helpDialogEl: HTMLDialogElement | undefined;
	let draftData = $state<GridContentData>({});

	const normalizedData = $derived<GridContentData>(normalizeData(data));

	const helpAnnotationGroups = $derived<Array<HelpAnnotationGroup>>(
		collectHelpAnnotationGroups(normalizedData)
	);

	const closeDialog = () => {
		dialogEl?.close();
	};

	const closeHelpDialog = () => {
		helpDialogEl?.close();
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onHelpCancel = () => {
		closeHelpDialog();
	};

	const onOpen = () => {
		draftData = structuredClone(normalizedData);
		dialogEl?.showModal();
	};

	const onHelpOpen = () => {
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
			handleEditSavePatches(collectPatchesFromData(draftData));
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
</script>

<div class="group relative min-h-8">
	<div
		class="pointer-events-none absolute top-1.5 right-1.5 z-10 flex -translate-y-2 translate-x-2 items-start gap-1.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
	>
		<button
			type="button"
			class="theme-btn-light btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border p-0 leading-none"
			aria-label="Help"
			title="Help"
			onclick={onHelpOpen}
		>
			<span
				class="inline-block h-4 w-4 text-center text-sm leading-4 font-semibold"
				aria-hidden="true"
			>
				?
			</span>
		</button>
		<button
			type="button"
			class="theme-btn-light btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border p-0 leading-none"
			aria-label="Edit"
			title="Edit"
			onclick={onOpen}
		>
			<!-- TODO - consider edits at individual field level rather than group -->
			<svg
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				class="h-4 w-4 stroke-current"
				aria-hidden="true"
			>
				<path d="M12 20h9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
				<path
					d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				></path>
			</svg>
		</button>
	</div>
	<div>
		<GridContainerAuto maxCols={displayMaxCols} classes="gap-2">
			{#each Object.entries(normalizedData) as [fieldKey, field] (fieldKey)}
				{@const labeledParts = getLabeledDisplayParts(field)}
				<GridContainer classes="min-w-0">
					<p class="min-w-0">
						<span data-grid-auto-item class="inline-block">
							{#if typeof field.value === 'boolean'}
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
								<span class="font-semibold">{field.fieldName}:</span>
								{#each labeledParts as part, idx (`${fieldKey}-${idx}`)}
									{#if idx > 0}
										<span aria-hidden="true" class="mx-1">/</span>
									{/if}
									{part.value}
									{#if part.label}
										<span class="theme-text-muted text-xs italic">&nbsp;({part.label})</span>
									{/if}
								{/each}
							{:else}
								<span class="font-semibold">{field.fieldName}:</span>
								{formatFieldValue(field)}
							{/if}
							{#if field.label}
								<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
							{/if}
						</span>
					</p>
				</GridContainer>
			{/each}
		</GridContainerAuto>
	</div>
</div>

<dialog
	bind:this={dialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
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
								{#each itemLeafInputs as leaf, leafIdx (`${fieldKey}-${itemIdx}-${leafIdx}-${leaf.path.join('.')}`)}
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
											{:else}
												<input
													class="theme-input w-full rounded-md border px-2 py-1"
													type={typeof leaf.field.value === 'number' ? 'number' : 'text'}
													step={typeof leaf.field.value === 'number' ? '1' : undefined}
													value={displayOrPlaceholder(leaf.field.value, '')}
													aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
													oninput={(event) => {
														const target = event.currentTarget as HTMLInputElement;
														const parsed = Number(target.value);
														const nextValue =
															typeof leaf.field.value === 'number' && Number.isFinite(parsed)
																? parsed
																: target.value;
														draftData = updateGridDataAtPath(draftData, leaf.path, nextValue);
													}}
												/>
											{/if}
										</label>

										{#if leaf.field.annotationBindPath}
											<GridContentAnnotationsEditor
												annotations={leaf.field.annotations ?? []}
												referenceTemplates={annotationEditorConfig?.referenceTemplates}
												defaultKind={annotationEditorConfig?.defaultKind}
												defaultOrigin={annotationEditorConfig?.defaultOrigin}
												onChange={(nextAnnotations) => {
													draftData = updateGridAnnotationsAtPath(
														draftData,
														leaf.path,
														nextAnnotations
													);
												}}
											/>
										{/if}
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
						{#each leafInputs as leaf, idx (`${fieldKey}-${idx}-${leaf.path.join('.')}`)}
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
									{:else}
										<input
											class="theme-input w-full rounded-md border px-2 py-1"
											type={typeof leaf.field.value === 'number' ? 'number' : 'text'}
											step={typeof leaf.field.value === 'number' ? '1' : undefined}
											value={displayOrPlaceholder(leaf.field.value, '')}
											aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
											oninput={(event) => {
												const target = event.currentTarget as HTMLInputElement;
												const parsed = Number(target.value);
												const nextValue =
													typeof leaf.field.value === 'number' && Number.isFinite(parsed)
														? parsed
														: target.value;
												draftData = updateGridDataAtPath(draftData, leaf.path, nextValue);
											}}
										/>
									{/if}
								</label>

								{#if leaf.field.annotationBindPath}
									<GridContentAnnotationsEditor
										annotations={leaf.field.annotations ?? []}
										referenceTemplates={annotationEditorConfig?.referenceTemplates}
										defaultKind={annotationEditorConfig?.defaultKind}
										defaultOrigin={annotationEditorConfig?.defaultOrigin}
										onChange={(nextAnnotations) => {
											draftData = updateGridAnnotationsAtPath(
												draftData,
												leaf.path,
												nextAnnotations
											);
										}}
									/>
								{/if}
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

<dialog
	bind:this={helpDialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	oncancel={onHelpCancel}
	onclick={onHelpBackdropClick}
>
	<div class="flex flex-col gap-3 p-4">
		<h3 class="text-lg leading-none font-semibold">Help</h3>
		{#if helpAnnotationGroups.length === 0}
			<p class="theme-text-muted text-sm">
				No field annotations available. Add some via the edit menu!
			</p>
		{:else}
			<div class="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
				{#each helpAnnotationGroups as group (group.key)}
					<div class="space-y-1 rounded-md border px-2 py-2">
						<p class="text-sm font-semibold">
							{group.title}
							{#if group.joinedLabel}
								<span class="theme-text-muted text-xs italic"> ({group.joinedLabel}) </span>
							{/if}
						</p>
						<GridContentAnnotationsDisplay annotations={group.annotations} />
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
