<script lang="ts">
	import DialogShell from '$components/DialogShell.svelte';
	import GridContentAnnotationsDisplay from '$components/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$components/GridContentAnnotationsEditor.svelte';
	import type {
		GridAnnotationAffordance,
		GridAnnotationEditorConfig,
		GridContentAnnotation
	} from '$utils/gridContentTypes';

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

	let triggerEl = $state<HTMLButtonElement>();
	let shouldRenderDialog = $state(false);
	let isEditing = $state(false);
	let draftAnnotations = $state<Array<GridContentAnnotation>>([]);

	const annotationCount = $derived(annotations.length);
	const shouldRenderControl = $derived(annotationAffordance !== 'badge' || annotationCount > 0);
	const canEditAnnotations = $derived(onSaveAnnotations !== undefined);

	const closeDialog = () => {
		shouldRenderDialog = false;
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		triggerEl?.focus();
	};

	const openDialog = async () => {
		draftAnnotations = $state.snapshot(annotations);
		isEditing = false;
		shouldRenderDialog = true;
	};

	const handleCancel = () => {
		if (isEditing) {
			draftAnnotations = $state.snapshot(annotations);
			isEditing = false;
			return false; // Prevent closing the dialog
		}
		return true;
	};

	const onSubmit = () => {
		onSaveAnnotations?.(draftAnnotations);
		isEditing = false;
	};
</script>

{#if shouldRenderControl}
	<button
		bind:this={triggerEl}
		type="button"
		class="theme-btn-light touch-target btn annotation-trigger inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
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
	<DialogShell
		bind:open={shouldRenderDialog}
		title="{fieldLabel} Annotations"
		onCancel={handleCancel}
		onClose={closeDialog}
		closeText={isEditing ? 'Cancel' : 'Close'}
		scrollAffordance={true}
	>
		<p class="theme-text-muted text-xs mb-3">{fieldLabel}</p>
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

		{#snippet actions()}
			{#if canEditAnnotations && !isEditing}
				<button
					type="button"
					class="theme-btn-light touch-target btn rounded-md border px-3 py-1 font-semibold"
					onclick={() => {
						draftAnnotations = $state.snapshot(annotations);
						isEditing = true;
					}}
				>
					{annotationCount > 0 ? 'Edit' : 'Add'}
				</button>
			{/if}
			{#if canEditAnnotations && isEditing}
				<button
					type="button"
					class="theme-btn-light touch-target btn rounded-md border px-3 py-1 font-semibold"
					onclick={onSubmit}
				>
					Save
				</button>
			{/if}
		{/snippet}
	</DialogShell>
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
