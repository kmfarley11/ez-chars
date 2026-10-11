import { describe, expect, it } from 'vitest';
import { createPdfFindPreview } from '../pdfFindPreview';

describe('PDF Find previews', () => {
	it('highlights every visible literal match and preserves display case', () => {
		const result = createPdfFindPreview('Armor protects you. ARMOR costs gold.', 'armor')!;
		expect(result.occurrences).toBe(2);
		expect(result.previewParts.filter((part) => part.match).map((part) => part.text)).toEqual([
			'Armor',
			'ARMOR'
		]);
		expect(result.preview).toBe('Armor protects you. ARMOR costs gold.');
	});
	it('treats regex metacharacters and markup as plain text', () => {
		const result = createPdfFindPreview('a+b <img> aab', 'a+b')!;
		expect(result.occurrences).toBe(1);
		expect(result.previewParts).toEqual([
			{ text: 'a+b', match: true },
			{ text: ' <img> aab', match: false }
		]);
	});
	it('uses consistent Unicode normalization for matching and preview offsets', () => {
		const result = createPdfFindPreview('ﬁre and cafe\u0301', 'CAFÉ')!;
		expect(result.previewParts).toEqual([
			{ text: 'fire and ', match: false },
			{ text: 'café', match: true }
		]);
		expect(createPdfFindPreview('ﬁre', 'fire')?.previewParts).toEqual([
			{ text: 'fire', match: true }
		]);
	});
	it('bounds context while counting matches beyond the excerpt', () => {
		const result = createPdfFindPreview(
			`${'x'.repeat(100)} armor ${'y'.repeat(200)} armor`,
			'armor'
		)!;
		expect(result.occurrences).toBe(2);
		expect(result.preview.startsWith('…')).toBe(true);
		expect(result.preview.endsWith('…')).toBe(true);
		expect(result.preview.length).toBeLessThanOrEqual(127);
		expect(result.previewParts.filter((part) => part.match)).toEqual([
			{ text: 'armor', match: true }
		]);
	});
	it('returns no result for empty or unmatched queries', () => {
		expect(createPdfFindPreview('Armor', '  ')).toBeUndefined();
		expect(createPdfFindPreview('Armor', 'shield')).toBeUndefined();
	});
});
