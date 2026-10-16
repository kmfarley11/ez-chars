import { dnd5e2014ResourceCatalog } from '$lib/resources/dnd5e2014ResourceCatalog';
import { resolveResourceLocator } from '$lib/resources/resourceCatalog';
import type {
	AnnotationReferenceProvider,
	InternalAnnotationReference
} from '$lib/resources/annotation-reference-context';
import type { GridContentReference } from '$utils/gridContentTypes';

export const create5eAnnotationReferenceProvider = (
	resolveAssetHref: (path: string) => string
): AnnotationReferenceProvider => ({
	resolve: (reference: GridContentReference): InternalAnnotationReference | undefined => {
		if (reference.kind !== 'pdf' || reference.locator.page === undefined) return undefined;
		const locator = dnd5e2014ResourceCatalog.locators.find(
			(entry) =>
				entry.resourceId === reference.sourceId &&
				entry.kind === 'pdf-page' &&
				entry.health === 'verified'
		);
		if (!locator) return undefined;
		const resolved = resolveResourceLocator(dnd5e2014ResourceCatalog, locator.id, {
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
		dnd5e2014ResourceCatalog.locators
			.filter(
				(entry) =>
					entry.resourceId === reference.resource.id &&
					entry.kind === 'pdf-page' &&
					entry.health === 'verified' &&
					entry.page !== undefined
			)
			.map((entry) => ({ label: entry.label, page: entry.page! }))
});
