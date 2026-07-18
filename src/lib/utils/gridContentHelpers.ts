import { displayOrPlaceholder } from '$utils/displayHelpers';
import { capitalizeFirstLetter } from '$utils/stringFormatters';
import { isGridFieldArray, isGridNestedFields } from '$utils/gridFieldGuards';
import { annotationSchema } from '../../schema/zod/core.js';
import type {
	GridContentAnnotation,
	GridContentAnnotationPatch,
	GridContentBindPath,
	GridContentData,
	GridContentField,
	GridContentNestedFields,
	GridContentPatch,
	GridContentPathSegment,
	GridContentValuePatch,
	GridFieldCapabilities,
	GridFieldInteraction,
	GridFieldPatchOperation
} from '$utils/gridContentTypes';
import type { JSONPointer } from 'immutable-json-patch';

// Read-side helpers used by GridContent rendering and patch projection.
// Mutation/write helpers live in `characterGridHelpers.ts`.
export type HelpAnnotationGroup = {
	key: string;
	title: string;
	joinedLabel?: string;
	annotations: Array<GridContentAnnotation>;
	annotationBindPath?: GridContentBindPath;
};

type DisplayPart = { value: string; label?: string };
type PrimitiveGridFieldValue = string | number | boolean;
type PrimitiveInputKind = 'text' | 'number';

export type GridFieldDescriptor = {
	key: string;
	fieldName?: string;
	label?: string;
	path?: GridContentBindPath;
	readPath?: GridContentBindPath;
	valuePatchPath?: GridContentBindPath;
	annotationReadPath?: GridContentBindPath;
	annotationPatchPath?: GridContentBindPath;
	valuePatchOperation?: GridFieldPatchOperation;
	defaultValue?: PrimitiveGridFieldValue;
	inputKind?: 'text' | 'number';
	multiline?: boolean;
	options?: string[];
	hidden?: boolean;
	editOnly?: boolean;
	interaction?: GridFieldInteraction;
	capabilities?: GridFieldCapabilities;
};

export type GridFieldDescriptorResolverOptions = {
	annotationPathForValuePath?: (_path: GridContentBindPath) => GridContentBindPath | undefined;
};

export type LeafInput = {
	path: Array<GridContentPathSegment>;
	field: GridContentField;
	joinedLabel?: string;
	bindPath?: GridContentBindPath;
};

// ------------------------------------------------------------
// Field Binding Descriptor Helpers
// ------------------------------------------------------------
export const getValueAtGridPath = (source: unknown, path: GridContentBindPath): unknown => {
	let cursor: unknown = source;
	for (const segment of path) {
		if (typeof segment === 'number') {
			if (!Array.isArray(cursor)) return undefined;
			cursor = cursor[segment];
			continue;
		}

		if (typeof cursor !== 'object' || cursor === null || Array.isArray(cursor)) return undefined;
		cursor = (cursor as Record<string, unknown>)[segment];
	}
	return cursor;
};

const isPrimitiveGridFieldValue = (value: unknown): value is PrimitiveGridFieldValue =>
	typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

// These token sets are intentionally rough authoring heuristics. Long term, the
// better source of truth is schema- or system-layer field metadata rather than
// inferring semantics from field keys alone inside the generic grid layer.
const uppercaseFieldTokens = new Set([
	'ac',
	'hp',
	'dc',
	'id',
	'xp',
	'npc',
	'pc',
	'str',
	'dex',
	'con',
	'int',
	'wis',
	'cha'
]);

const numericFieldTokens = new Set([
	'ac',
	'armor',
	'bonus',
	'class',
	'count',
	'dc',
	'dice',
	'fails',
	'failures',
	'gp',
	'hp',
	'initiative',
	'level',
	'levels',
	'max',
	'mod',
	'pp',
	'remaining',
	'saves',
	'score',
	'slots',
	'sp',
	'speed',
	'successes',
	'temp',
	'total',
	'uses',
	'xp'
]);

const splitFieldWords = (value: string): Array<string> =>
	value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.trim()
		.split(/\s+/)
		.filter((part) => part.length > 0);

const toDisplayFieldName = (value: string): string => {
	const words = splitFieldWords(value);
	if (words.length === 0) return capitalizeFirstLetter(value);
	return words
		.map((word) => {
			const lowered = word.toLowerCase();
			if (uppercaseFieldTokens.has(lowered)) return lowered.toUpperCase();
			return capitalizeFirstLetter(lowered);
		})
		.join(' ');
};

