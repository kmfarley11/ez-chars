<script lang="ts">
	import 'pdfjs-dist/web/pdf_viewer.css';
	import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist/types/src/display/api';
	import type { TextLayer } from 'pdfjs-dist/types/src/display/text_layer';
	import type { OpenPdfDocumentResult } from '$lib/resources/pdfViewer';
	import { readPdfText } from '$lib/resources/pdfText';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';

	interface Props {
		document: PDFDocumentProxy;
		pageNumber: number;
		scale: number;
		TextLayerClass: OpenPdfDocumentResult['TextLayer'];
		current?: boolean;
		browserHref: string;
	}

	let {
		document,
		pageNumber,
		scale,
		TextLayerClass,
		current = false,
		browserHref
	}: Props = $props();
	let canvasEl = $state<HTMLCanvasElement>();
	let textLayerEl = $state<HTMLDivElement>();
	let loading = $state(true);
	let errorMessage = $state<string>();
	let attempt = $state(0);
	const isRenderingCancellation = (error: unknown): boolean =>
		typeof error === 'object' &&
		error !== null &&
		'name' in error &&
		error.name === 'RenderingCancelledException';

	$effect(() => {
		attempt;
		if (!canvasEl || !textLayerEl) return;
		const canvas = canvasEl;
		const textContainer = textLayerEl;
		const renderScale = scale;
		const pdf = document;
		const number = pageNumber;
		let cancelled = false;
		const controller = new AbortController();
		let renderTask: RenderTask | undefined;
		let textLayer: TextLayer | undefined;
		let loadedPage: Awaited<ReturnType<PDFDocumentProxy['getPage']>> | undefined;
		loading = true;
		errorMessage = undefined;

		void (async () => {
			try {
				loadedPage = await pdf.getPage(number);
				if (cancelled) {
					loadedPage.cleanup();
					return;
				}
				const viewport = loadedPage.getViewport({ scale: renderScale });
				const outputScale = Math.min(window.devicePixelRatio || 1, 2);
				const canvasContext = canvas.getContext('2d');
				if (!canvasContext) throw new Error('Canvas rendering is unavailable in this browser.');
				canvas.width = Math.floor(viewport.width * outputScale);
				canvas.height = Math.floor(viewport.height * outputScale);
				canvas.style.width = `${Math.floor(viewport.width)}px`;
				canvas.style.height = `${Math.floor(viewport.height)}px`;
				textContainer.replaceChildren();
				textContainer.style.width = `${Math.floor(viewport.width)}px`;
				textContainer.style.height = `${Math.floor(viewport.height)}px`;
				const transform = outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0];
				renderTask = loadedPage.render({
					canvas,
					canvasContext,
					viewport,
					transform
				});
				const textPromise = readPdfText(loadedPage, controller.signal).then(async (textContent) => {
					if (cancelled) return;
					textLayer = new TextLayerClass({
						textContentSource: textContent,
						container: textContainer,
						viewport
					});
					await textLayer.render();
				});
				const [paint, text] = await Promise.allSettled([renderTask.promise, textPromise]);
				if (cancelled) return;
				if (paint.status === 'rejected' && !isRenderingCancellation(paint.reason)) {
					errorMessage = 'This page could not be rendered.';
				} else if (text.status === 'rejected') {
					errorMessage =
						'Page text could not load. The painted page may still be readable; text selection is unavailable.';
				}
				loading = false;
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
			controller.abort();
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
		<div class="relative z-10 bg-white p-3 text-sm text-red-800" role="alert">
			<p>Page {pageNumber}: {errorMessage}</p>
			<div class="flex flex-wrap items-center gap-2">
				<BaseButton size="sm" onclick={() => (attempt += 1)}>Retry page {pageNumber}</BaseButton>
				<a
					class="touch-target inline-flex items-center underline"
					href={browserHref}
					target="_blank"
					rel="external noopener noreferrer">Open page {pageNumber} in browser</a
				>
			</div>
		</div>
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
