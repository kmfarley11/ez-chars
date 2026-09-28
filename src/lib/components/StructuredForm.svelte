<script lang="ts">
	import BaseButton from '$components/BaseButton.svelte';
	import ScalarEditInput from './ScalarEditInput.svelte';
	import GridContentAnnotationsEditor from '$components/GridContentAnnotationsEditor.svelte';
	import { collectLeafInputs, normalizeData } from '$utils/gridContentHelpers';
	import {
		appendGridArrayItemAtPath,
		removeGridArrayItemAtPath,
		updateGridAnnotationsAtPath,
		updateGridDataAtPath
	} from '$utils/characterGridHelpers';
	import {
		findRemovedDraftAnnotation,
		restoreRemovedDraftAnnotation,
		type AnnotationRemoval
	} from '$utils/focusedDraft';
	import { displayOrPlaceholder } from '$utils/displayHelpers';
	import { isGridFieldArray } from '$utils/gridFieldGuards';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData,
		GridContentField,
		GridContentPathSegment
	} from '$utils/gridContentTypes';

	interface Props {
		id?: string;
		data: GridContentData;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		showAnnotations?: boolean;
		// eslint-disable-next-line no-unused-vars
		onSave?: (_payload: GridContentData) => void;
	}

	let {
		id = 'structured-form',
		data,
		annotationEditorConfig = undefined,
		showAnnotations = false,
		onSave
	}: Props = $props();

	let draftData = $state<GridContentData>({});
	let previousDataJson = $state<string | undefined>(undefined);
	let pendingRemoval = $state<
		| {
				path: Array<GridContentPathSegment>;
				pathKey: string;
				removal: AnnotationRemoval;
				remaining: Array<GridContentAnnotation>;
		  }
		| undefined
	>(undefined);

	$effect(() => {
		if (data) {
			const currentJson = JSON.stringify(data);
			if (currentJson !== previousDataJson) {
				draftData = structuredClone($state.snapshot(normalizeData(data)));
				previousDataJson = currentJson;
				pendingRemoval = undefined;
			}
		}
	});

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		onSave?.(draftData);
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
		pendingRemoval = undefined;
	};

	const pathKey = (path: ReadonlyArray<GridContentPathSegment>) => path.join('\u001f');

	const updateAnnotations = (
		path: Array<GridContentPathSegment>,
		previous: ReadonlyArray<GridContentAnnotation>,
		next: Array<GridContentAnnotation>
	) => {
		const removal = findRemovedDraftAnnotation(previous, next);
		pendingRemoval = removal
			? { path: [...path], pathKey: pathKey(path), removal, remaining: next }
			: undefined;
		draftData = updateGridAnnotationsAtPath(draftData, path, next);
	};

	const undoAnnotationRemoval = () => {
		if (!pendingRemoval) return;
		const { path, removal, remaining } = pendingRemoval;
		draftData = updateGridAnnotationsAtPath(
			draftData,
			path,
			restoreRemovedDraftAnnotation(remaining, removal)
		);
		pendingRemoval = undefined;
	};

	const isNumberInput = (field: GridContentField) =>
		field.inputKind === 'number' || typeof field.value === 'number';

	const toEditedFieldValue = (field: GridContentField, rawValue: string): string | number => {
		if (!isNumberInput(field)) return rawValue;
		const parsed = Number(rawValue);
		return Number.isFinite(parsed) ? parsed : 0;
	};
</script>