const inferPrimitiveInputKind = (
	key: string,
	fieldName: string | undefined,
	readValue: unknown,
	defaultValue: PrimitiveGridFieldValue | undefined
): PrimitiveInputKind => {
	if (typeof readValue === 'number' || typeof defaultValue === 'number') return 'number';
	if (typeof readValue === 'string' || typeof defaultValue === 'string') return 'text';

	const firstWord = splitFieldWords(fieldName ?? key)[0]?.toLowerCase();
	return firstWord && numericFieldTokens.has(firstWord) ? 'number' : 'text';
};

const inferDefaultPrimitiveValue = (
	inputKind: PrimitiveInputKind,
	readValue: unknown,
	explicitDefaultValue: PrimitiveGridFieldValue | undefined
): PrimitiveGridFieldValue => {
	if (typeof explicitDefaultValue !== 'undefined') return explicitDefaultValue;
	if (typeof readValue === 'boolean') return false;
	return inputKind === 'number' ? 0 : '';
};

export const toGridJsonPointer = (path: GridContentBindPath): JSONPointer =>
	`/${path
		.map((segment) => String(segment).replace(/~/g, '~0').replace(/\//g, '~1'))
		.join('/')}` as JSONPointer;

export const readGridAnnotationsAtPath = (
	source: unknown,
	path: GridContentBindPath | undefined
): Array<GridContentAnnotation> => {
	if (!path) return [];
	const value = getValueAtGridPath(source, path);
	if (Array.isArray(value)) {
		return value.flatMap((entry, idx) => {
			const parsed = annotationSchema.safeParse(entry);
			if (!parsed.success) return [];
			return [
				{
					...parsed.data,
					id:
						typeof parsed.data.id === 'string' && parsed.data.id.trim().length > 0
							? parsed.data.id
							: String(idx)
				}
			];
		});
	}

	if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];
	return Object.entries(value).flatMap(([key, entry]) => {
		const parsed = annotationSchema.safeParse(entry);
		if (!parsed.success) return [];
		return [
			{
				...parsed.data,
				id:
					typeof parsed.data.id === 'string' && parsed.data.id.trim().length > 0
						? parsed.data.id
						: key
			}
		];
	});
};

export const resolveGridFieldDescriptor = (
	source: unknown,
	descriptor: GridFieldDescriptor,
	options: GridFieldDescriptorResolverOptions = {}
): GridContentField => {
	const readPath = descriptor.readPath ?? descriptor.path;
	const valuePatchPath = descriptor.valuePatchPath ?? descriptor.path;
	const annotationReadPath =
		descriptor.annotationReadPath ??
		descriptor.annotationPatchPath ??
		(valuePatchPath ? options.annotationPathForValuePath?.(valuePatchPath) : undefined);
	const annotationPatchPath =
		descriptor.annotationPatchPath ??
		(valuePatchPath ? options.annotationPathForValuePath?.(valuePatchPath) : undefined);
	const readValue = readPath ? getValueAtGridPath(source, readPath) : undefined;
	const resolvedFieldName =
		displayOrPlaceholder(descriptor.fieldName, '').trim() || toDisplayFieldName(descriptor.key);
	const resolvedInputKind =
		descriptor.inputKind ??
		inferPrimitiveInputKind(descriptor.key, resolvedFieldName, readValue, descriptor.defaultValue);
	const value = isPrimitiveGridFieldValue(readValue)
		? readValue
		: inferDefaultPrimitiveValue(resolvedInputKind, readValue, descriptor.defaultValue);
	const canEditValue =
		descriptor.capabilities?.canEditValue ?? (valuePatchPath !== undefined && value !== undefined);
	const canEditAnnotations =
		descriptor.capabilities?.canEditAnnotations ?? annotationPatchPath !== undefined;

	return {
		fieldName: resolvedFieldName,
		label: descriptor.label,
		hidden: descriptor.hidden,
		options: descriptor.options,
		inputKind: resolvedInputKind,
		editOnly: descriptor.editOnly,
		multiline: descriptor.multiline,
		bindPath: valuePatchPath,
		annotationBindPath: annotationPatchPath,
		annotations: readGridAnnotationsAtPath(source, annotationReadPath),
		binding: {
			readPath,
			valuePatchPath,
			annotationReadPath,
			annotationPatchPath,
			valuePatchOperation: descriptor.valuePatchOperation
		},
		capabilities: {
			...descriptor.capabilities,
			canEditValue,
			canEditAnnotations
		},
		interaction: descriptor.interaction,
		value
	};
};

