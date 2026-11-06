import type { JSONPatchDocument, JSONPointer } from 'immutable-json-patch';
import type {
	GridFieldPatchOperation,
	GridContentBindPath,
	GridContentField,
	GridContentPatch
} from '$utils/gridContentTypes';

// FieldDraft is immutable by convention: methods return a new draft instead of
// mutating `this`. That is not a hard architectural requirement, but it makes
// Svelte usage safer because plain TypeScript objects update most predictably
// when callers reassign component state, e.g. `draft = draft.update(value)`.
export type FieldDraftKind = 'value' | 'annotation';

export type FieldDraftInput<T = unknown> = {
	kind: FieldDraftKind;
	path: JSONPointer;
	value: T;
	operation?: GridFieldPatchOperation;
};

const cloneDraftValue = <T>(value: T): T => structuredClone(value);

const valuesEqual = (left: unknown, right: unknown): boolean =>
	JSON.stringify(left) === JSON.stringify(right);

export class FieldDraft<T = unknown> {
	private constructor(
		readonly kind: FieldDraftKind,
		readonly path: JSONPointer,
		readonly initialValue: T,
		readonly value: T,
		readonly operation: GridFieldPatchOperation
	) {}

	static begin<T>({ kind, path, value, operation = 'replace' }: FieldDraftInput<T>): FieldDraft<T> {
		return new FieldDraft(kind, path, cloneDraftValue(value), cloneDraftValue(value), operation);
	}

	// Return a new draft so callers can reassign state explicitly and older UI
	// references cannot observe hidden in-place draft mutation.
	update(value: T): FieldDraft<T> {
		return new FieldDraft(
			this.kind,
			this.path,
			this.initialValue,
			cloneDraftValue(value),
			this.operation
		);
	}

	cancel(): undefined {
		return undefined;
	}

	isDirty(): boolean {
		return !valuesEqual(this.initialValue, this.value);
	}

	prepareAsPatch(): JSONPatchDocument {
		if (!this.isDirty()) return [];

		if (this.operation === 'add') {
			return [{ op: 'add', path: this.path, value: this.value }];
		}

		return [
			{ op: 'test', path: this.path, value: this.initialValue },
			{ op: 'replace', path: this.path, value: this.value }
		];
	}
}

// Shared synchronous command boundary; UI owns recovery/focus, edition adapters
// own validation and persistence. Never interpret a missing handler as success.
export const commitFieldDraft = <T>(
	draft: FieldDraft<T>,
	save:
		| ((_patch: JSONPatchDocument, _compatibility: Array<GridContentPatch>) => boolean | void)
		| undefined,
	path?: GridContentBindPath
): void => {
	const patch = draft.prepareAsPatch();
	if (!patch.length) return;
	if (!save) throw new Error('This field has no save handler.');
	if (save(patch, path ? [{ path, value: draft.value }] : []) === false)
		throw new Error('Could not save this field.');
};

// Numeric-only groups retain their existing coupled save. Mixed/new-type groups
// must forward the edited leaf's guarded patch, never materialize sibling defaults.
export const commitRuntimeGroupField = (
	fields: Array<[string, GridContentField]>,
	activeKey: string,
	patch: JSONPatchDocument,
	compatibility: Array<GridContentPatch>,
	saveField:
		| ((_patch: JSONPatchDocument, _compatibility: Array<GridContentPatch>) => boolean | void)
		| undefined,
	saveGroup: ((_patches: Array<GridContentPatch>) => boolean | void) | undefined
): boolean | void => {
	const active = compatibility[0];
	if (!active) return false;
	const numericOnly = fields.every(([, field]) =>
		field.inputKind ? field.inputKind === 'number' : typeof field.value === 'number'
	);
	if (!numericOnly) {
		if (!saveField) throw new Error('This field has no save handler.');
		return saveField(patch, compatibility);
	}
	const patches = fields.flatMap(([key, field]) => {
		const path = field.binding?.valuePatchPath ?? field.bindPath;
		return path ? [{ path, value: key === activeKey ? active.value : field.value }] : [];
	});
	if (patches.length !== fields.length) return false;
	if (!saveGroup) throw new Error('This field has no save handler.');
	return saveGroup(patches);
};
