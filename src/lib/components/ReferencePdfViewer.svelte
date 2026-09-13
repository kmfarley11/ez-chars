<script lang="ts">
	import { tick } from 'svelte';
	import { MediaQuery, SvelteMap } from 'svelte/reactivity';
	import BaseButton from '$components/BaseButton.svelte';
	import HorizontalResizeHandle from '$components/HorizontalResizeHandle.svelte';
	import IconMap from '$components/IconMap.svelte';
	import PdfPage from '$components/PdfPage.svelte';
	import { clampResizablePaneSize } from '$components/horizontalResize';
	import {
		clampPdfPage,
		findPdfText,
		nearbyPdfPages,
		openPdfDocument,
		readPdfOutline,
		type OpenPdfDocument,
		type OpenPdfDocumentResult,
		type PdfFindResult,
		type PdfOutlineEntry
	} from '$lib/resources/pdfViewer';

	export type CuratedPdfSection = {
		label: string;
		page: number;
	};

	interface Props {
		title: string;
		url: string;
		browserHref: string;
		initialPage: number;
		curatedSections?: Array<CuratedPdfSection>;
		loadDocument?: OpenPdfDocument;
	}

	let {
		title,
		url,
		browserHref,
		initialPage,
		curatedSections = [],
		loadDocument = openPdfDocument
	}: Props = $props();

	let loaded = $state<OpenPdfDocumentResult>();
	let loading = $state(true);
	let loadError = $state<string>();
	let currentPage = $state(1);
	let pageInput = $state('1');
	let nativeOutline = $state<Array<PdfOutlineEntry>>([]);
	let outlineError = $state(false);
	let layoutWidth = $state(768);
	let viewerWidth = $state(0);
	let requestedNavigationWidth = $state<number>();
	let findQuery = $state('');
	let findResults = $state<Array<PdfFindResult>>([]);
	let findStatus = $state('');
	let finding = $state(false);
	let findController = $state<AbortController>();
	let loadAttempt = $state(0);
	let requestedNavigationCollapsed = $state<boolean>();
	let documentRegionEl = $state<HTMLDivElement>();
	let pageSlotsEl = $state<HTMLDivElement>();

	const totalPages = $derived(loaded?.document.numPages ?? 0);
	const narrowNavigationPresentation = new MediaQuery('(max-width: 1023px)');
	const navigationCollapsed = $derived(
		requestedNavigationCollapsed ?? narrowNavigationPresentation.current
	);
	const navigationUsesCompactRail = $derived(
		navigationCollapsed && !narrowNavigationPresentation.current
	);
	const pageNumbers = $derived(Array.from({ length: totalPages }, (_, index) => index + 1));
	const pageWindow = $derived(nearbyPdfPages(currentPage, totalPages || currentPage));
	const pageWindowSet = $derived(new Set(pageWindow));
	const minimumNavigationWidth = $derived(Math.min(192, layoutWidth));
	const maximumNavigationWidth = $derived(
		Math.max(minimumNavigationWidth, Math.min(384, layoutWidth - 320))
	);
	const defaultNavigationWidth = $derived(
		clampResizablePaneSize(224, minimumNavigationWidth, maximumNavigationWidth)
	);
	const navigationWidth = $derived(
		clampResizablePaneSize(
			requestedNavigationWidth ?? defaultNavigationWidth,
			minimumNavigationWidth,
			maximumNavigationWidth
		)
	);
	const collapsedNavigationWidth = 52;
	const effectiveNavigationWidth = $derived(
		navigationCollapsed ? collapsedNavigationWidth : navigationWidth
	);
	const pageScale = $derived(
		viewerWidth > 0 ? Math.min(1.35, Math.max(0.45, (viewerWidth - 40) / 612)) : 0.9
	);

	const scrollPageIntoView = async (page: number) => {
		await tick();
		pageSlotsEl?.querySelector<HTMLElement>(`[data-pdf-page-slot="${page}"]`)?.scrollIntoView({
			block: 'start',
			behavior: 'auto'
		});
	};

	const goToPage = (page: number) => {
		if (!loaded) return;
		currentPage = clampPdfPage(page, loaded.document.numPages);
		pageInput = String(currentPage);
		void scrollPageIntoView(currentPage);
	};

	const submitPage = () => {
		goToPage(Number(pageInput));
	};

	const submitFind = async () => {
		if (!loaded || findQuery.trim().length === 0) {
			findResults = [];
			findStatus = 'Enter text to find in this document.';
			return;
		}
		findController?.abort();
		const controller = new AbortController();
		findController = controller;
		finding = true;
		findResults = [];
		findStatus = 'Searching the open document…';
		try {
			const results = await findPdfText(loaded.document, findQuery, {
				signal: controller.signal,
				startPage: currentPage,
				onResult: (result) => {
					findResults = [...findResults, result].sort((left, right) => left.page - right.page);
					const matches = findResults.reduce((sum, entry) => sum + entry.occurrences, 0);
					findStatus = `Found ${matches} match${matches === 1 ? '' : 'es'} so far; continuing search…`;
				},
				onProgress: (completed, total) => {
					if (findResults.length === 0) findStatus = `Searching page ${completed} of ${total}…`;
				}
			});
			if (controller.signal.aborted) return;
			findResults = results;
			const matches = results.reduce((sum, result) => sum + result.occurrences, 0);
			findStatus =
				matches === 0
					? `No matches for “${findQuery.trim()}”.`
					: `${matches} match${matches === 1 ? '' : 'es'} on ${results.length} page${results.length === 1 ? '' : 's'}.`;
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') return;
			findStatus = 'Find could not finish. You can still browse the document.';
		} finally {
			if (findController === controller) {
				finding = false;
				findController = undefined;
			}
		}
	};

	const retryLoad = () => {
		loadAttempt += 1;
	};

	$effect(() => {
		const request = { sourceUrl: url, attempt: loadAttempt };
		let cancelled = false;
		let opened: OpenPdfDocumentResult | undefined;
		loading = true;
		loadError = undefined;
		loaded = undefined;
		nativeOutline = [];
		outlineError = false;
		currentPage = initialPage;
		pageInput = String(initialPage);

		void (async () => {
			try {
				opened = await loadDocument(request.sourceUrl);
				if (cancelled) {
					await opened.document.destroy();
					return;
				}
				loaded = opened;
				currentPage = clampPdfPage(initialPage, opened.document.numPages);
				pageInput = String(currentPage);
				loading = false;
				await scrollPageIntoView(currentPage);
				try {
					nativeOutline = await readPdfOutline(opened.document);
				} catch {
					outlineError = true;
				}
			} catch (error) {
				if (cancelled) return;
				loadError = error instanceof Error ? error.message : 'The document could not be opened.';
				loading = false;
			}
		})();

		return () => {
			cancelled = true;
			findController?.abort();
			if (opened) {
				// Let the removal render and invoker-focus restoration complete before PDF.js tears
				// down its worker. Cleanup remains prompt, but cannot monopolize the same microtask.
				setTimeout(() => {
					void opened?.loadingTask.destroy();
				}, 0);
			}
		};
	});

	$effect(() => {
		if (!loaded || !documentRegionEl || !pageSlotsEl) return;
		const visiblePages = new SvelteMap<number, IntersectionObserverEntry>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const page = Number((entry.target as HTMLElement).dataset.pdfPageSlot);
					if (!Number.isInteger(page)) continue;
					if (entry.isIntersecting) visiblePages.set(page, entry);
					else visiblePages.delete(page);
				}

				const nearestVisiblePage = [...visiblePages.entries()].sort((left, right) => {
					const visibleHeightDifference =
						right[1].intersectionRect.height - left[1].intersectionRect.height;
					if (visibleHeightDifference !== 0) return visibleHeightDifference;
					const rootTop = left[1].rootBounds?.top ?? documentRegionEl!.getBoundingClientRect().top;
					return (
						Math.abs(left[1].boundingClientRect.top - rootTop) -
						Math.abs(right[1].boundingClientRect.top - rootTop)
					);
				})[0]?.[0];

				if (nearestVisiblePage && nearestVisiblePage !== currentPage) {
					currentPage = nearestVisiblePage;
					pageInput = String(nearestVisiblePage);
				}
			},
			{
				root: documentRegionEl,
				threshold: [0, 0.25, 0.5, 0.75, 1]
			}
		);

		for (const slot of pageSlotsEl.querySelectorAll<HTMLElement>('[data-pdf-page-slot]')) {
			observer.observe(slot);
		}

		return () => observer.disconnect();
	});