export const resolveGridFieldDescriptors = (
	source: unknown,
	descriptors: Array<GridFieldDescriptor>,
	options: GridFieldDescriptorResolverOptions = {}
): GridContentData =>
	Object.fromEntries(
		descriptors.map((descriptor) => [
			descriptor.key,
			resolveGridFieldDescriptor(source, descriptor, options)
		])
	);

export const isDirectEditablePrimitiveField = (field: GridContentField): boolean =>
	!isGridFieldArray(field.value) &&
	!isGridNestedFields(field.value) &&
	(typeof field.value === 'string' || typeof field.value === 'number') &&
	field.capabilities?.canEditValue === true &&
	field.interaction?.editAffordance !== undefined &&
	(field.binding?.valuePatchPath ?? field.bindPath) !== undefined;

// ------------------------------------------------------------
// Field Normalization + Display Helpers
// ------------------------------------------------------------
const inferFieldName = (fieldKey: string) => {
	const displayName = toDisplayFieldName(fieldKey);
	return displayName.length > 0 ? displayName : capitalizeFirstLetter(fieldKey);
};

// Re-export shared guards for callers that already consume them from this module.
export const isFieldArray = isGridFieldArray;
export const isNestedFields = isGridNestedFields;

const shouldRenderField = (field: GridContentField) => !field.editOnly && !field.hidden;

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

export const collectHelpAnnotationGroups = (
	source: GridContentData,
	options: { includeEditableEmpty?: boolean } = {}
): Array<HelpAnnotationGroup> =>
	Object.entries(source).flatMap(([fieldKey, field]) =>
		collectLeafInputs(field, [fieldKey]).flatMap((leaf, idx) => {
			if (!shouldRenderField(leaf.field)) return [];
			const fieldAnnotations = leaf.field.annotations ?? [];
			const shouldIncludeEmptyEditable =
				options.includeEditableEmpty === true && leaf.field.annotationBindPath !== undefined;
			if (fieldAnnotations.length === 0 && !shouldIncludeEmptyEditable) return [];
			const rootFieldName = displayOrPlaceholder(field.fieldName, inferFieldName(fieldKey)).trim();
			const leafFieldName = displayOrPlaceholder(leaf.field.fieldName, rootFieldName).trim();
			const title =
				rootFieldName === leafFieldName ? rootFieldName : `${rootFieldName} / ${leafFieldName}`;
			return [
				{
					key: `${fieldKey}-${idx}-${leaf.path.join('.')}`,
					title,
					joinedLabel: leaf.joinedLabel,
					annotations: fieldAnnotations,
					annotationBindPath: leaf.field.annotationBindPath
				}
			];
		})
	);

// ------------------------------------------------------------
// Patch Projection
// ------------------------------------------------------------
// Convert current draft into value write operations for model-level patch handlers.
export const collectValuePatchesFromData = (
	source: GridContentData
): Array<GridContentValuePatch> =>
	Object.entries(source).flatMap(([fieldKey, field]) =>
		isFieldArray(field.value) && field.bindPath
			? [
					{
						kind: 'value' as const,
						path: field.bindPath,
						value: toRawGridFieldValue(field)
					}
				]
			: collectLeafInputs(field, [fieldKey], undefined, undefined, fieldKey).flatMap((leaf) => {
					if (isFieldArray(leaf.field.value) || isNestedFields(leaf.field.value)) return [];
					return [
						{
							kind: 'value' as const,
							path: leaf.bindPath ?? leaf.path,
							value: leaf.field.value
						}
					];
				})
	);

// Convert current draft into annotation write operations for model-level patch handlers.
export const collectAnnotationPatchesFromData = (
	source: GridContentData
): Array<GridContentAnnotationPatch> =>
	Object.entries(source).flatMap(([fieldKey, field]) =>
		// TODO(mvp): newly added top-level array items only gain stable annotation bind paths
		// after their first save, because those annotation paths are derived from stored array indices.
		collectLeafInputs(field, [fieldKey], undefined, undefined, fieldKey).flatMap((leaf) =>
			leaf.field.annotationBindPath
				? [
						{
							kind: 'annotation' as const,
							path: leaf.field.annotationBindPath,
							value: leaf.field.annotations ?? []
						}
					]
				: []
		)
	);

// Compatibility bridge for the existing card-wide edit dialog save path.
export const collectPatchesFromData = (source: GridContentData): Array<GridContentPatch> =>
	[...collectValuePatchesFromData(source), ...collectAnnotationPatchesFromData(source)].map(
		({ path, value }) => ({
			path,
			value
		})
	);
