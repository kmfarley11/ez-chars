import { displayOrPlaceholder } from '$lib/displayHelpers';
import { capitalizeFirstLetter } from '$lib/stringFormatters';
import { isGridFieldArray, isGridNestedFields } from '$lib/gridFieldGuards';
import type {
	GridContentAnnotation,
	GridContentBindPath,
	GridContentData,
	GridContentField,
	GridContentNestedFields,
	GridContentPatch,
	GridContentPathSegment
} from '$lib/gridContentTypes';

// Read-side helpers used by GridContent rendering and patch projection.
// Mutation/write helpers live in `characterGridHelpers.ts`.
export type HelpAnnotationGroup = {
	key: string;
	title: string;
	joinedLabel?: string;
	annotations: Array<GridContentAnnotation>;
};

type DisplayPart = { value: string; label?: string };

export type LeafInput = {
	path: Array<GridContentPathSegment>;
	field: GridContentField;
	joinedLabel?: string;
	bindPath?: GridContentBindPath;
};

// ------------------------------------------------------------
// Field Normalization + Display Helpers
// ------------------------------------------------------------
const inferFieldName = (fieldKey: string) => {
	const spaced = fieldKey
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.trim();
	return capitalizeFirstLetter(spaced.length > 0 ? spaced : fieldKey);
};

// Re-export shared guards for callers that already consume them from this module.
export const isFieldArray = isGridFieldArray;
export const isNestedFields = isGridNestedFields;

const shouldRenderField = (field: GridContentField) => !field.editOnly;

export const normalizeField = (fieldKey: string, field: GridContentField): GridContentField => {
	const normalizedName =
		displayOrPlaceholder(field.fieldName, '').trim() || inferFieldName(fieldKey);
	const normalizedAddItemTemplate = field.addItemTemplate
		? normalizeField('item', field.addItemTemplate)
		: undefined;
	if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
		return {
			...field,
			addItemTemplate: normalizedAddItemTemplate,
			fieldName: normalizedName
		};
	}

	if (isFieldArray(field.value)) {
		return {
			...field,
			addItemTemplate: normalizedAddItemTemplate,
			fieldName: normalizedName,
			value: field.value.map((child, idx) => normalizeField(`item${idx + 1}`, child))
		};
	}

	const normalizedNested: GridContentNestedFields = Object.fromEntries(
		Object.entries(field.value).map(([childKey, childField]) => [
			childKey,
			normalizeField(childKey, childField)
		])
	);
	return {
		...field,
		addItemTemplate: normalizedAddItemTemplate,
		fieldName: normalizedName,
		value: normalizedNested
	};
};

export const normalizeData = (source: GridContentData): GridContentData =>
	Object.fromEntries(
		Object.entries(source).map(([fieldKey, field]) => [fieldKey, normalizeField(fieldKey, field)])
	);

// Render any field shape generically: primitives, nested objects, and arrays of nested entries.
export const formatFieldValue = (
	field: GridContentField,
	placeholder = '___',
	nestedJoiner = ' / '
): string => {
	if (!shouldRenderField(field)) return '';
	if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
		return displayOrPlaceholder(field.value, placeholder);
	}

	if (isFieldArray(field.value)) {
		const combined = field.value
			.filter((entry) => shouldRenderField(entry))
			.map((entry) => formatFieldValue(entry, '', ' '))
			.filter((entry) => entry.length > 0)
			.join(' / ');
		return combined.length > 0 ? combined : placeholder;
	}

	const nested = field.value;
	const combined = Object.values(nested)
		.filter((entry) => shouldRenderField(entry))
		.map((entry) => formatFieldValue(entry, '', nestedJoiner))
		.filter((entry) => entry.length > 0)
		.join(nestedJoiner);
	return combined.length > 0 ? combined : placeholder;
};

export const getLabeledDisplayParts = (field: GridContentField): DisplayPart[] | undefined => {
	if (isFieldArray(field.value) || !isNestedFields(field.value)) return undefined;

	const nested = field.value;
	const parts = Object.values(nested)
		.filter((entry) => shouldRenderField(entry))
		.map((entry) => ({
			value: formatFieldValue(entry, ''),
			label: entry.label
		}))
		.filter((entry) => entry.value.length > 0);

	return parts.some((entry) => entry.label) ? parts : undefined;
};

