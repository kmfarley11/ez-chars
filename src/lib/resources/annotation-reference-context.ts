import { getContext, setContext } from 'svelte';
import type { ResourceDisposition } from './resourceCatalog';
import type { GridContentReference } from '$utils/gridContentTypes';

export type InternalAnnotationReference = Extract<ResourceDisposition, { kind: 'internal' }>;
export interface AnnotationReferenceProvider {
	resolve: (reference: GridContentReference) => InternalAnnotationReference | undefined;
	sections: (reference: InternalAnnotationReference) => Array<{ label: string; page: number }>;
}
const key = Symbol('annotation-reference-provider');
// Without a host provider notes retain ordinary external-link behavior. No system fallback.
const externalOnly: AnnotationReferenceProvider = { resolve: () => undefined, sections: () => [] };
export const getAnnotationReferenceProvider = (): AnnotationReferenceProvider =>
	getContext(key) ?? externalOnly;
export const setAnnotationReferenceProvider = (provider: AnnotationReferenceProvider): void => {
	setContext(key, provider);
};
