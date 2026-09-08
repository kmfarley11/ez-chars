import { describe, expect, it, vi } from 'vitest';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { clampPdfPage, findPdfText, nearbyPdfPages, readPdfOutline } from '../pdfViewer';

const asDocument = (value: Partial<PDFDocumentProxy>): PDFDocumentProxy =>
	value as PDFDocumentProxy;

describe('PDF viewer projections', () => {
	it('clamps exact pages and mounts only the current page with immediate neighbors', () => {
		expect(clampPdfPage(0, 403)).toBe(1);
		expect(clampPdfPage(999, 403)).toBe(403);
		expect(nearbyPdfPages(8, 403)).toEqual([7, 8, 9]);
		expect(nearbyPdfPages(1, 403)).toEqual([1, 2]);
		expect(nearbyPdfPages(403, 403)).toEqual([402, 403]);
	});

	it('resolves named and direct outline destinations to one-based pages', async () => {
		const reference = { num: 7, gen: 0 };
		const document = asDocument({
			getOutline: vi.fn().mockResolvedValue([
				{
					title: 'Named section',
					dest: 'named-section',
					items: [{ title: 'Child section', dest: [reference], items: [] }]
				}
			]),
			getDestination: vi.fn().mockResolvedValue([reference]),
			getPageIndex: vi.fn().mockResolvedValue(7)
		});

		await expect(readPdfOutline(document)).resolves.toEqual([
			{
				title: 'Named section',
				page: 8,
				children: [{ title: 'Child section', page: 8, children: [] }]
			}
		]);
	});

	it('finds document-scoped text deterministically and cleans every inspected page', async () => {
		const cleanup = [vi.fn(), vi.fn(), vi.fn()];
		const textByPage = ['Barbarian Rage feature', 'Equipment tables', 'Rage ends early'];
		const pages = textByPage.map(
			(text, index) =>
				({
					getTextContent: vi.fn().mockResolvedValue({ items: [{ str: text }] }),
					cleanup: cleanup[index]
				}) as unknown as PDFPageProxy
		);
		const progress = vi.fn();
		const document = asDocument({
			numPages: pages.length,
			getPage: vi.fn(async (pageNumber: number) => pages[pageNumber - 1])
		});

		await expect(findPdfText(document, 'rage', { onProgress: progress })).resolves.toEqual([
			expect.objectContaining({ page: 1, occurrences: 1 }),
			expect.objectContaining({ page: 3, occurrences: 1 })
		]);
		cleanup.forEach((cleanupPage) => expect(cleanupPage).toHaveBeenCalledOnce());
		expect(progress).toHaveBeenLastCalledWith(3, 3);
	});

	it('stops an in-progress find when its viewer lifecycle is aborted', async () => {
		const controller = new AbortController();
		const document = asDocument({
			numPages: 2,
			getPage: vi.fn(async () => {
				controller.abort();
				return {
					getTextContent: vi.fn().mockResolvedValue({ items: [{ str: 'first page' }] }),
					cleanup: vi.fn()
				} as unknown as PDFPageProxy;
			})
		});

		await expect(
			findPdfText(document, 'page', { signal: controller.signal })
		).rejects.toMatchObject({
			name: 'AbortError'
		});
	});
});
