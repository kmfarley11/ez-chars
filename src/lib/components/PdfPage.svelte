<script lang="ts">
	import 'pdfjs-dist/web/pdf_viewer.css';
	import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist/types/src/display/api';
	import type { TextLayer } from 'pdfjs-dist/types/src/display/text_layer';
	import type { OpenPdfDocumentResult } from '$lib/resources/pdfViewer';

	interface Props {
		document: PDFDocumentProxy;
		pageNumber: number;
		scale: number;
		TextLayerClass: OpenPdfDocumentResult['TextLayer'];
		current?: boolean;
	}

	let { document, pageNumber, scale, TextLayerClass, current = false }: Props = $props();
	let canvasEl = $state<HTMLCanvasElement>();
	let textLayerEl = $state<HTMLDivElement>();
	let loading = $state(true);
	let errorMessage = $state<string>();
	const isRenderingCancellation = (error: unknown): boolean =>
		typeof error === 'object' &&
		error !== null &&
		'name' in error &&
		error.name === 'RenderingCancelledException';

	$effect(() => {
		if (!canvasEl || !textLayerEl) return;
		let cancelled = false;
		let renderTask: RenderTask | undefined;
		let renderPromise: Promise<void> | undefined;
		let textLayer: TextLayer | undefined;
		let loadedPage: Awaited<ReturnType<PDFDocumentProxy['getPage']>> | undefined;
		loading = true;
		errorMessage = undefined;

		void (async () => {
			try {
				loadedPage = await document.getPage(pageNumber);
				if (cancelled) return;
				const viewport = loadedPage.getViewport({ scale });
				const outputScale = Math.min(window.devicePixelRatio || 1, 2);
				const canvasContext = canvasEl.getContext('2d');
				if (!canvasContext) throw new Error('Canvas rendering is unavailable in this browser.');
				canvasEl.width = Math.floor(viewport.width * outputScale);
				canvasEl.height = Math.floor(viewport.height * outputScale);
				canvasEl.style.width = `${Math.floor(viewport.width)}px`;
				canvasEl.style.height = `${Math.floor(viewport.height)}px`;
				textLayerEl.style.width = `${Math.floor(viewport.width)}px`;
				textLayerEl.style.height = `${Math.floor(viewport.height)}px`;
				const transform = outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0];
				renderTask = loadedPage.render({
					canvas: canvasEl,
					canvasContext,
					viewport,
					transform
				});
				renderPromise = renderTask.promise.catch((error: unknown) => {
					if (isRenderingCancellation(error)) return;
					throw error;
				});
				const textContent = await loadedPage.getTextContent();
				if (cancelled) return;
				textLayer = new TextLayerClass({
					textContentSource: textContent,
					container: textLayerEl,
					viewport
				});
				await Promise.all([renderPromise, textLayer.render()]);
				if (!cancelled) loading = false;
			} catch (error) {
				if (cancelled || isRenderingCancellation(error)) {
					return;
				}
				errorMessage = error instanceof Error ? error.message : 'This page could not be rendered.';
				loading = false;
			}
		})();

		return () => {
			cancelled = true;
			renderTask?.cancel();
			textLayer?.cancel();
			loadedPage?.cleanup();
		};
	});
</script>

<section
	class="pdf-page relative mx-auto bg-white shadow"
	class:pdf-page-current={current}
	aria-label={`PDF page ${pageNumber}${current ? ', current page' : ''}`}
	aria-current={current ? 'page' : undefined}
	data-pdf-page={pageNumber}
>
	{#if loading}
		<p class="absolute inset-x-0 top-3 z-10 text-center text-sm text-slate-700">
			Loading page {pageNumber}…
		</p>
	{/if}
	{#if errorMessage}
		<p class="p-4 text-sm text-red-800" role="alert">Page {pageNumber}: {errorMessage}</p>
	{/if}
	{#key `${pageNumber}-${scale}`}
		<canvas bind:this={canvasEl} aria-hidden="true"></canvas>
		<div
			bind:this={textLayerEl}
			class="textLayer"
			aria-label={`Selectable text for page ${pageNumber}`}
		></div>
	{/key}
</section>

<style>
	.pdf-page {
		width: fit-content;
		min-width: 12rem;
		min-height: 16rem;
	}

	.pdf-page-current {
		outline: 3px solid var(--color-brand);
		outline-offset: 3px;
	}

	.pdf-page canvas {
		display: block;
	}

	.pdf-page :global(.textLayer) {
		inset: 0;
		line-height: 1;
		position: absolute;
		text-align: initial;
		transform-origin: 0 0;
		caret-color: CanvasText;
	}
</style>
