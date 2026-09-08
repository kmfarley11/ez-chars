import { describe, expect, it } from 'vitest';
import { pdfJsAssetUrls } from '../pdfJsAssets';

describe('PDF.js support asset URLs', () => {
	it('uses the configured application base for copied support directories', () => {
		expect(pdfJsAssetUrls.cMapUrl).toContain('/ez-chars/pdfjs/cmaps/');
		expect(pdfJsAssetUrls.iccUrl).toContain('/ez-chars/pdfjs/iccs/');
		expect(pdfJsAssetUrls.imageDecoderUrl).toContain('/ez-chars/pdfjs/image_decoders/');
		expect(pdfJsAssetUrls.standardFontDataUrl).toContain('/ez-chars/pdfjs/standard_fonts/');
		expect(pdfJsAssetUrls.wasmUrl).toContain('/ez-chars/pdfjs/wasm/');
	});

	it('lets Vite own exact-version API-module and worker URLs', () => {
		expect(pdfJsAssetUrls.moduleSrc).toContain('pdf.mjs');
		expect(pdfJsAssetUrls.workerSrc).toContain('pdf.worker.min.mjs');
	});
});
