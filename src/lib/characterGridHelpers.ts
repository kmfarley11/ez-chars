import type {
	GridContentAnnotation,
	GridContentData,
	GridContentField,
	GridContentPatch,
	GridContentPathSegment,
	GridContentReference
} from '$lib/gridContentTypes';
import { isGridFieldArray, isGridNestedFields } from '$lib/gridFieldGuards';

// Write-side helpers for GridContent editing and patch application.
// Read/projection helpers live in `gridContentHelpers.ts`.
// ------------------------------------------------------------
// Generic Path Patch Utilities
// ------------------------------------------------------------
// Writes any JSON-like value to a nested object/array path.
// If intermediate containers are missing, they are created based on the next segment type.
// Example: ['systemData', 'classes', 0, 'level'] => object -> array -> object -> primitive.
export const setValueAtPath = (
	target: Record<string, unknown> | Array<unknown>,
	path: Array<GridContentPathSegment>,
	value: unknown
) => {
	if (path.length === 0) return;
	let cursor: Record<string, unknown> | Array<unknown> = target;

	// Walk to parent of the terminal segment, creating containers on demand.
	for (let idx = 0; idx < path.length - 1; idx += 1) {
		const segment = path[idx];
		const nextSegment = path[idx + 1];
		if (typeof segment === 'number') {
			// Numeric segment means we must be inside an array.
			if (!Array.isArray(cursor)) return;
			const existing = cursor[segment];
			if (
				typeof existing !== 'object' ||
				existing === null ||
				(Array.isArray(existing) && typeof nextSegment !== 'number') ||
				(!Array.isArray(existing) && typeof nextSegment === 'number')
			) {
				cursor[segment] = typeof nextSegment === 'number' ? [] : {};
			}
			cursor = cursor[segment] as Record<string, unknown> | Array<unknown>;
			continue;
		}

		// String segment means we must be inside an object.
		if (Array.isArray(cursor)) return;
		const existing = cursor[segment];
		if (
			typeof existing !== 'object' ||
			existing === null ||
			(Array.isArray(existing) && typeof nextSegment !== 'number') ||
			(!Array.isArray(existing) && typeof nextSegment === 'number')
		) {
			cursor[segment] = typeof nextSegment === 'number' ? [] : {};
		}
		cursor = cursor[segment] as Record<string, unknown> | Array<unknown>;
	}

	// Apply the terminal write only if container type matches segment type.
	const lastSegment = path[path.length - 1];
	if (typeof lastSegment === 'number') {
		if (!Array.isArray(cursor)) return;
		cursor[lastSegment] = value;
		return;
	}

	if (Array.isArray(cursor)) return;
	cursor[lastSegment] = value;
};

// ------------------------------------------------------------
// Reference Helpers
// ------------------------------------------------------------
const stripFragment = (url: string): string => url.split('#', 1)[0];

// Build the clickable URL for supported reference kinds while preserving app conventions.
export const toReferenceHref = (reference: GridContentReference): string | undefined => {
	const urlValue = reference.locator.url?.trim();
	if (!urlValue) return undefined;

	if (reference.kind === 'pdf') {
		if (typeof reference.locator.page !== 'number' || !Number.isFinite(reference.locator.page)) {
			return urlValue;
		}
		const page = Math.max(1, Math.trunc(reference.locator.page));
		return `${stripFragment(urlValue)}#page=${page}`;
	}

	if (reference.kind === 'url') {
		const anchorValue = reference.locator.anchor?.trim();
		if (!anchorValue) return urlValue;
		const normalizedAnchor = anchorValue.startsWith('#') ? anchorValue.slice(1) : anchorValue;
		if (normalizedAnchor.length === 0) return urlValue;
		return `${stripFragment(urlValue)}#${normalizedAnchor}`;
	}

	return undefined;
};

// ------------------------------------------------------------
// Grid Draft Mutation Helpers
// ------------------------------------------------------------
const updateGridFieldAtPath = (
	field: GridContentField,
	path: Array<GridContentPathSegment>,
	updater: (_field: GridContentField) => GridContentField
): GridContentField => {
	const [head, ...rest] = path;
	if (head === undefined) return updater(field);

	if (isGridFieldArray(field.value)) {
		if (typeof head !== 'number') return field;
		const target = field.value[head];
		if (!target) return field;
		return {
			...field,
			value: field.value.map((entry, idx) =>
				idx === head ? updateGridFieldAtPath(target, rest, updater) : entry
			)
		};
	}

	if (!isGridNestedFields(field.value) || typeof head !== 'string') return field;
	const target = field.value[head];
	if (!target) return field;
	return {
		...field,
		value: {
			...field.value,
			[head]: updateGridFieldAtPath(target, rest, updater)
		}
	};
};