</script>

{#snippet renderPdfOutline(entries: Array<PdfOutlineEntry>)}
	<ul class="space-y-1 border-l pl-2">
		{#each entries as entry (entry)}
			<li class="text-sm">
				{#if entry.children.length > 0}
					<details>
						<summary class="touch-target cursor-pointer py-1">{entry.title}</summary>
						{#if entry.page}
							<button
								type="button"
								class="theme-link touch-target ml-2 cursor-pointer text-left text-xs underline"
								onclick={() => goToPage(entry.page!)}
							>
								Open {entry.title} — page {entry.page}
							</button>
						{/if}
						<div class="mt-1 ml-2">{@render renderPdfOutline(entry.children)}</div>
					</details>
				{:else if entry.page}
					<button
						type="button"
						class="theme-link touch-target cursor-pointer text-left text-sm underline"
						onclick={() => goToPage(entry.page!)}
					>
						{entry.title} — page {entry.page}
					</button>
				{:else}
					<span>{entry.title}</span>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div class="reference-pdf-viewer flex min-h-0 flex-1 flex-col gap-3" aria-label={`${title} viewer`}>
	<div class="flex flex-wrap items-center gap-2" role="toolbar" aria-label="PDF navigation">
		<BaseButton
			size="sm"
			disabled={!loaded || currentPage <= 1}
			ariaLabel="Previous PDF page"
			onclick={() => goToPage(currentPage - 1)}
		>
			Previous
		</BaseButton>
		<form
			class="flex items-center gap-2"
			onsubmit={(event) => {
				event.preventDefault();
				submitPage();
			}}
		>
			<label class="flex items-center gap-2 text-sm">
				<span>Page</span>
				<input
					class="theme-input touch-target w-20 rounded-md border px-2 py-1 text-base md:text-sm"
					type="number"
					min="1"
					max={totalPages || undefined}
					value={pageInput}
					oninput={(event) => {
						pageInput = event.currentTarget.value;
					}}
				/>
			</label>
			<span class="theme-text-muted text-sm">of {totalPages || '…'}</span>
			<BaseButton type="submit" size="sm" disabled={!loaded}>Go</BaseButton>
		</form>
		<BaseButton
			size="sm"
			disabled={!loaded || currentPage >= totalPages}
			ariaLabel="Next PDF page"
			onclick={() => goToPage(currentPage + 1)}
		>
			Next
		</BaseButton>
		<a
			class="theme-btn-light touch-target btn ml-auto inline-flex min-h-9 items-center rounded-md border px-3 py-1.5 text-sm font-semibold"
			href={browserHref}
			target="_blank"
			rel="external noopener noreferrer"
		>
			Open in browser
		</a>
	</div>

	<div
		bind:clientWidth={layoutWidth}
		class="reference-pdf-layout grid min-h-0 flex-1 gap-3"
		style={`--reference-navigation-width: ${effectiveNavigationWidth}px;`}
	>
		<aside
			class="reference-navigation-pane space-y-3 overflow-y-auto rounded-md border p-3"
			class:reference-navigation-pane-collapsed={navigationCollapsed}
			aria-label="PDF navigation details"
		>
			<BaseButton
				size="sm"
				iconOnly={navigationUsesCompactRail}
				classes={navigationUsesCompactRail
					? 'mx-auto min-h-11 min-w-11'
					: 'min-h-11 w-full justify-start px-2'}
				ariaLabel={navigationCollapsed
					? 'Expand document navigation'
					: 'Collapse document navigation'}
				ariaExpanded={!navigationCollapsed}
				ariaControls="reference-document-navigation-content"
				title={navigationCollapsed ? 'Expand document navigation' : 'Collapse document navigation'}
				onclick={() => {
					requestedNavigationCollapsed = !navigationCollapsed;
				}}
			>
				<IconMap classes="h-5 w-5 shrink-0" />
				{#if !navigationUsesCompactRail}
					<span>Outline &amp; find</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="ml-auto h-4 w-4"
						aria-hidden="true"
					>
						{#if narrowNavigationPresentation.current}
							<path d={navigationCollapsed ? 'm6 9 6 6 6-6' : 'm18 15-6-6-6 6'} />
						{:else}
							<path d="m15 18-6-6 6-6" />
						{/if}
					</svg>
				{/if}
			</BaseButton>

			{#if !navigationCollapsed}
				<div id="reference-document-navigation-content" class="space-y-3">
					<details class="reference-outline-details" open>
						<summary class="touch-target cursor-pointer font-semibold">Document outline</summary>
						<div class="mt-2 space-y-2">
							{#if curatedSections.length > 0}
								<p class="theme-text-muted text-xs">Curated sections</p>
								<ul class="space-y-1">
									{#each curatedSections as section (`${section.label}-${section.page}`)}
										<li>
											<button
												type="button"
												class="theme-link touch-target cursor-pointer text-left text-sm underline"
												onclick={() => goToPage(section.page)}
											>
												{section.label} — page {section.page}
											</button>
										</li>
									{/each}
								</ul>
							{/if}
							{#if nativeOutline.length > 0}
								<details>
									<summary class="touch-target cursor-pointer text-xs font-semibold">
										PDF outline
									</summary>
									<div class="mt-2">{@render renderPdfOutline(nativeOutline)}</div>
								</details>
							{:else if !loading}
								<p class="theme-text-muted text-xs">
									{outlineError
										? 'The PDF outline is unavailable.'
										: 'This PDF has no additional outline.'}
								</p>
							{/if}
						</div>
					</details>

					<form
						class="space-y-2"
						onsubmit={(event) => {
							event.preventDefault();
							void submitFind();
						}}
					>
						<label class="block space-y-1 text-sm">
							<span class="font-semibold">Find in document</span>
							<input
								class="theme-input touch-target w-full rounded-md border px-2 py-1 text-base md:text-sm"
								type="search"
								value={findQuery}
								oninput={(event) => {
									findQuery = event.currentTarget.value;
								}}
							/>
						</label>
						<BaseButton type="submit" size="sm" disabled={!loaded || finding}>
							{finding ? 'Finding…' : 'Find'}
						</BaseButton>
					</form>
					<p class="theme-text-muted text-xs" aria-live="polite">{findStatus}</p>
					{#if findResults.length > 0}
						<ul class="space-y-2" aria-label="PDF find results">
							{#each findResults as result (result.page)}
								<li>
									<button
										type="button"
										class="theme-link touch-target cursor-pointer text-left text-xs underline"
										onclick={() => goToPage(result.page)}
									>
										Page {result.page} ({result.occurrences}): {result.preview}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</aside>

		<div class="reference-navigation-resizer">
			<HorizontalResizeHandle
				label="Resize document navigation"
				value={effectiveNavigationWidth}
				min={collapsedNavigationWidth}
				max={maximumNavigationWidth}
				collapsedValue={collapsedNavigationWidth}
				minimumExpandedValue={minimumNavigationWidth}
				classes="h-full w-full"
				onResize={(value) => {
					if (value <= collapsedNavigationWidth) {
						requestedNavigationCollapsed = true;
						return;
					}
					requestedNavigationCollapsed = false;
					requestedNavigationWidth = value;
				}}
			/>
		</div>

		<!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard-scrollable named document region) -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions (Page Up/Down navigate the document region) -->
		<div
			bind:this={documentRegionEl}
			bind:clientWidth={viewerWidth}
			class="reference-document-region theme-muted-surface overflow-auto rounded-md border p-4"
			role="region"
			aria-label={`PDF document pages, current page ${currentPage}`}
			tabindex="0"
			onkeydown={(event) => {
				if (event.key === 'PageDown') {
					event.preventDefault();
					goToPage(currentPage + 1);
				} else if (event.key === 'PageUp') {
					event.preventDefault();
					goToPage(currentPage - 1);
				}
			}}
		>
			{#if loading}
				<p role="status">Opening {title}…</p>
			{:else if loadError}
				<div class="space-y-3" role="alert">
					<p class="font-semibold">The in-app viewer could not open this document.</p>
					<p class="theme-text-muted text-sm">{loadError}</p>
					<div class="flex flex-wrap items-center gap-2">
						<BaseButton size="sm" onclick={retryLoad}>Retry</BaseButton>
						<a
							class="theme-link touch-target inline-flex items-center underline"
							href={browserHref}
							target="_blank"
							rel="external noopener noreferrer"
						>
							Open in browser instead
						</a>
					</div>
				</div>
			{:else if loaded}
				<div bind:this={pageSlotsEl} class="space-y-6">
					{#each pageNumbers as pageNumber (pageNumber)}
						<div
							class="pdf-page-slot"
							data-pdf-page-slot={pageNumber}
							style={`--pdf-page-width: ${612 * pageScale}px; --pdf-page-height: ${792 * pageScale}px;`}
						>
							{#if pageWindowSet.has(pageNumber)}
								<PdfPage
									document={loaded.document}
									{pageNumber}
									scale={pageScale}
									TextLayerClass={loaded.TextLayer}
									current={pageNumber === currentPage}
								/>
							{:else}
								<p
									class="theme-text-muted grid h-full place-items-center text-sm"
									aria-hidden="true"
								>
									Page {pageNumber}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.reference-pdf-layout {
		grid-template-rows: auto minmax(12rem, 1fr);
	}

	.reference-navigation-pane {
		min-height: min(14rem, 34dvh);
		max-height: min(38dvh, 18rem);
	}

	.reference-navigation-pane-collapsed {
		min-height: 0;
		max-height: none;
		overflow: visible;
		padding: 0.25rem;
	}

	.reference-navigation-resizer {
		display: none;
	}

	.reference-document-region {
		min-height: 12rem;
	}

	.pdf-page-slot {
		width: min(100%, var(--pdf-page-width));
		min-width: 12rem;
		min-height: max(16rem, var(--pdf-page-height));
		margin-inline: auto;
		background: white;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
	}

	@media (min-width: 1024px) {
		.reference-pdf-layout {
			grid-template-columns: var(--reference-navigation-width) 1rem minmax(0, 1fr);
			grid-template-rows: minmax(0, 1fr);
		}

		.reference-navigation-pane {
			min-height: 0;
			max-height: none;
		}

		.reference-navigation-resizer {
			display: flex;
			min-height: 0;
		}

		.reference-document-region {
			min-height: 24rem;
		}
	}
</style>
