<script lang="ts">
	import { asset } from '$app/paths';
	import { tick } from 'svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import GridContentAnnotationsDisplay from '$components/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$components/GridContentAnnotationsEditor.svelte';
	import IconButton from '$components/IconButton.svelte';
	import ReferencePdfViewer, {
		type CuratedPdfSection
	} from '$components/ReferencePdfViewer.svelte';
	import { dnd5e2014ResourceCatalog } from '$lib/resources/dnd5e2014ResourceCatalog';
	import { resolveResourceLocator, type ResourceDisposition } from '$lib/resources/resourceCatalog';
	import type {
		GridAnnotationAffordance,
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentReference
	} from '$utils/gridContentTypes';

	type InternalResourceDisposition = Extract<ResourceDisposition, { kind: 'internal' }>;

	interface Props {
		fieldLabel: string;
		annotations: Array<GridContentAnnotation>;
		annotationAffordance?: GridAnnotationAffordance;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		onSaveAnnotations?: (_annotations: Array<GridContentAnnotation>) => void;
		compact?: boolean;
	}

	let {
		fieldLabel,
		annotations,
		annotationAffordance = 'badge',
		annotationEditorConfig = undefined,
		onSaveAnnotations = undefined,
		compact = false
	}: Props = $props();

	let triggerEl = $state<HTMLButtonElement>();
	let shouldRenderDialog = $state(false);
	let isEditing = $state(false);
	let draftAnnotations = $state<Array<GridContentAnnotation>>([]);
	let activeReference = $state<InternalResourceDisposition>();
	let referenceInvoker = $state<HTMLElement>();

	const annotationCount = $derived(annotations.length);
	const shouldRenderControl = $derived(annotationAffordance !== 'badge' || annotationCount > 0);
	const canEditAnnotations = $derived(onSaveAnnotations !== undefined);
	const curatedSections = $derived(
		activeReference
			? dnd5e2014ResourceCatalog.locators
					.filter(
						(entry) =>
							entry.resourceId === activeReference?.resource.id &&
							entry.kind === 'pdf-page' &&
							entry.health === 'verified' &&
							entry.page !== undefined
					)
					.map((entry): CuratedPdfSection => ({ label: entry.label, page: entry.page! }))
			: []
	);

	const findInternalDisposition = (
		reference: GridContentReference
	): InternalResourceDisposition | undefined => {
		if (reference.kind !== 'pdf' || reference.locator.page === undefined) return undefined;
		const locator = dnd5e2014ResourceCatalog.locators.find(
			(entry) =>
				entry.resourceId === reference.sourceId &&
				entry.kind === 'pdf-page' &&
				entry.health === 'verified'
		);
		if (!locator) return undefined;
		const resolved = resolveResourceLocator(dnd5e2014ResourceCatalog, locator.id, {
			resolveAssetHref: (path) => asset(path as Parameters<typeof asset>[0])
		});
		if (resolved?.kind !== 'internal') return undefined;
		const page = reference.locator.page;
		return {
			...resolved,
			locator: { ...resolved.locator, label: `Page ${page}`, page },
			exactHref: `${resolved.generalHref}#page=${page}`,
			browserHref: `${resolved.generalHref}#page=${page}`
		};
	};

	const canInspectReference = (reference: GridContentReference): boolean =>
		findInternalDisposition(reference) !== undefined;

	const inspectReference = (reference: GridContentReference, invoker: HTMLElement) => {
		const resolved = findInternalDisposition(reference);
		if (!resolved) return;
		referenceInvoker = invoker;
		activeReference = resolved;
	};

	const leaveReference = async () => {
		activeReference = undefined;
		await tick();
		referenceInvoker?.focus();
	};

	const closeDialog = () => {
		shouldRenderDialog = false;
		activeReference = undefined;
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		triggerEl?.focus();
	};

	const openDialog = async () => {
		draftAnnotations = $state.snapshot(annotations);
		isEditing = false;
		activeReference = undefined;
		shouldRenderDialog = true;
	};

	const handleCancel = () => {
		if (activeReference) {
			void leaveReference();
			return false;
		}
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
	{#if compact}
		<span
			class="relative inline-flex"
			class:hover-affordance={annotationAffordance === 'hover' && annotationCount === 0}
		>
			<IconButton
				bind:buttonEl={triggerEl}
				variant="notes"
				size="sm"
				shadingVariant={annotationCount > 0 ? 'dark' : 'light'}
				ariaLabel={`${annotationCount > 0 ? 'View' : 'Add'} notes for ${fieldLabel}${annotationCount > 0 ? `, ${annotationCount} ${annotationCount === 1 ? 'note' : 'notes'}` : ''}`}
				onclick={openDialog}
			/>
			{#if annotationCount > 0}
				<span
					aria-hidden="true"
					class="theme-grid-layer pointer-events-none absolute -top-1 -right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[0.6rem] font-bold leading-none"
				>
					{annotationCount}
				</span>
			{/if}
		</span>
	{:else}
		<button
			bind:this={triggerEl}
			type="button"
			class="theme-btn-light touch-target btn annotation-trigger inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
			class:hover-affordance={annotationAffordance === 'hover' && annotationCount === 0}
			aria-label={`${annotationCount > 0 ? 'View' : 'Add'} notes for ${fieldLabel}`}
			title={`${annotationCount > 0 ? 'View' : 'Add'} notes for ${fieldLabel}`}
			onclick={openDialog}
		>
			<span>Notes</span>
			{#if annotationCount > 0}
				<span
					class="inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[0.65rem] leading-none"
					aria-label={`${annotationCount} ${annotationCount === 1 ? 'note' : 'notes'}`}
				>
					{annotationCount}
				</span>
			{/if}
		</button>
	{/if}
{/if}

{#if shouldRenderDialog}
	<DialogShell
		bind:open={shouldRenderDialog}
		title={activeReference ? activeReference.locator.label : `${fieldLabel} Notes`}
		showBack={activeReference !== undefined}
		onBack={leaveReference}
		onCancel={handleCancel}
		onClose={closeDialog}
		closeText={isEditing ? 'Cancel' : 'Close'}
		fullHeightMobile={activeReference !== undefined}
		wide={activeReference !== undefined}
		scrollAffordance={activeReference === undefined}
	>
		<div hidden={activeReference !== undefined} inert={activeReference !== undefined}>
			<p class="theme-text-muted text-xs mb-3">{fieldLabel}</p>
			{#if isEditing && canEditAnnotations}
				<GridContentAnnotationsEditor
					annotations={draftAnnotations}
					referenceTemplates={annotationEditorConfig?.referenceTemplates}
					defaultKind={annotationEditorConfig?.defaultKind}
					defaultOrigin={annotationEditorConfig?.defaultOrigin}
					onInspectReference={inspectReference}
					{canInspectReference}
					onChange={(nextAnnotations) => {
						draftAnnotations = nextAnnotations;
					}}
				/>
			{:else}
				<GridContentAnnotationsDisplay
					{annotations}
					onInspectReference={inspectReference}
					{canInspectReference}
				/>
			{/if}
		</div>

		{#if activeReference}
			<div class="flex h-[min(64dvh,44rem)] min-h-[18rem]">
				<ReferencePdfViewer
					title={activeReference.resource.title}
					url={activeReference.generalHref}
					browserHref={activeReference.browserHref}
					initialPage={activeReference.locator.page!}
					{curatedSections}
				/>
			</div>
		{/if}

		{#snippet actions()}
			{#if !activeReference && canEditAnnotations && !isEditing}
				<button
					type="button"
					class="theme-btn-light touch-target btn rounded-md border px-3 py-1 font-semibold"
					onclick={() => {
						draftAnnotations = $state.snapshot(annotations);
						isEditing = true;
					}}
				>
					{annotationCount > 0 ? 'Edit notes' : 'Add note'}
				</button>
			{/if}
			{#if !activeReference && canEditAnnotations && isEditing}
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
