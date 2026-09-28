import { asset } from '$app/paths';
import { dnd5e2014ResourceCatalog } from './dnd5e2014ResourceCatalog';
import { resolveResourceLocator, type ResourceDisposition } from './resourceCatalog';
import type { GridContentReference } from '$utils/gridContentTypes';

export type InternalAnnotationReference = Extract<ResourceDisposition, { kind: 'internal' }>;

// Reuse the existing catalog-owned resolution for both note surfaces.
export const resolveAnnotationReference = (
	reference: GridContentReference
): InternalAnnotationReference | undefined => {
	if (reference.kind !== 'pdf' || reference.locator.page === undefined) return undefined;
	const locator = dnd5e2014ResourceCatalog.locators.find(
		(entry) =>
			entry.resourceId === reference.sourceId &&
			entry.kind === 'pdf-page' &&
			entry.health === 'verified'
	);
	if (!locator) return undefined;
	const resolved = resolveResourceLocator(dnd5e2014ResourceCatalog, locator.id, {
		resolveAssetHref: (path) => asset(path as Parameters<typeof asset>[0])
	});
	if (resolved?.kind !== 'internal') return undefined;
	const page = reference.locator.page;
	return {
		...resolved,
		locator: { ...resolved.locator, label: `Page ${page}`, page },
		exactHref: `${resolved.generalHref}#page=${page}`,
		browserHref: `${resolved.generalHref}#page=${page}`
	};
};

export const annotationReferenceSections = (reference: InternalAnnotationReference) =>
	dnd5e2014ResourceCatalog.locators
		.filter(
			(entry) =>
				entry.resourceId === reference.resource.id &&
				entry.kind === 'pdf-page' &&
				entry.health === 'verified' &&
				entry.page !== undefined
		)
		.map((entry) => ({ label: entry.label, page: entry.page! }));
