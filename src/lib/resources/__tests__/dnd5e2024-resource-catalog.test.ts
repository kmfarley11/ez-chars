import { describe, expect, it } from 'vitest';
import {
	dnd5e2024ResourceCatalog as catalog,
	FULL_2024_SRD_PATH,
	DND5E_2024_SRD_RESOURCE_ID
} from '../dnd5e2024-resource-catalog';
import { createResourceCatalog, resolveResourceLocator } from '../resourceCatalog';
import { createCatalogAnnotationReferenceProvider } from '../catalog-annotation-reference';
import { sheetLandmarks } from '$lib/systems/dnd5e-2024/sheet-landmarks';
import { resolveSheetLandmarkPath, validateSheetLandmarks } from '$lib/navigation/sheet-landmarks';

describe('2024 proof references and landmarks', () => {
	it('validates the complete catalog and resolves only its reviewed source pages', () => {
		expect(createResourceCatalog(catalog)).toEqual(catalog);
		expect(catalog.locators.map((locator) => locator.page)).toEqual([1, 83, 9, 89, 19, 28, 104]);
		for (const locator of catalog.locators) {
			const result = resolveResourceLocator(catalog, locator.id, {
				resolveAssetHref: (path) => `/ez-chars${path}`
			});
			expect(result).toMatchObject({
				kind: 'internal',
				resource: { systemId: 'dnd5e-2024' },
				locator: { page: locator.page },
				browserHref: `/ez-chars${FULL_2024_SRD_PATH}#page=${locator.page}`
			});
		}
		expect(resolveResourceLocator(catalog, 'dnd5e-2014.srd-5-1.equipment')).toBeUndefined();
	});
	it('uses an authored page without silently remapping an alternate source', () => {
		const provider = createCatalogAnnotationReferenceProvider(
			catalog,
			(path) => `/ez-chars${path}`
		);
		const reference = {
			sourceId: DND5E_2024_SRD_RESOURCE_ID,
			kind: 'pdf' as const,
			locator: { page: 84 }
		};
		const result = provider.resolve(reference);
		expect(result).toMatchObject({
			locator: { page: 84 },
			browserHref: `/ez-chars${FULL_2024_SRD_PATH}#page=84`
		});
		expect(provider.resolve({ ...reference, sourceId: 'user-owned-alternate' })).toBeUndefined();
		expect(reference.locator.page).toBe(84);
	});
	it('supplies explicit reachable parents without borrowing 2014 landmarks', () => {
		expect(validateSheetLandmarks(sheetLandmarks)).toEqual([]);
		expect(
			resolveSheetLandmarkPath('sheet-origin-heading', sheetLandmarks)?.map(
				(entry) => entry.fragmentId
			)
		).toEqual(['sheet-overview-heading', 'sheet-origin-heading']);
		expect(
			resolveSheetLandmarkPath('sheet-spells-heading', sheetLandmarks)?.map(
				(entry) => entry.fragmentId
			)
		).toEqual(['sheet-runtime-heading', 'sheet-spells-heading']);
	});
});
