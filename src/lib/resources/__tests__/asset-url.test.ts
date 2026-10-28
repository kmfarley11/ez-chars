import { describe, expect, it, vi } from 'vitest';
import { resolveAssetUrl } from '../asset-url';

vi.mock('$app/paths', () => ({ asset: (path: string) => `/ez-chars/${path}` }));

describe('plugin-served asset URLs', () => {
	it('normalizes catalog paths without dropping the deployment base', () => {
		expect(resolveAssetUrl('/docs/ext/5e2014/SRD_CC_v5.1.pdf')).toBe(
			'/ez-chars/docs/ext/5e2014/SRD_CC_v5.1.pdf'
		);
	});
	it('also accepts asset-relative PDF support paths', () => {
		expect(resolveAssetUrl('pdfjs/wasm')).toBe('/ez-chars/pdfjs/wasm');
	});
});
