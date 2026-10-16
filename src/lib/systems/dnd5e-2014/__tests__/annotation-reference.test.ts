import { describe, expect, it } from 'vitest';
import { create5eAnnotationReferenceProvider } from '../annotation-reference';
import { DND5E_2014_SRD_RESOURCE_ID } from '$lib/resources/dnd5e2014ResourceCatalog';

describe('2014 annotation reference provider', () => {
	const provider = create5eAnnotationReferenceProvider((path) => `/test-base${path}`);
	it('resolves the requested page and verified curated sections independently of browser routing', () => {
		const result = provider.resolve({
			kind: 'pdf',
			sourceId: DND5E_2014_SRD_RESOURCE_ID,
			locator: { page: 8 }
		});
		expect(result?.kind).toBe('internal');
		expect(result?.generalHref).toMatch(/^\/test-base/);
		expect(result?.locator.page).toBe(8);
		expect(result?.browserHref).toBe(`${result?.generalHref}#page=8`);
		expect(provider.sections(result!)).toContainEqual(expect.objectContaining({ page: 8 }));
	});
	it('does not promote unknown or incomplete references into the internal viewer', () => {
		expect(
			provider.resolve({ kind: 'pdf', sourceId: 'user-owned', locator: { page: 8 } })
		).toBeUndefined();
		expect(
			provider.resolve({ kind: 'pdf', sourceId: DND5E_2014_SRD_RESOURCE_ID, locator: {} })
		).toBeUndefined();
		expect(
			provider.resolve({
				kind: 'url',
				sourceId: 'external',
				locator: { url: 'https://example.com' }
			})
		).toBeUndefined();
	});
});
