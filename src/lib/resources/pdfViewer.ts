import type {
	PDFDocumentLoadingTask,
	PDFDocumentProxy,
	TextItem
} from 'pdfjs-dist/types/src/display/api';
import { pdfJsAssetUrls } from './pdfJsAssets';
import { readPdfText } from './pdfText';
import { createPdfFindPreview, type PdfPreviewPart } from './pdfFindPreview';

type PdfJsModule = typeof import('pdfjs-dist');

export type OpenPdfDocumentResult = {
	document: PDFDocumentProxy;
	loadingTask: PDFDocumentLoadingTask;
	TextLayer: PdfJsModule['TextLayer'];
};

export type OpenPdfDocument = (url: string) => Promise<OpenPdfDocumentResult>;

export const openPdfDocument: OpenPdfDocument = async (url) => {
	const pdfjs = (await import(/* @vite-ignore */ pdfJsAssetUrls.moduleSrc)) as PdfJsModule;
	pdfjs.GlobalWorkerOptions.workerSrc = pdfJsAssetUrls.workerSrc;
	const loadingTask = pdfjs.getDocument({
		url,
		cMapUrl: pdfJsAssetUrls.cMapUrl,
		cMapPacked: true,
		iccUrl: pdfJsAssetUrls.iccUrl,
		standardFontDataUrl: pdfJsAssetUrls.standardFontDataUrl,
		wasmUrl: pdfJsAssetUrls.wasmUrl
	});

	try {
		return { document: await loadingTask.promise, loadingTask, TextLayer: pdfjs.TextLayer };
	} catch (error) {
		await loadingTask.destroy();
		throw error;
	}
};

export type PdfOutlineEntry = {
	title: string;
	page?: number;
	children: Array<PdfOutlineEntry>;
};

type NativeOutlineEntry = Awaited<ReturnType<PDFDocumentProxy['getOutline']>>[number];

const resolveOutlineDestinationPage = async (
	document: PDFDocumentProxy,
	destination: NativeOutlineEntry['dest']
): Promise<number | undefined> => {
	const resolved =
		typeof destination === 'string' ? await document.getDestination(destination) : destination;
	if (!resolved || resolved.length === 0) return undefined;
	const pageReference = resolved[0];
	if (typeof pageReference === 'number') return pageReference + 1;
	if (!pageReference || typeof pageReference !== 'object') return undefined;
	return (await document.getPageIndex(pageReference)) + 1;
};

export const readPdfOutline = async (
	document: PDFDocumentProxy
): Promise<Array<PdfOutlineEntry>> => {
	const outline = (await document.getOutline()) ?? [];
	const mapEntry = async (entry: NativeOutlineEntry): Promise<PdfOutlineEntry> => ({
		title: entry.title,
		page: await resolveOutlineDestinationPage(document, entry.dest),
		children: await Promise.all(entry.items.map(mapEntry))
	});
	return Promise.all(outline.map(mapEntry));
};

export type PdfFindResult = {
	page: number;
	occurrences: number;
	preview: string;
	previewParts: PdfPreviewPart[];
};

export const findPdfText = async (
	document: PDFDocumentProxy,
	query: string,
	options: {
		signal?: AbortSignal;
		onProgress?: (completedPages: number, totalPages: number) => void;
		onResult?: (result: PdfFindResult) => void;
		startPage?: number;
	} = {}
): Promise<Array<PdfFindResult>> => {
	if (query.trim().length === 0) return [];
	const results: Array<PdfFindResult> = [];
	const startPage = clampPdfPage(options.startPage ?? 1, document.numPages);
	const pageNumbers = [
		...Array.from({ length: document.numPages - startPage + 1 }, (_, index) => startPage + index),
		...Array.from({ length: startPage - 1 }, (_, index) => index + 1)
	];
	let nextPageIndex = 0;
	let completedPages = 0;
	const workerCount = Math.min(6, document.numPages);
	const controller = new AbortController();
	const abort = () => controller.abort();
	options.signal?.addEventListener('abort', abort, { once: true });
	if (options.signal?.aborted) abort();

	const inspectPages = async () => {
		while (nextPageIndex < pageNumbers.length) {
			controller.signal.throwIfAborted();
			const pageNumber = pageNumbers[nextPageIndex];
			nextPageIndex += 1;
			const page = await document.getPage(pageNumber);
			try {
				controller.signal.throwIfAborted();
				const textContent = await readPdfText(page, controller.signal);
				controller.signal.throwIfAborted();
				const text = textContent.items
					.filter((item): item is TextItem => 'str' in item)
					.map((item) => item.str)
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim();
				const preview = createPdfFindPreview(text, query);
				if (preview) {
					const result = {
						page: pageNumber,
						...preview
					};
					results.push(result);
					options.onResult?.(result);
				}
				completedPages += 1;
				options.onProgress?.(completedPages, document.numPages);
			} finally {
				page.cleanup();
			}
		}
	};

	try {
		await Promise.all(
			Array.from({ length: workerCount }, async () => {
				try {
					await inspectPages();
				} catch (error) {
					// Stop sibling publication/scheduling before Promise.all's rejection is observed.
					abort();
					throw error;
				}
			})
		);
		return results.sort((left, right) => left.page - right.page);
	} finally {
		options.signal?.removeEventListener('abort', abort);
	}
};

export const clampPdfPage = (page: number, totalPages: number): number =>
	Math.min(Math.max(Math.trunc(page) || 1, 1), Math.max(totalPages, 1));

export const nearbyPdfPages = (page: number, totalPages: number): Array<number> => {
	const current = clampPdfPage(page, totalPages);
	return [current - 1, current, current + 1].filter(
		(candidate) => candidate >= 1 && candidate <= totalPages
	);
};
