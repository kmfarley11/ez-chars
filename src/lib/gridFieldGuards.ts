import type {
	GridContentField,
	GridContentFieldValue,
	GridContentNestedFields
} from '$lib/gridContentTypes';

// Shared field-shape guards used across grid read/write helpers.
export const isGridFieldArray = (value: GridContentFieldValue): value is Array<GridContentField> =>
	Array.isArray(value);

export const isGridNestedFields = (
	value: GridContentFieldValue
): value is GridContentNestedFields =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
