import type { Annotation } from '../../schema';

export type AnnotationRemoval = {
	annotation: Annotation;
	index: number;
};

export type DraftCommitResult<T> = { ok: true; value: T } | { ok: false; message: string };

export const cloneAnnotations = (annotations: ReadonlyArray<Annotation>): Array<Annotation> =>
	annotations.map((annotation) => ({
		...annotation,
		tags: annotation.tags ? [...annotation.tags] : undefined,
		ref: annotation.ref ? { ...annotation.ref, locator: { ...annotation.ref.locator } } : undefined
	}));

export const validateDraftAnnotations = (
	annotations: ReadonlyArray<Annotation>
): string | undefined => {
	const emptyIndex = annotations.findIndex(
		(annotation) =>
			(annotation.text?.trim().length ?? 0) === 0 &&
			(annotation.name?.trim().length ?? 0) === 0 &&
			annotation.ref === undefined
	);
	return emptyIndex >= 0 ? `Note ${emptyIndex + 1} needs text, a name, or a reference.` : undefined;
};

export const findRemovedDraftAnnotation = (
	previous: ReadonlyArray<Annotation>,
	next: ReadonlyArray<Annotation>
): AnnotationRemoval | undefined => {
	if (next.length >= previous.length) return undefined;
	const index = previous.findIndex(
		(annotation) => !next.some((candidate) => candidate.id === annotation.id)
	);
	if (index < 0) return undefined;
	return { annotation: cloneAnnotations([previous[index]])[0], index };
};

export const restoreRemovedDraftAnnotation = (
	annotations: ReadonlyArray<Annotation>,
	removal: AnnotationRemoval
): Array<Annotation> => {
	const next = cloneAnnotations(annotations);
	next.splice(Math.min(removal.index, next.length), 0, cloneAnnotations([removal.annotation])[0]);
	return next;
};
