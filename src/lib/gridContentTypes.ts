import type { Annotation, Reference } from '../schema/core';

export type GridContentPathSegment = string | number;
export type GridContentBindPath = Array<GridContentPathSegment>;

export type GridContentReference = Reference;

export type GridContentAnnotation = Annotation;

export type GridAnnotationReferenceTemplate = {
	key: string;
	label: string;
	reference: GridContentReference;
};

export type GridAnnotationEditorConfig = {
	referenceTemplates?: Array<GridAnnotationReferenceTemplate>;
	defaultKind?: GridContentAnnotation['kind'];
	defaultOrigin?: GridContentAnnotation['origin'];
};

export type GridContentFieldValue =
	| string
	| number
	| GridContentNestedFields
	| Array<GridContentField>;
export type GridContentNestedFields = Record<string, GridContentField>;

export type GridContentField = {
	fieldName?: string;
	label?: string;
	// Data-path contract:
	// - Structural `path` is the field's position in the GridContentData tree (computed by traversal).
	// - `bindPath` overrides where this field's value patch is written.
	// - `annotationBindPath` overrides where this field's annotation patch is written.
	bindPath?: GridContentBindPath;
	editOnly?: boolean;
	multiline?: boolean;
	annotationBindPath?: GridContentBindPath;
	annotations?: Array<GridContentAnnotation>;
	value: GridContentFieldValue;
};

export type GridContentData = Record<string, GridContentField>;

export type GridContentPatch = {
	path: GridContentBindPath;
	value: unknown;
};
