<script lang="ts">
	import { tick } from 'svelte';
	import GridContentAnnotationsDisplay from '$lib/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$lib/GridContentAnnotationsEditor.svelte';
	import type {
		GridAnnotationAffordance,
		GridAnnotationEditorConfig,
		GridContentAnnotation
	} from '$lib/gridContentTypes';

	interface Props {
		fieldLabel: string;
		annotations: Array<GridContentAnnotation>;
		annotationAffordance?: GridAnnotationAffordance;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		onSaveAnnotations?: (_annotations: Array<GridContentAnnotation>) => void;
	}

	let {
		fieldLabel,
		annotations,
		annotationAffordance = 'badge',
		annotationEditorConfig = undefined,
		onSaveAnnotations = undefined
	}: Props = $props();

	let dialogEl = $state<HTMLDialogElement>();
	let triggerEl = $state<HTMLButtonElement>();
	let shouldRenderDialog = $state(false);
	let isEditing = $state(false);
	let draftAnnotations = $state<Array<GridContentAnnotation>>([]);

	const annotationCount = $derived(annotations.length);
	const shouldRenderControl = $derived(annotationAffordance !== 'badge' || annotationCount > 0);
	const canEditAnnotations = $derived(onSaveAnnotations !== undefined);

	const closeDialog = () => {
		dialogEl?.close();
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		shouldRenderDialog = false;
		triggerEl?.focus();
	};

	const openDialog = async () => {
		draftAnnotations = structuredClone(annotations);
		isEditing = false;
		shouldRenderDialog = true;
		await tick();
		dialogEl?.showModal();
	};

	const onCancel = (event?: Event) => {
		if (isEditing) {
			event?.preventDefault();
			draftAnnotations = structuredClone(annotations);
			isEditing = false;
			return;
		}
		closeDialog();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		onSaveAnnotations?.(draftAnnotations);
		isEditing = false;
	};
</script>

{#if shouldRenderControl}
	<button
		bind:this={triggerEl}
		type="button"
		class="theme-btn-light btn annotation-trigger inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
		class:hover-affordance={annotationAffordance === 'hover' && annotationCount === 0}
		aria-label={`${annotationCount > 0 ? 'View' : 'Add'} annotations for ${fieldLabel}`}
		title={`${annotationCount > 0 ? 'View' : 'Add'} annotations for ${fieldLabel}`}
		onclick={openDialog}
	>
		<span>Notes</span>
		{#if annotationCount > 0}
			<span
				class="inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[0.65rem] leading-none"
				aria-label={`${annotationCount} annotations`}
			>
				{annotationCount}
			</span>
		{/if}
	</button>
{/if}

{#if shouldRenderDialog}
	<dialog
		bind:this={dialogEl}
		class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,34rem)] rounded-md border p-0"
		oncancel={onCancel}
		onclick={onBackdropClick}
	>
		<form class="flex flex-col gap-3 p-4" onsubmit={onSubmit}>
			<div class="space-y-1">
				<h3 class="text-lg leading-none font-semibold">Annotations</h3>
				<p class="theme-text-muted text-xs">{fieldLabel}</p>
			</div>

			<div class="max-h-[60vh] overflow-y-auto pr-1">
				{#if isEditing && canEditAnnotations}
					<GridContentAnnotationsEditor
						annotations={draftAnnotations}
						referenceTemplates={annotationEditorConfig?.referenceTemplates}
						defaultKind={annotationEditorConfig?.defaultKind}
						defaultOrigin={annotationEditorConfig?.defaultOrigin}
						onChange={(nextAnnotations) => {
							draftAnnotations = nextAnnotations;
						}}
					/>
				{:else}
					<GridContentAnnotationsDisplay {annotations} />
				{/if}
			</div>

			<div class="mt-1 flex justify-end gap-2">
				<button
					type="button"
					class="theme-btn-light btn rounded-md border px-3 py-1"
					onclick={onCancel}
				>
					{isEditing ? 'Cancel' : 'Close'}
				</button>
				{#if canEditAnnotations && !isEditing}
					<button
						type="button"
						class="theme-btn-light btn rounded-md border px-3 py-1 font-semibold"
						onclick={() => {
							draftAnnotations = structuredClone(annotations);
							isEditing = true;
						}}
					>
						{annotationCount > 0 ? 'Edit' : 'Add'}
					</button>
				{/if}
				{#if canEditAnnotations && isEditing}
					<button
						type="submit"
						class="theme-btn-light btn rounded-md border px-3 py-1 font-semibold"
					>
						Save
					</button>
				{/if}
			</div>
		</form>
	</dialog>
{/if}

<style>
	.hover-affordance {
		opacity: 0;
	}

	.hover-affordance:hover,
	.hover-affordance:focus {
		opacity: 1;
	}

	@media (hover: none) {
		.hover-affordance {
			opacity: 1;
		}
	}
</style>