const updateGridFieldValueAtPath = (
	field: GridContentField,
	path: Array<GridContentPathSegment>,
	nextValue: string | number | boolean
): GridContentField =>
	updateGridFieldAtPath(field, path, (leafField) => ({
		...leafField,
		value: nextValue
	}));

export const updateGridDataAtPath = (
	source: GridContentData,
	path: Array<GridContentPathSegment>,
	nextValue: string | number | boolean
): GridContentData => {
	const [head, ...rest] = path;
	if (typeof head !== 'string') return source;
	const target = source[head];
	if (!target) return source;
	return {
		...source,
		[head]: updateGridFieldValueAtPath(target, rest, nextValue)
	};
};

const updateGridFieldAnnotationsAtPath = (
	field: GridContentField,
	path: Array<GridContentPathSegment>,
	nextAnnotations: Array<GridContentAnnotation>
): GridContentField =>
	updateGridFieldAtPath(field, path, (leafField) => ({
		...leafField,
		annotations: nextAnnotations
	}));

export const updateGridAnnotationsAtPath = (
	source: GridContentData,
	path: Array<GridContentPathSegment>,
	nextAnnotations: Array<GridContentAnnotation>
): GridContentData => {
	const [head, ...rest] = path;
	if (typeof head !== 'string') return source;
	const target = source[head];
	if (!target) return source;
	return {
		...source,
		[head]: updateGridFieldAnnotationsAtPath(target, rest, nextAnnotations)
	};
};

const appendGridFieldArrayItemAtPath = (
	field: GridContentField,
	path: Array<GridContentPathSegment>,
	nextItem: GridContentField
): GridContentField =>
	updateGridFieldAtPath(field, path, (targetField) => {
		if (!isGridFieldArray(targetField.value)) return targetField;
		return {
			...targetField,
			value: [...targetField.value, nextItem]
		};
	});

export const appendGridArrayItemAtPath = (
	source: GridContentData,
	path: Array<GridContentPathSegment>,
	nextItem: GridContentField
): GridContentData => {
	const [head, ...rest] = path;
	if (typeof head !== 'string') return source;
	const target = source[head];
	if (!target) return source;
	return {
		...source,
		[head]: appendGridFieldArrayItemAtPath(target, rest, nextItem)
	};
};

const removeGridFieldArrayItemAtPath = (
	field: GridContentField,
	path: Array<GridContentPathSegment>,
	removeIndex: number
): GridContentField =>
	updateGridFieldAtPath(field, path, (targetField) => {
		if (!isGridFieldArray(targetField.value)) return targetField;
		return {
			...targetField,
			value: targetField.value.filter((_, idx) => idx !== removeIndex)
		};
	});

export const removeGridArrayItemAtPath = (
	source: GridContentData,
	path: Array<GridContentPathSegment>,
	removeIndex: number
): GridContentData => {
	const [head, ...rest] = path;
	if (typeof head !== 'string') return source;
	const target = source[head];
	if (!target) return source;
	return {
		...source,
		[head]: removeGridFieldArrayItemAtPath(target, rest, removeIndex)
	};
};

// ------------------------------------------------------------
// Patch Application
// ------------------------------------------------------------
// Removes a value at a nested path when explicit deletion is requested.
const unsetValueAtPath = (
	target: Record<string, unknown> | Array<unknown>,
	path: Array<GridContentPathSegment>
) => {
	if (path.length === 0) return;
	let cursor: Record<string, unknown> | Array<unknown> | undefined = target;
	for (let idx = 0; idx < path.length - 1; idx += 1) {
		if (!cursor) return;
		const segment = path[idx];
		if (typeof segment === 'number') {
			if (!Array.isArray(cursor)) return;
			const next = cursor[segment];
			if (typeof next !== 'object' || next === null) return;
			cursor = next as Record<string, unknown> | Array<unknown>;
			continue;
		}

		if (Array.isArray(cursor)) return;
		const next = cursor[segment];
		if (typeof next !== 'object' || next === null) return;
		cursor = next as Record<string, unknown> | Array<unknown>;
	}

	const lastSegment = path[path.length - 1];
	if (typeof lastSegment === 'number') {
		if (!Array.isArray(cursor)) return;
		cursor[lastSegment] = undefined;
		return;
	}

	if (Array.isArray(cursor)) return;
	delete cursor[lastSegment];
};

// Applies a batch of GridContent patches immutably.
// The clone keeps store updates predictable and avoids in-place mutation of source objects.
export const applyGridPatches = <T extends Record<string, unknown>>(
	source: T,
	patches: Array<GridContentPatch>
): T => {
	const next = structuredClone(source) as T;
	for (const patch of patches) {
		if (typeof patch.value === 'undefined') {
			unsetValueAtPath(next, patch.path);
			continue;
		}
		setValueAtPath(next, patch.path, patch.value);
	}
	return next;
};