const joinLabels = (...labels: Array<string | undefined>): string | undefined => {
	const parts = labels
		.map((label) => displayOrPlaceholder(label, '').trim())
		.filter((label) => label.length > 0);
	if (parts.length === 0) return undefined;
	return parts.join(' / ');
};

const toRawGridFieldValue = (field: GridContentField): unknown => {
	if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
		return field.value;
	}

	if (isFieldArray(field.value)) {
		return field.value.map((entry) => toRawGridFieldValue(entry));
	}

	return Object.fromEntries(
		Object.entries(field.value).map(([childKey, childField]) => [
			childKey,
			toRawGridFieldValue(childField)
		])
	);
};

// ------------------------------------------------------------
// Field Traversal Helpers
// ------------------------------------------------------------
// Bind path resolution order: explicit field `bindPath`, then inherited parent bind path + this segment.
const resolveBindPath = (
	field: GridContentField,
	inheritedBindPath: GridContentBindPath | undefined,
	pathSegment: GridContentPathSegment | undefined
): GridContentBindPath | undefined => {
	if (field.bindPath && field.bindPath.length > 0) return field.bindPath;
	if (!inheritedBindPath) return undefined;
	if (typeof pathSegment === 'undefined') return inheritedBindPath;
	return [...inheritedBindPath, pathSegment];
};

// Flatten nested field trees into editable leaves while carrying UI labels + resolved bind paths.
export const collectLeafInputs = (
	field: GridContentField,
	path: Array<GridContentPathSegment>,
	inheritedLabel?: string,
	inheritedBindPath?: GridContentBindPath,
	pathSegment?: GridContentPathSegment
): Array<LeafInput> => {
	const nextLabel = joinLabels(inheritedLabel, field.label);
	const nextBindPath = resolveBindPath(field, inheritedBindPath, pathSegment);
	if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
		return [{ path, field, joinedLabel: nextLabel, bindPath: nextBindPath }];
	}

	if (isFieldArray(field.value)) {
		return field.value.flatMap((childField, idx) =>
			collectLeafInputs(childField, [...path, idx], nextLabel, nextBindPath, idx)
		);
	}

	return Object.entries(field.value).flatMap(([childKey, childField]) =>
		collectLeafInputs(childField, [...path, childKey], nextLabel, nextBindPath, childKey)
	);
};

export const collectHelpAnnotationGroups = (source: GridContentData): Array<HelpAnnotationGroup> =>
	Object.entries(source).flatMap(([fieldKey, field]) =>
		collectLeafInputs(field, [fieldKey]).flatMap((leaf, idx) => {
			const fieldAnnotations = leaf.field.annotations ?? [];
			if (fieldAnnotations.length === 0) return [];
			const rootFieldName = displayOrPlaceholder(field.fieldName, inferFieldName(fieldKey)).trim();
			const leafFieldName = displayOrPlaceholder(leaf.field.fieldName, rootFieldName).trim();
			const title =
				rootFieldName === leafFieldName ? rootFieldName : `${rootFieldName} / ${leafFieldName}`;
			return [
				{
					key: `${fieldKey}-${idx}-${leaf.path.join('.')}`,
					title,
					joinedLabel: leaf.joinedLabel,
					annotations: fieldAnnotations
				}
			];
		})
	);

// ------------------------------------------------------------
// Patch Projection
// ------------------------------------------------------------
// Convert current draft into atomic write operations for model-level patch handlers.
export const collectPatchesFromData = (source: GridContentData): Array<GridContentPatch> =>
	Object.entries(source).flatMap(([fieldKey, field]) =>
		isFieldArray(field.value) && field.bindPath
			? [
					{
						path: field.bindPath,
						value: toRawGridFieldValue(field)
					}
				]
			: collectLeafInputs(field, [fieldKey], undefined, undefined, fieldKey).flatMap((leaf) => {
					if (isFieldArray(leaf.field.value) || isNestedFields(leaf.field.value)) return [];
					const patches: Array<GridContentPatch> = [
						{
							path: leaf.bindPath ?? leaf.path,
							value: leaf.field.value
						}
					];
					if (leaf.field.annotationBindPath) {
						patches.push({
							path: leaf.field.annotationBindPath,
							value: leaf.field.annotations ?? []
						});
					}
					return patches;
				})
	);
