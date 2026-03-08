import type { Annotation, Reference } from '../schema/core';

export type GridContentPathSegment = string | number;
export type GridContentBindPath = Array<GridContentPathSegment>;

export type GridContentReference = Reference;

export type GridContentAnnotation = Annotation;

export type GridContentFieldValue =
	| string
	| number
	| GridContentNestedFields
	| Array<GridContentField>;
export type GridContentNestedFields = Record<string, GridContentField>;

export type GridContentField = {
	fieldName?: string;
	label?: string;
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
