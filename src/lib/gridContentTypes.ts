export type GridContentPathSegment = string | number;
export type GridContentBindPath = Array<GridContentPathSegment>;

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
	value: GridContentFieldValue;
};

export type GridContentData = Record<string, GridContentField>;

export type GridContentPatch = {
	path: GridContentBindPath;
	value: string | number;
};
