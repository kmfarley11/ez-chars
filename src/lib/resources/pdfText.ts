import type { PDFPageProxy, TextContent } from 'pdfjs-dist/types/src/display/api';

// PDF.js 5.5.207 (including its legacy build) consumes this stream with for-await.
// Use the public reader API locally instead: no global polyfill or engine patch.
// Preserve the same chunk aggregation used by getTextContent().
export const readPdfText = async (
	page: Pick<PDFPageProxy, 'streamTextContent'>,
	signal?: AbortSignal
): Promise<TextContent> => {
	signal?.throwIfAborted();
	const reader = page.streamTextContent().getReader();
	const content: TextContent = { items: [], styles: Object.create(null), lang: null };
	let complete = false;
	let cancellationRequested = false;
	const cancel = () => {
		if (cancellationRequested) return;
		cancellationRequested = true;
		// PDF.js's stream transport requires an Error; undefined leaves its internal
		// controller open even though the platform reader has already been closed.
		void reader.cancel(new Error('PDF text read cancelled')).catch(() => undefined);
	};
	signal?.addEventListener('abort', cancel, { once: true });
	try {
		while (true) {
			const { done, value } = await reader.read();
			signal?.throwIfAborted();
			if (done) {
				complete = true;
				return content;
			}
			content.lang ??= value.lang;
			Object.assign(content.styles, value.styles);
			content.items.push(...value.items);
		}
	} finally {
		signal?.removeEventListener('abort', cancel);
		if (!complete) cancel();
		reader.releaseLock();
	}
};
