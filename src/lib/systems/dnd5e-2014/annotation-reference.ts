import { authoredReferenceCatalog } from '$lib/resources/authored-reference-catalog';
import { createCatalogAnnotationReferenceProvider } from '$lib/resources/catalog-annotation-reference';
export const create5eAnnotationReferenceProvider = (resolveAssetHref: (path: string) => string) =>
	createCatalogAnnotationReferenceProvider(authoredReferenceCatalog, resolveAssetHref);
