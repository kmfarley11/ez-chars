import { describe, expect, it, vi } from 'vitest';
import { readPdfText } from '../pdfText';

describe('reader-based PDF text extraction', () => {
	it('aggregates chunk items, styles and language without requiring an async iterator', async () => {
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue({ items: [{ str: 'first' }], styles: { first: {} }, lang: null });
				controller.enqueue({ items: [{ str: 'second' }], styles: { second: {} }, lang: 'en' });
				controller.close();
			}
		});
		Object.defineProperty(stream, Symbol.asyncIterator, { value: undefined });
		await expect(readPdfText({ streamTextContent: () => stream })).resolves.toEqual({
			items: [{ str: 'first' }, { str: 'second' }],
			styles: { first: {}, second: {} },
			lang: 'en'
		});
		expect(stream.locked).toBe(false);
	});
	it('cancels pending reads and releases the stream lock on abort', async () => {
		const cancel = vi.fn();
		const stream = new ReadableStream({ cancel });
		const controller = new AbortController();
		const pending = readPdfText({ streamTextContent: () => stream }, controller.signal);
		const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
		controller.abort();
		await rejected;
		expect(cancel).toHaveBeenCalledOnce();
		expect(cancel).toHaveBeenCalledWith(expect.any(Error));
		expect(stream.locked).toBe(false);
	});
	it('preserves extraction failures and releases the stream lock', async () => {
		const stream = new ReadableStream({
			start(controller) {
				controller.error(new Error('text failed'));
			}
		});
		await expect(readPdfText({ streamTextContent: () => stream })).rejects.toThrow('text failed');
		expect(stream.locked).toBe(false);
	});
});
