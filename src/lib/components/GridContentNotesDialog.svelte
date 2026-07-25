<script lang="ts">
	import { tick } from 'svelte';
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
		open = $bindable(),
		data,
		annotationEditorConfig = undefined,
		handleEditSavePatches,
		onClosed = undefined
	}: Props = $props();

	let helpDialogEl = $state<HTMLDialogElement>();
	let editingHelpAnnotationKey = $state<string | undefined>(undefined);
	let draftHelpAnnotations = $state<Array<GridContentAnnotation>>([]);
	let hasInitialized = $state(false);
	const dialogId = $props.id();
	const headingId = `${dialogId}-heading`;

	const closeNativeDialog = () => {
		if (helpDialogEl?.open) helpDialogEl.close();
		onClosed?.();
	};

	const normalizedData = $derived<GridContentData>(normalizeData(data));
	const helpAnnotationGroups = $derived<Array<HelpAnnotationGroup>>(
		collectHelpAnnotationGroups(normalizedData, {
			includeEditableEmpty: handleEditSavePatches !== undefined
		})
	);

	$effect(() => {
		if (open && !hasInitialized) {
			editingHelpAnnotationKey = undefined;
			draftHelpAnnotations = [];
			hasInitialized = true;
			tick().then(() => {
				if (helpDialogEl && !helpDialogEl.open) {
					helpDialogEl.showModal();
				}
			});
		} else if (!open && hasInitialized) {
			hasInitialized = false;
			editingHelpAnnotationKey = undefined;
			draftHelpAnnotations = [];
			closeNativeDialog();
		}
	});

	const closeHelpDialog = () => {
		open = false;
	};

	const onHelpCancel = () => {
		closeHelpDialog();
	};

	const onHelpBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onHelpCancel();
		}
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
</script>

<dialog
	bind:this={helpDialogEl}
	class="theme-dialog theme-dialog-backdrop z-50 m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	aria-labelledby={headingId}
	oncancel={onHelpCancel}
	onclick={onHelpBackdropClick}
>
	<div class="flex flex-col gap-3 p-4">
		<h2 id={headingId} class="text-lg leading-none font-semibold">Notes</h2>
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
