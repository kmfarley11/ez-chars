<script lang="ts">
	import { resolveAssetUrl } from '$lib/resources/asset-url';
	import type { SheetNavigationHost } from '$lib/navigation/sheet-navigation-host';
	import { tick } from 'svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import HorizontalResizeHandle from '$lib/ui/molecules/horizontal-resize-handle.svelte';
	import PanelSurface from '$lib/ui/molecules/panel-surface.svelte';
	import DialogShell from '$lib/ui/molecules/dialog-shell.svelte';
	import RulesResourceLibrary from '$lib/ui/organisms/rules-resource-library.svelte';
	import ReferencePdfViewer, {
		type CuratedPdfSection
	} from '$lib/ui/organisms/reference-pdf-viewer.svelte';
	import { clampResizablePaneSize } from '$lib/ui/molecules/horizontal-resize';
	import { resolveResourceLocator, type ResourceCatalog } from '$lib/resources/resourceCatalog';
	const {
		navigation,
		catalog,
		systemId
	}: { navigation: SheetNavigationHost; catalog: ResourceCatalog; systemId: string } = $props();

	let headingEl = $state<HTMLHeadingElement>();
	let librarySearchEl = $state<HTMLInputElement>();
	let wasOpen = $state(false);
	let returnFocusId = $state<string>();
	let isLibraryOpen = $state(false);
	let resourceQuery = $state('');
	let viewportWidth = $state(1280);
	let requestedPanelWidth = $state<number>();

	const activeLocatorId = $derived(navigation.activeReferenceId);
	const isOpen = $derived(activeLocatorId !== undefined);
	const minimumPanelWidth = $derived(Math.min(384, viewportWidth));
	const collapsedPanelWidth = 0;
	const maximumPanelWidth = $derived(
		Math.max(minimumPanelWidth, Math.min(1152, viewportWidth - 256))
	);
	const defaultPanelWidth = $derived(
		clampResizablePaneSize(viewportWidth * 0.78, minimumPanelWidth, maximumPanelWidth)
	);
	const panelWidth = $derived(
		clampResizablePaneSize(
			requestedPanelWidth ?? defaultPanelWidth,
			minimumPanelWidth,
			maximumPanelWidth
		)
	);
	const referenceSurfaceWidth = $derived(viewportWidth < 640 ? viewportWidth : panelWidth);
	const disposition = $derived(
		activeLocatorId
			? resolveResourceLocator(catalog, activeLocatorId, {
					resolveAssetHref: (path) => resolveAssetUrl(path)
				})
			: undefined
	);
	const internalViewerConfig = $derived.by(() => {
		if (disposition?.kind === 'internal') {
			return {
				initialPage: disposition.locator.page!,
				browserHref: disposition.browserHref,
				staleLocator: false
			};
		}
		if (disposition?.kind === 'stale' && disposition.safeOpenKind === 'internal') {
			return { initialPage: 1, browserHref: disposition.browserHref, staleLocator: true };
		}
		return undefined;
	});
	const curatedSections = $derived(
		internalViewerConfig && disposition
			? catalog.locators
					.filter(
						(entry) =>
							entry.resourceId === disposition.resource.id &&
							entry.kind === 'pdf-page' &&
							entry.health === 'verified' &&
							entry.page !== undefined
					)
					.map((entry): CuratedPdfSection => ({
						label: entry.label,
						page: entry.page!
					}))
			: []
	);

	const openResourceLibrary = async () => {
		isLibraryOpen = true;
		await tick();
		librarySearchEl?.focus();
	};

	const closeResourceLibrary = async () => {
		isLibraryOpen = false;
		await tick();
		headingEl?.focus();
	};

	const openLibraryReference = async (locatorId: string) => {
		navigation.selectReference(locatorId);
		isLibraryOpen = false;
		await tick();
		headingEl?.focus();
	};

	const closeReference = () => navigation.closeReference();

	$effect(() => {
		if (isOpen && !wasOpen) {
			returnFocusId = navigation.referenceReturnFocusId;
			isLibraryOpen = false;
			void tick().then(() => headingEl?.focus());
		} else if (!isOpen && wasOpen) {
			isLibraryOpen = false;
			const focusId = returnFocusId;
			void tick().then(() => {
				if (!focusId) return;
				const target = document.getElementById(focusId);
				if (target instanceof HTMLElement) target.focus({ preventScroll: true });
			});
		}
		wasOpen = isOpen;
	});
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#snippet referenceContent()}
	<aside
		class="reference-sheet-surface z-40 flex"
		aria-label="Rules reference"
		style:width={`${referenceSurfaceWidth}px`}
	>
		<HorizontalResizeHandle
			label="Resize or close rules reference"
			value={panelWidth}
			min={collapsedPanelWidth}
			max={maximumPanelWidth}
			increaseDirection="left"
			collapsedValue={collapsedPanelWidth}
			minimumExpandedValue={minimumPanelWidth}
			classes="hidden h-full w-4 sm:flex"
			onResize={(value) => {
				if (value <= collapsedPanelWidth) {
					closeReference();
					return;
				}
				requestedPanelWidth = value;
			}}
		/>
		<PanelSurface
			classes="reference-panel m-0 flex h-full min-h-0 min-w-0 flex-1 flex-col rounded-none p-3 shadow-2xl"
		>
			<header class="mb-2 flex shrink-0 items-center gap-2 border-b pb-2">
				<div class="min-w-0 flex-1">
					<h2 bind:this={headingEl} tabindex="-1" class="truncate text-lg font-bold outline-none">
						{isLibraryOpen
							? 'Resource library'
							: (disposition?.resource.title ?? 'Reference unavailable')}
					</h2>
				</div>
				<div class="flex shrink-0 flex-wrap justify-end gap-2">
					{#if isLibraryOpen}
						<BaseButton size="sm" onclick={() => void closeResourceLibrary()}>
							Back to document
						</BaseButton>
					{/if}
					<BaseButton size="sm" ariaLabel="Close rules reference" onclick={closeReference}>
						Close
					</BaseButton>
				</div>
			</header>

			{#if isLibraryOpen}
				<RulesResourceLibrary
					{catalog}
					{systemId}
					bind:query={resourceQuery}
					bind:searchInputEl={librarySearchEl}
					onOpenInternal={(locatorId) => void openLibraryReference(locatorId)}
				/>
			{/if}
			<div
				class="min-h-0 flex-1 flex-col"
				class:flex={!isLibraryOpen}
				hidden={isLibraryOpen}
				inert={isLibraryOpen}
			>
				{#if disposition && internalViewerConfig}
					{#if internalViewerConfig.staleLocator}
						<p class="theme-muted-surface mb-3 rounded-md border p-2 text-sm" role="status">
							The exact page needs review. The verified document opened at its beginning instead.
						</p>
					{/if}
					<ReferencePdfViewer
						onBrowseResources={openResourceLibrary}
						title={disposition.resource.title}
						url={disposition.generalHref}
						browserHref={internalViewerConfig.browserHref}
						initialPage={internalViewerConfig.initialPage}
						{curatedSections}
					/>
				{:else}
					<div class="space-y-3" role="alert">
						<p class="font-semibold">This reference cannot open in the in-app viewer.</p>
						{#if disposition}
							<a
								class="theme-link touch-target inline-flex items-center underline"
								href={disposition.generalHref}
								target="_blank"
								rel="external noopener noreferrer"
							>
								Open source details
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</PanelSurface>
	</aside>
{/snippet}

{#if isOpen}
	<DialogShell
		open
		workspace
		modal={viewportWidth < 640}
		workspaceWidth={referenceSurfaceWidth}
		title="Rules reference"
		onOpened={() => headingEl?.focus()}
		onCancel={() => {
			closeReference();
			return false;
		}}
	>
		{@render referenceContent()}
	</DialogShell>
{/if}

<style>
	.reference-sheet-surface {
		background: var(--color-surface);
		height: 100%;
		max-width: 100%;
	}
	.reference-sheet-surface :global(.reference-panel) {
		border-width: 0;
	}
</style>
