import type { GridContentPatch, GridContentPathSegment } from '$lib/gridContentTypes';

// Writes a primitive value to a nested object/array path.
// If intermediate containers are missing, they are created based on the next segment type.
// Example: ['systemData', 'classes', 0, 'level'] => object -> array -> object -> primitive.
export const setValueAtPath = (
	target: Record<string, unknown> | Array<unknown>,
	path: Array<GridContentPathSegment>,
	value: string | number
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

// Applies a batch of GridContent patches immutably.
// The clone keeps store updates predictable and avoids in-place mutation of source objects.
export const applyGridPatches = <T extends Record<string, unknown>>(
	source: T,
	patches: Array<GridContentPatch>
): T => {
	const next = structuredClone(source) as T;
	for (const patch of patches) {
		setValueAtPath(next, patch.path, patch.value);
	}
	return next;
};
