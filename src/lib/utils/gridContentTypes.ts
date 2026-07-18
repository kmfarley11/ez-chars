import type { Annotation, Reference } from '../../schema/core.js';

export type GridContentPathSegment = string | number;
export type GridContentBindPath = Array<GridContentPathSegment>;

export type GridContentReference = Reference;

export type GridContentAnnotation = Annotation;
export type GridEditAffordance = 'persistent' | 'hover' | 'menu';
export type GridAnnotationAffordance = 'persistent' | 'badge' | 'hover';
export type GridFieldPatchOperation = 'replace' | 'add';

export type GridFieldBinding = {
	readPath?: GridContentBindPath;
	valuePatchPath?: GridContentBindPath;
	annotationReadPath?: GridContentBindPath;
	annotationPatchPath?: GridContentBindPath;
	valuePatchOperation?: GridFieldPatchOperation;
};

export type GridFieldCapabilities = {
	canEditValue?: boolean;
	canEditAnnotations?: boolean;
	isDerived?: boolean;
	copyPriority?: boolean;
};

export type GridFieldInteraction = {
	editAffordance?: GridEditAffordance;
	annotationAffordance?: GridAnnotationAffordance;
};

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
	| boolean
	| GridContentNestedFields
	| Array<GridContentField>;
export type GridContentNestedFields = Record<string, GridContentField>;

export type GridContentField = {
	fieldName?: string;
	label?: string;
	hidden?: boolean;
	options?: string[];
	inputKind?: 'text' | 'number';
	addItemLabel?: string;
	addItemTemplate?: GridContentField;
	// Data-path contract:
	// - Structural `path` is the field's position in the GridContentData tree (computed by traversal).
	// - `bindPath` overrides where this field's value patch is written.
	// - `annotationBindPath` overrides where this field's annotation patch is written.
	bindPath?: GridContentBindPath;
	binding?: GridFieldBinding;
	capabilities?: GridFieldCapabilities;
	interaction?: GridFieldInteraction;
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

export type GridContentValuePatch = GridContentPatch & {
	kind: 'value';
};

export type GridContentAnnotationPatch = {
	kind: 'annotation';
	path: GridContentBindPath;
	value: Array<GridContentAnnotation>;
};

export type GridContentProjectedPatch = GridContentValuePatch | GridContentAnnotationPatch;
