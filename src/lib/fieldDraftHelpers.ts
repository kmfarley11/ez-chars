import type { JSONPatchDocument, JSONPointer } from 'immutable-json-patch';

// FieldDraft is immutable by convention: methods return a new draft instead of
// mutating `this`. That is not a hard architectural requirement, but it makes
// Svelte usage safer because plain TypeScript objects update most predictably
// when callers reassign component state, e.g. `draft = draft.update(value)`.
export type FieldDraftKind = 'value' | 'annotation';

export type FieldDraftInput<T = unknown> = {
	kind: FieldDraftKind;
	path: JSONPointer;
	value: T;
};

const cloneDraftValue = <T>(value: T): T => structuredClone(value);

const valuesEqual = (left: unknown, right: unknown): boolean =>
	JSON.stringify(left) === JSON.stringify(right);

export class FieldDraft<T = unknown> {
	private constructor(
		readonly kind: FieldDraftKind,
		readonly path: JSONPointer,
		readonly initialValue: T,
		readonly value: T
	) {}

	static begin<T>({ kind, path, value }: FieldDraftInput<T>): FieldDraft<T> {
		return new FieldDraft(kind, path, cloneDraftValue(value), cloneDraftValue(value));
	}

	// Return a new draft so callers can reassign state explicitly and older UI
	// references cannot observe hidden in-place draft mutation.
	update(value: T): FieldDraft<T> {
		return new FieldDraft(this.kind, this.path, this.initialValue, cloneDraftValue(value));
	}

	cancel(): undefined {
		return undefined;
	}

	isDirty(): boolean {
		return !valuesEqual(this.initialValue, this.value);
	}

	prepareAsPatch(): JSONPatchDocument {
		return this.isDirty()
			? [
					{ op: 'test', path: this.path, value: this.initialValue },
					{ op: 'replace', path: this.path, value: this.value }
				]
			: [];
	}
}
