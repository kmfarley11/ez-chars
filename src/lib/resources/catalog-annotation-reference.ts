import { resolveResourceLocator, type ResourceCatalog } from '$lib/resources/resourceCatalog';
import type {
	AnnotationReferenceProvider,
	InternalAnnotationReference
} from '$lib/resources/annotation-reference-context';
import type { GridContentReference } from '$utils/gridContentTypes';

export const createCatalogAnnotationReferenceProvider = (
	catalog: ResourceCatalog,
	resolveAssetHref: (path: string) => string
): AnnotationReferenceProvider => ({
	resolve: (reference: GridContentReference): InternalAnnotationReference | undefined => {
		if (reference.kind !== 'pdf' || reference.locator.page === undefined) return undefined;
		const locator = catalog.locators.find(
			(entry) =>
				entry.resourceId === reference.sourceId &&
				entry.kind === 'pdf-page' &&
				entry.health === 'verified'
		);
		if (!locator) return undefined;
		const resolved = resolveResourceLocator(catalog, locator.id, {
			resolveAssetHref
		});
		if (resolved?.kind !== 'internal') return undefined;
		const page = reference.locator.page;
		return {
			...resolved,
			locator: { ...resolved.locator, label: `Page ${page}`, page },
			exactHref: `${resolved.generalHref}#page=${page}`,
			browserHref: `${resolved.generalHref}#page=${page}`
		};
	},

	sections: (reference: InternalAnnotationReference) =>
		catalog.locators
			.filter(
				(entry) =>
					entry.resourceId === reference.resource.id &&
					entry.kind === 'pdf-page' &&
					entry.health === 'verified' &&
					entry.page !== undefined
			)
			.map((entry) => ({ label: entry.label, page: entry.page! }))
});
