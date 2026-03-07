export type GridFieldType = 'string' | 'number' | 'array' | 'object' | 'unknown';
export type GridContentFieldObjectValue = Record<string, string | number>;
export type GridContentFieldValue = string | number | GridContentFieldObjectValue;

export type GridContentField = {
	fieldName: string;
	fieldType: GridFieldType;
	value: GridContentFieldValue | GridContentFieldValue[];
};

export type GridContentData = Record<string, GridContentField>;
