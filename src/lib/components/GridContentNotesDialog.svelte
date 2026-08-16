<script lang="ts">
	import DialogShell from '$components/DialogShell.svelte';
	import GridContentAnnotationsDisplay from '$components/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$components/GridContentAnnotationsEditor.svelte';
	import {
		type HelpAnnotationGroup,
		collectHelpAnnotationGroups,
		normalizeData
	} from '$utils/gridContentHelpers';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';

	interface Props {
		open: boolean;
		data: GridContentData;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches?: (_patches: Array<GridContentPatch>) => void;
		onClosed?: () => void;
	}

	let {
		open = $bindable(false),
		data,
		annotationEditorConfig = undefined,
		handleEditSavePatches,
		onClosed = undefined
	}: Props = $props();

	let editingHelpAnnotationKey = $state<string | undefined>(undefined);
	let draftHelpAnnotations = $state<Array<GridContentAnnotation>>([]);

	const onDialogShellClose = () => {
		onClosed?.();
	};

	const normalizedData = $derived<GridContentData>(normalizeData(data));
	const helpAnnotationGroups = $derived<Array<HelpAnnotationGroup>>(
		collectHelpAnnotationGroups(normalizedData, {
			includeEditableEmpty: handleEditSavePatches !== undefined
		})
	);

	$effect(() => {
		if (open) {
			editingHelpAnnotationKey = undefined;
			draftHelpAnnotations = [];
		}
	});

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
</script>

<DialogShell
	bind:open
	title="Notes"
	onClose={onDialogShellClose}
	closeText="Close"
	scrollAffordance={true}
>
	{#if open}
		{#if helpAnnotationGroups.length === 0}
			<p class="theme-text-muted text-sm">No field notes available.</p>
		{:else}
			<div class="space-y-2 pr-1">
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
									class="theme-btn-light touch-target btn rounded-md border px-2 py-0.5 text-xs"
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
									class="theme-btn-light touch-target btn rounded-md border px-2 py-0.5 text-xs"
									onclick={cancelHelpAnnotationEdit}
								>
									Cancel
								</button>
								<button
									type="button"
									class="theme-btn-light touch-target btn rounded-md border px-2 py-0.5 text-xs font-semibold"
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
	{/if}
</DialogShell>
