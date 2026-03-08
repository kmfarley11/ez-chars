import type {
	GridContentAnnotation,
	GridContentData,
	GridContentField,
	GridContentFieldValue,
	GridContentPatch,
	GridContentPathSegment,
	GridContentReference
} from '$lib/gridContentTypes';

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
// Grid Draft Mutation Helpers
// ------------------------------------------------------------
export const annotationOrigins: Array<GridContentAnnotation['origin']> = ['user', 'source'];
export const annotationKinds: Array<GridContentAnnotation['kind']> = [
	'note',
	'reference',
	'summary',
	'tag'
];
export const annotationRefKinds: Array<GridContentReference['kind']> = ['pdf', 'url'];

const isGridFieldArray = (value: GridContentFieldValue): value is Array<GridContentField> =>
	Array.isArray(value);

const isGridNestedFields = (
	value: GridContentFieldValue
): value is Record<string, GridContentField> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const updateGridFieldValueAtPath = (
	field: GridContentField,
	path: Array<GridContentPathSegment>,
	nextValue: string | number
): GridContentField => {
	const [head, ...rest] = path;
	if (head === undefined) {
		return {
			...field,
			value: nextValue
		};
	}

	if (isGridFieldArray(field.value)) {
		if (typeof head !== 'number') return field;
		const target = field.value[head];
		if (!target) return field;
		return {
			...field,
			value: field.value.map((entry, idx) =>
				idx === head ? updateGridFieldValueAtPath(target, rest, nextValue) : entry
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
			[head]: updateGridFieldValueAtPath(target, rest, nextValue)
		}
	};
};

export const updateGridDataAtPath = (
	source: GridContentData,
	path: Array<GridContentPathSegment>,
	nextValue: string | number
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
): GridContentField => {
	const [head, ...rest] = path;
	if (head === undefined) {
		return {
			...field,
			annotations: nextAnnotations
		};
	}

	if (isGridFieldArray(field.value)) {
		if (typeof head !== 'number') return field;
		const target = field.value[head];
		if (!target) return field;
		return {
			...field,
			value: field.value.map((entry, idx) =>
				idx === head ? updateGridFieldAnnotationsAtPath(target, rest, nextAnnotations) : entry
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
			[head]: updateGridFieldAnnotationsAtPath(target, rest, nextAnnotations)
		}
	};
};

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

export const parseAnnotationTags = (value: string): Array<string> =>
	value
		.split(',')
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);

// ------------------------------------------------------------
// Annotation Editing Helpers
// ------------------------------------------------------------
const hasLocatorValue = (value: unknown): boolean => {
	if (typeof value === 'number') return Number.isFinite(value);
	if (typeof value === 'string') return value.trim().length > 0;
	return false;
};

export const updateAnnotationRefAtIndex = (
	annotations: Array<GridContentAnnotation>,
	annotationIdx: number,
	updater: (_value: GridContentReference) => GridContentReference
): Array<GridContentAnnotation> =>
	annotations.map((entry, idx) => {
		if (idx !== annotationIdx) return entry;
		const baseRef: GridContentReference = entry.ref ?? {
			sourceId: '',
			kind: 'url',
			locator: {}
		};
		const nextRef = updater(baseRef);
		const hasSource = nextRef.sourceId.trim().length > 0;
		const hasLocator = Object.values(nextRef.locator).some((locatorValue) =>
			hasLocatorValue(locatorValue)
		);
		if (!hasSource && !hasLocator) {
			const { ref: _ignored, ...rest } = entry;
			return rest;
		}
		return {
			...entry,
			ref: nextRef
		};
	});

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
