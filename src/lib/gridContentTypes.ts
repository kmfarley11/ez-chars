export type GridContentPathSegment = string | number;
export type GridContentBindPath = Array<GridContentPathSegment>;

export type GridContentReference = {
	sourceId: string;
	kind: 'pdf_page' | 'url' | 'external_id';
	locator: {
		page?: number;
		url?: string;
		id?: string;
		anchor?: string;
		label?: string;
	};
};

export type GridContentAnnotation = {
	id?: string;
	origin: 'user' | 'source';
	kind: 'note' | 'reference' | 'summary' | 'tag';
	text?: string;
	ref?: GridContentReference;
	tags?: Array<string>;
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
