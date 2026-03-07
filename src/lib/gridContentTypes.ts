export type GridContentFieldValue = string | number | GridContentNestedFields;
export type GridContentNestedFields = Record<string, GridContentField>;

export type GridContentField = {
	fieldName?: string;
	label?: string;
	value: GridContentFieldValue;
};

export type GridContentData = Record<string, GridContentField>;
