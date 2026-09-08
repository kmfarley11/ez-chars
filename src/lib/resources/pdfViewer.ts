import type {
	PDFDocumentLoadingTask,
	PDFDocumentProxy,
	TextItem
} from 'pdfjs-dist/types/src/display/api';
import { pdfJsAssetUrls } from './pdfJsAssets';

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
};

const normalizeFindText = (value: string): string => value.normalize('NFKC').toLocaleLowerCase();

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
	const normalizedQuery = normalizeFindText(query.trim());
	if (normalizedQuery.length === 0) return [];
	const results: Array<PdfFindResult> = [];
	const startPage = clampPdfPage(options.startPage ?? 1, document.numPages);
	const pageNumbers = [
		...Array.from({ length: document.numPages - startPage + 1 }, (_, index) => startPage + index),
		...Array.from({ length: startPage - 1 }, (_, index) => index + 1)
	];
	let nextPageIndex = 0;
	let completedPages = 0;
	const workerCount = Math.min(6, document.numPages);

	const inspectPages = async () => {
		while (nextPageIndex < pageNumbers.length) {
			if (options.signal?.aborted) throw new DOMException('Find cancelled', 'AbortError');
			const pageNumber = pageNumbers[nextPageIndex];
			nextPageIndex += 1;
			const page = await document.getPage(pageNumber);
			try {
				if (options.signal?.aborted) throw new DOMException('Find cancelled', 'AbortError');
				const textContent = await page.getTextContent();
				const text = textContent.items
					.filter((item): item is TextItem => 'str' in item)
					.map((item) => item.str)
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim();
				const normalizedText = normalizeFindText(text);
				let occurrences = 0;
				let matchIndex = normalizedText.indexOf(normalizedQuery);
				while (matchIndex !== -1) {
					occurrences += 1;
					matchIndex = normalizedText.indexOf(normalizedQuery, matchIndex + normalizedQuery.length);
				}
				if (occurrences > 0) {
					const firstMatch = normalizedText.indexOf(normalizedQuery);
					const previewStart = Math.max(0, firstMatch - 45);
					const previewEnd = Math.min(text.length, firstMatch + normalizedQuery.length + 75);
					const result = {
						page: pageNumber,
						occurrences,
						preview: `${previewStart > 0 ? '…' : ''}${text.slice(previewStart, previewEnd)}${previewEnd < text.length ? '…' : ''}`
					};
					results.push(result);
					options.onResult?.(result);
				}
			} finally {
				page.cleanup();
				completedPages += 1;
				options.onProgress?.(completedPages, document.numPages);
			}
		}
	};

	await Promise.all(Array.from({ length: workerCount }, inspectPages));
	return results.sort((left, right) => left.page - right.page);
};

export const clampPdfPage = (page: number, totalPages: number): number =>
	Math.min(Math.max(Math.trunc(page) || 1, 1), Math.max(totalPages, 1));

export const nearbyPdfPages = (page: number, totalPages: number): Array<number> => {
	const current = clampPdfPage(page, totalPages);
	return [current - 1, current, current + 1].filter(
		(candidate) => candidate >= 1 && candidate <= totalPages
	);
};
