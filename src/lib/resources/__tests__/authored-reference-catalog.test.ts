import { describe, expect, it } from 'vitest';
import { authoredReferenceCatalog } from '../authored-reference-catalog';
import { createCatalogAnnotationReferenceProvider } from '../catalog-annotation-reference';
import { dnd5e2014ResourceCatalog } from '../dnd5e2014ResourceCatalog';
import { dnd5e2024ResourceCatalog } from '../dnd5e2024-resource-catalog';
import { createResourceCatalog, resolveResourceLocator } from '../resourceCatalog';

const provider = createCatalogAnnotationReferenceProvider(
	authoredReferenceCatalog,
	(path) => `/ez-chars${path}`
);

describe('explicit authored reference lookup', () => {
	it.each([dnd5e2014ResourceCatalog, dnd5e2024ResourceCatalog])(
		'honors source identity and authored page without requiring a URL',
		(catalog) => {
			const resource = catalog.resources.find((entry) => entry.delivery === 'self-hosted')!;
			const reference = { sourceId: resource.id, kind: 'pdf' as const, locator: { page: 4 } };
			const before = structuredClone(reference);
			const resolved = provider.resolve(reference)!;
			expect(resolved).toMatchObject({
				kind: 'internal',
				resource,
				locator: { page: 4 },
				browserHref: `/ez-chars${resource.localAssetPath}#page=4`
			});
			expect(provider.sections(resolved)).toEqual(
				catalog.locators
					.filter((entry) => entry.resourceId === resource.id && entry.page !== undefined)
					.map((entry) => ({ label: entry.label, page: entry.page }))
			);
			expect(reference).toEqual(before);
		}
	);
	it('retains edition-specific automatic defaults instead of accepting foreign locators', () => {
		expect(createResourceCatalog(authoredReferenceCatalog)).toEqual(authoredReferenceCatalog);
		for (const [active, other] of [
			[dnd5e2014ResourceCatalog, dnd5e2024ResourceCatalog],
			[dnd5e2024ResourceCatalog, dnd5e2014ResourceCatalog]
		]) {
			expect(resolveResourceLocator(active, other.locators[0].id)).toBeUndefined();
		}
	});
	it('does not treat unknown or link-only sources as an included PDF', () => {
		for (const sourceId of ['user-owned-alternate', 'dnd5e-2014.dnd-beyond-basic-rules']) {
			expect(provider.resolve({ sourceId, kind: 'pdf', locator: { page: 4 } })).toBeUndefined();
		}
	});
});
