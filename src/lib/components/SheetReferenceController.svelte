<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import HorizontalResizeHandle from '$components/HorizontalResizeHandle.svelte';
	import PanelSurface from '$components/PanelSurface.svelte';
	import RulesResourceLibrary from '$components/RulesResourceLibrary.svelte';
	import ReferencePdfViewer, {
		type CuratedPdfSection
	} from '$components/ReferencePdfViewer.svelte';
	import { clampResizablePaneSize } from '$components/horizontalResize';
	import { dnd5e2014ResourceCatalog } from '$lib/resources/dnd5e2014ResourceCatalog';
	import { resolveResourceLocator } from '$lib/resources/resourceCatalog';

	let headingEl = $state<HTMLHeadingElement>();
	let librarySearchEl = $state<HTMLInputElement>();
	let wasOpen = $state(false);
	let returnFocusId = $state<string>();
	let isLibraryOpen = $state(false);
	let resourceQuery = $state('');
	let viewportWidth = $state(1280);
	let requestedPanelWidth = $state<number>();

	const stateLocatorId = $derived(page.state.referenceLocatorId);
	const directLocatorId = $derived(
		page.state.referenceDirectDismissed ? null : page.url.searchParams.get('reference')
	);
	const activeLocatorId = $derived(stateLocatorId ?? directLocatorId ?? undefined);
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
			? resolveResourceLocator(dnd5e2014ResourceCatalog, activeLocatorId, {
					resolveAssetHref: (path) => asset(path as Parameters<typeof asset>[0])
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
			? dnd5e2014ResourceCatalog.locators
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
		replaceState('', { ...page.state, referenceLocatorId: locatorId });
		isLibraryOpen = false;
		await tick();
		headingEl?.focus();
	};

	const closeReference = () => {
		if (page.state.referenceOrigin === 'sheet' && page.state.referenceLocatorId) {
			history.back();
			return;
		}
		const rest = { ...page.state };
		delete rest.referenceLocatorId;
		delete rest.referenceOrigin;
		replaceState('', { ...rest, referenceDirectDismissed: true });
	};

	$effect(() => {
		if (isOpen && !wasOpen) {
			returnFocusId = page.state.referenceReturnFocusId;
			isLibraryOpen = false;
			void tick().then(() => headingEl?.focus());
		} else if (!isOpen && wasOpen) {
			isLibraryOpen = false;
			const focusId = returnFocusId;
			void tick().then(() => {
				if (!focusId) return;
				const target = document.getElementById(focusId);
				if (target instanceof HTMLElement) target.focus();
			});
		}
		wasOpen = isOpen;
	});
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#if isOpen}
	<aside
		class="reference-sheet-surface fixed inset-y-0 right-0 z-40 flex"
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
			<header class="mb-3 flex shrink-0 items-center gap-3 border-b pb-3">
				<div class="min-w-0 flex-1">
					<p class="theme-text-muted text-xs font-semibold uppercase tracking-wide">
						Rules reference
					</p>
					<h2 bind:this={headingEl} tabindex="-1" class="truncate text-lg font-bold outline-none">
						{isLibraryOpen
							? 'Resource library'
							: (disposition?.locator.label ?? 'Reference unavailable')}
					</h2>
				</div>
				<div class="flex shrink-0 flex-wrap justify-end gap-2">
					{#if isLibraryOpen}
						<BaseButton size="sm" onclick={() => void closeResourceLibrary()}>
							Back to document
						</BaseButton>
					{:else}
						<BaseButton size="sm" onclick={() => void openResourceLibrary()}>
							Browse resources
						</BaseButton>
					{/if}
					<BaseButton size="sm" ariaLabel="Close rules reference" onclick={closeReference}>
						Close
					</BaseButton>
				</div>
			</header>

			{#if isLibraryOpen}
				<RulesResourceLibrary
					catalog={dnd5e2014ResourceCatalog}
					systemId="dnd5e-2014"
					bind:query={resourceQuery}
					bind:searchInputEl={librarySearchEl}
					onOpenInternal={(locatorId) => void openLibraryReference(locatorId)}
				/>
			{:else if disposition && internalViewerConfig}
				{#if internalViewerConfig.staleLocator}
					<p class="theme-muted-surface mb-3 rounded-md border p-2 text-sm" role="status">
						The exact page needs review. The verified document opened at its beginning instead.
					</p>
				{/if}
				<ReferencePdfViewer
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
		</PanelSurface>
	</aside>
{/if}

<style>
	.reference-sheet-surface {
		background: var(--color-surface);
	}

	.reference-sheet-surface :global(.reference-panel) {
		border-width: 0;
	}

	@media (max-width: 639px) {
		.reference-sheet-surface {
			inset: 0;
			width: 100%;
			height: 100dvh;
		}

		.reference-sheet-surface :global(.reference-panel) {
			border-width: 0;
		}
	}
</style>
