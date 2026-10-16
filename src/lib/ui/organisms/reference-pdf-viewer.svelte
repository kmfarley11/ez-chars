<script lang="ts">
	import { tick, untrack } from 'svelte';
	import ReferenceReaderLayout from '$lib/ui/organisms/reference-reader-layout.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import PdfPage from '$lib/ui/organisms/pdf-page.svelte';
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
		onBrowseResources?: () => void;
	}

	let {
		title,
		url,
		browserHref,
		initialPage,
		curatedSections = [],
		loadDocument = openPdfDocument,
		onBrowseResources
	}: Props = $props();

	let tool = $state<'document' | 'find' | 'outline' | 'page'>('document');
	let loaded = $state<OpenPdfDocumentResult>();
	let loading = $state(true);
	let loadError = $state<string>();
	let currentPage = $state(1);
	let pageInput = $state('1');
	let nativeOutline = $state<Array<PdfOutlineEntry>>([]);
	let outlineError = $state(false);
	let viewerWidth = $state(0);
	let findQuery = $state('');
	let findResults = $state<Array<PdfFindResult>>([]);
	let findStatus = $state('');
	let finding = $state(false);
	let findFailed = $state(false);
	let resultsExpanded = $state(true);
	let outlineExpanded = $state(true);
	let findController = $state<AbortController>();
	let loadAttempt = $state(0);
	let documentRegionEl = $state<HTMLDivElement>();
	let pageSlotsEl = $state<HTMLDivElement>();

	const currentBrowserHref = $derived(
		loaded ? `${browserHref.split('#')[0]}#page=${currentPage}` : browserHref
	);
	const totalPages = $derived(loaded?.document.numPages ?? 0);
	const pageNumbers = $derived(Array.from({ length: totalPages }, (_, index) => index + 1));
	const pageWindow = $derived(nearbyPdfPages(currentPage, totalPages || currentPage));
	const pageWindowSet = $derived(new Set(pageWindow));
	const pageScale = $derived(
		viewerWidth > 0 ? Math.min(1.35, Math.max(0.25, (viewerWidth - 40) / 612)) : 0.9
	);
	const resizeDocument = (width: number | null | undefined) => {
		if (!width || width === viewerWidth) return;
		const anchor = currentPage;
		const previousSlot = pageSlotsEl
			?.querySelector<HTMLElement>(`[data-pdf-page-slot="${anchor}"]`)
			?.getBoundingClientRect();
		const previousRegion = documentRegionEl?.getBoundingClientRect();
		const offset =
			previousSlot?.height && previousRegion
				? (previousRegion.top - previousSlot.top) / previousSlot.height
				: undefined;
		viewerWidth = width;
		if (!loaded || offset === undefined) return;
		void tick().then(() => {
			if (!documentRegionEl) return;
			// Keep the page and relative offset through width changes, including phone rotation.
			const slot = pageSlotsEl
				?.querySelector<HTMLElement>(`[data-pdf-page-slot="${anchor}"]`)
				?.getBoundingClientRect();
			if (slot)
				documentRegionEl.scrollTop +=
					slot.top - documentRegionEl.getBoundingClientRect().top + offset * slot.height;
		});
	};

	const scrollPageIntoView = async (page: number) => {
		await tick();
		pageSlotsEl?.querySelector<HTMLElement>(`[data-pdf-page-slot="${page}"]`)?.scrollIntoView({
			block: 'start',
			behavior: 'auto'
		});
	};

	const goToPage = (page: number) => {
		if (!loaded) return;
		tool = 'document';
		currentPage = clampPdfPage(page, loaded.document.numPages);
		pageInput = String(currentPage);
		void scrollPageIntoView(currentPage).then(() => {
			documentRegionEl?.focus({ preventScroll: true });
		});
	};

	const submitPage = () => {
		goToPage(Number(pageInput));
	};

	const submitFind = async () => {
		findController?.abort();
		findController = undefined;
		finding = false;
		findFailed = false;
		if (!loaded || findQuery.trim().length === 0) {
			findResults = [];
			findStatus = 'Enter text to find in this document.';
			return;
		}
		const controller = new AbortController();
		const query = findQuery.trim();
		resultsExpanded = true;
		const isCurrent = () => findController === controller && !controller.signal.aborted;
		findController = controller;
		finding = true;
		findResults = [];
		findStatus = 'Searching the open document…';
		try {
			const results = await findPdfText(loaded.document, query, {
				signal: controller.signal,
				startPage: currentPage,
				onResult: (result) => {
					if (!isCurrent()) return;
					findResults = [...findResults, result].sort((left, right) => left.page - right.page);
					const matches = findResults.reduce((sum, entry) => sum + entry.occurrences, 0);
					findStatus = `Found ${matches} match${matches === 1 ? '' : 'es'} so far; continuing search…`;
				},
				onProgress: (completed, total) => {
					if (!isCurrent()) return;
					if (findResults.length === 0) findStatus = `Searched ${completed} of ${total} pages…`;
				}
			});
			if (!isCurrent()) return;
			findResults = results;
			const matches = results.reduce((sum, result) => sum + result.occurrences, 0);
			findStatus =
				matches === 0
					? `No matches for “${query}”.`
					: `${matches} match${matches === 1 ? '' : 'es'} on ${results.length} page${results.length === 1 ? '' : 's'}.`;
		} catch (error) {
			if (!isCurrent()) return;
			if (error instanceof Error && error.name === 'AbortError') return;
			findFailed = true;
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
		untrack(() => {
			findController?.abort();
			findController = undefined;
		});
		findResults = [];
		findQuery = '';
		findStatus = '';
		findFailed = false;
		finding = false;
		tool = 'document';
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
					const outline = await readPdfOutline(opened.document);
					if (!cancelled) nativeOutline = outline;
				} catch {
					if (!cancelled) outlineError = true;
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
				if (documentRegionEl?.closest('[inert]')) return;
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

{#snippet pageControls()}
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
	</div>
{/snippet}

{#snippet outlineControls()}
	<details class="reference-outline-details" bind:open={outlineExpanded}>
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
					<summary class="touch-target cursor-pointer text-xs font-semibold"> PDF outline </summary>
					<div class="mt-2">{@render renderPdfOutline(nativeOutline)}</div>
				</details>
			{:else if !loading}
				<p class="theme-text-muted text-xs">
					{outlineError ? 'The PDF outline is unavailable.' : 'This PDF has no additional outline.'}
				</p>
			{/if}
		</div>
	</details>
{/snippet}

{#snippet findResultList()}
	<ul class="space-y-2" aria-label="PDF find results">
		{#each findResults as result (result.page)}
			<li>
				<button
					type="button"
					class="theme-link touch-target cursor-pointer text-left text-xs underline"
					onclick={() => goToPage(result.page)}
				>
					Page {result.page} ({result.occurrences}): {#each result.previewParts as part, index (index)}{#if part.match}<mark
								class="rounded-sm bg-yellow-200 text-slate-950">{part.text}</mark
							>{:else}{part.text}{/if}{/each}
				</button>
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet findControls()}
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
	{#if findFailed}
		<a
			class="theme-link touch-target inline-flex items-center underline"
			href={currentBrowserHref}
			target="_blank"
			rel="external noopener noreferrer">Open in browser instead</a
		>
	{/if}
	{#if findResults.length > 0}
		<details bind:open={resultsExpanded}>
			<summary class="touch-target cursor-pointer text-sm font-semibold">
				Results · {findResults.length} matching {findResults.length === 1 ? 'page' : 'pages'}
			</summary>
			{@render findResultList()}
		</details>
	{/if}
{/snippet}

{#snippet documentPages()}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard-scrollable named document region) -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions (Page Up/Down navigate the document region) -->
	<div
		bind:this={documentRegionEl}
		bind:clientWidth={null, resizeDocument}
		class="reference-document-region theme-muted-surface min-w-0 flex-1 overflow-auto rounded-md border p-4"
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
						href={currentBrowserHref}
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
								browserHref={`${browserHref.split('#')[0]}#page=${pageNumber}`}
							/>
						{:else}
							<p class="theme-text-muted grid h-full place-items-center text-sm" aria-hidden="true">
								Page {pageNumber}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<div
	class="reference-pdf-viewer flex min-h-0 min-w-0 flex-1 flex-col gap-3"
	aria-label={`${title} viewer`}
>
	<ReferenceReaderLayout
		{onBrowseResources}
		onOpenOutline={() => (outlineExpanded = true)}
		bind:tool
		{currentPage}
		{totalPages}
		browserHref={currentBrowserHref}
		find={findControls}
		outline={outlineControls}
		pages={pageControls}
	>
		{@render documentPages()}
	</ReferenceReaderLayout>
</div>

<style>
	.reference-document-region {
		min-height: 0;
	}
	.pdf-page-slot {
		width: min(100%, var(--pdf-page-width));
		min-width: 12rem;
		min-height: max(16rem, var(--pdf-page-height));
		margin-inline: auto;
		background: white;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
	}
</style>