<form {id} class="flex flex-col gap-3" onsubmit={onSubmit}>
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
						class="theme-btn-light touch-target btn rounded-md border px-2 py-0.5 text-xs"
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
									class="theme-btn-light touch-target btn rounded-md border px-2 py-0.5 text-xs"
									onclick={() => removeArrayItem(fieldKey, itemIdx)}
								>
									Remove
								</button>
							</div>
							{#each visibleItemLeafInputs as leaf, leafIdx (`${fieldKey}-${itemIdx}-${leafIdx}-${leaf.path.join('.')}`)}
								<div class="space-y-2 rounded-md border px-2 py-2">
									<div class="space-y-1">
										<span class="theme-text-muted text-xs">
											{leaf.field.fieldName}
											{#if leaf.joinedLabel}
												<span class="theme-text-muted text-xs italic">
													({leaf.joinedLabel})
												</span>
											{/if}
										</span>
										<ScalarEditInput
											presentation="structured"
											label={field.fieldName === leaf.field.fieldName
												? (field.fieldName ?? '')
												: `${field.fieldName} ${leaf.field.fieldName}`}
											kind={typeof leaf.field.value === 'boolean'
												? 'boolean'
												: leaf.field.multiline
													? 'multiline'
													: leaf.field.options && typeof leaf.field.value === 'string'
														? 'select'
														: isNumberInput(leaf.field)
															? 'number'
															: 'text'}
											value={typeof leaf.field.value === 'boolean'
												? leaf.field.value
												: displayOrPlaceholder(leaf.field.value, '')}
											options={leaf.field.options}
											onChange={(value) => {
												draftData = updateGridDataAtPath(
													draftData,
													leaf.path,
													typeof value === 'boolean' ? value : toEditedFieldValue(leaf.field, value)
												);
											}}
										/>
										{#if showAnnotations && leaf.field.annotationBindPath}
											<GridContentAnnotationsEditor
												annotations={leaf.field.annotations ?? []}
												referenceTemplates={annotationEditorConfig?.referenceTemplates}
												defaultKind={annotationEditorConfig?.defaultKind}
												defaultOrigin={annotationEditorConfig?.defaultOrigin}
												onChange={(next) =>
													updateAnnotations(leaf.path, leaf.field.annotations ?? [], next)}
											/>
											{#if pendingRemoval?.pathKey === pathKey(leaf.path)}
												<BaseButton size="sm" onclick={undoAnnotationRemoval}
													>Undo annotation removal</BaseButton
												>
											{/if}
										{/if}
									</div>
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
							<div class="space-y-1">
								<span class="theme-text-muted text-xs">
									{leaf.field.fieldName}
									{#if leaf.joinedLabel}
										<span class="theme-text-muted text-xs italic">
											({leaf.joinedLabel})
										</span>
									{/if}
								</span>
								<ScalarEditInput
									presentation="structured"
									label={field.fieldName === leaf.field.fieldName
										? (field.fieldName ?? '')
										: `${field.fieldName} ${leaf.field.fieldName}`}
									kind={typeof leaf.field.value === 'boolean'
										? 'boolean'
										: leaf.field.multiline
											? 'multiline'
											: leaf.field.options && typeof leaf.field.value === 'string'
												? 'select'
												: isNumberInput(leaf.field)
													? 'number'
													: 'text'}
									value={typeof leaf.field.value === 'boolean'
										? leaf.field.value
										: displayOrPlaceholder(leaf.field.value, '')}
									options={leaf.field.options}
									onChange={(value) => {
										draftData = updateGridDataAtPath(
											draftData,
											leaf.path,
											typeof value === 'boolean' ? value : toEditedFieldValue(leaf.field, value)
										);
									}}
								/>
								{#if showAnnotations && leaf.field.annotationBindPath}
									<GridContentAnnotationsEditor
										annotations={leaf.field.annotations ?? []}
										referenceTemplates={annotationEditorConfig?.referenceTemplates}
										defaultKind={annotationEditorConfig?.defaultKind}
										defaultOrigin={annotationEditorConfig?.defaultOrigin}
										onChange={(next) =>
											updateAnnotations(leaf.path, leaf.field.annotations ?? [], next)}
									/>
									{#if pendingRemoval?.pathKey === pathKey(leaf.path)}
										<BaseButton size="sm" onclick={undoAnnotationRemoval}
											>Undo annotation removal</BaseButton
										>
									{/if}
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</form>
