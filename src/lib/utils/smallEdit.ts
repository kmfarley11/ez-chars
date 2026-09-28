import type { Annotation } from '../../schema';
import type { GridAnnotationEditorConfig } from './gridContentTypes';

export type ScalarValue = string | number | boolean | undefined;
export type SmallEditResult = { ok: true } | { ok: false; message: string };
export type NoteChange = {
	before: Annotation | undefined;
	after: Annotation | undefined;
	// A read-only position guard for imported ID-less notes, not a replacement-array edit.
	position?: { index: number; siblings: Array<Annotation> };
};

export interface SmallEditNotes {
	read: () => Array<Annotation>;
	commit: (change: NoteChange) => SmallEditResult;
}

export interface SmallEditField {
	key: string;
	// A projection's positional entry path may resolve to a stable record-owned key.
	entryKey?: string;
	label: string;
	kind: 'text' | 'number' | 'boolean' | 'multiline' | 'select';
	options?: Array<string>;
	read: () => ScalarValue;
	display?: () => ScalarValue;
	commit?: (before: ScalarValue, after: ScalarValue) => SmallEditResult;
	canClear?: boolean;
	explanation?: string;
	notes?: SmallEditNotes;
}

export interface SmallEditModel {
	title: string;
	badges?: () => Array<string>;
	fields: Array<SmallEditField>;
	annotationEditorConfig?: GridAnnotationEditorConfig;
	actions?: Array<SmallEditAction>;
}

// Collection lifecycle remains one explicit operation, not an outer value draft.
export interface SmallEditAction {
	key: string;
	label: string;
	confirmation?: string;
	fields?: Array<Pick<SmallEditField, 'key' | 'label' | 'kind' | 'options' | 'read'>>;
	commit: (values: Record<string, ScalarValue>) => SmallEditResult;
}

export const sameEditValue = (a: unknown, b: unknown): boolean => {
	if (Object.is(a, b)) return true;
	if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
	if (Array.isArray(a) || Array.isArray(b))
		return (
			Array.isArray(a) &&
			Array.isArray(b) &&
			a.length === b.length &&
			a.every((value, index) => sameEditValue(value, b[index]))
		);
	const left = Object.entries(a).filter(([, value]) => value !== undefined);
	const right = Object.entries(b).filter(([, value]) => value !== undefined);
	return (
		left.length === right.length &&
		left.every(([key, value]) => sameEditValue(value, (b as Record<string, unknown>)[key]))
	);
};

export type SmallDraft<T> = { initial: T; value: T; error?: string };
export const beginSmallDraft = <T>(value: T): SmallDraft<T> => ({
	initial: structuredClone(value),
	value: structuredClone(value)
});
export const changeSmallDraft = <T>(draft: SmallDraft<T>, value: T): SmallDraft<T> => ({
	initial: draft.initial,
	value: structuredClone(value)
});
export const isSmallDraftDirty = <T>(draft: SmallDraft<T> | undefined): boolean =>
	draft !== undefined && !sameEditValue(draft.initial, draft.value);
export const saveSmallDraft = <T>(
	draft: SmallDraft<T>,
	commit: (value: T) => SmallEditResult
): SmallDraft<T> | undefined => {
	try {
		const result = commit(draft.value);
		return result.ok ? undefined : { ...draft, error: result.message };
	} catch (error) {
		return {
			...draft,
			error: error instanceof Error ? error.message : 'Unable to save this edit.'
		};
	}
};

export const createSmallNote = (allocateId: () => string): Annotation => ({
	id: allocateId(),
	origin: 'user',
	kind: 'note',
	text: ''
});

export const parseSmallScalar = (
	kind: SmallEditField['kind'],
	raw: string | boolean,
	options?: Array<string>
): ScalarValue => {
	if (kind === 'boolean') {
		if (typeof raw !== 'boolean') throw new Error('Choose a checked or unchecked value.');
		return raw;
	}
	if (typeof raw !== 'string') throw new Error('Enter a value.');
	if (kind === 'number') {
		if (!raw.trim() || !Number.isFinite(Number(raw))) throw new Error('Enter a finite number.');
		return Number(raw);
	}
	if (kind === 'select' && !options?.includes(raw)) throw new Error('Choose an available option.');
	return raw;
};

// Apply only this note operation to the latest collection, never a stale full-array draft.
export const mergeSmallNoteChange = (
	notes: Array<Annotation>,
	{ before, after, position }: NoteChange
): Array<Annotation> | undefined => {
	const id = before?.id ?? after?.id;
	// Imported v0 notes may lack an ID. Only a unique unchanged snapshot is safe to target;
	// never mutate all equal entries or allocate an identity as an incidental edit.
	if (!id && before) {
		if (position) {
			if (!sameEditValue(notes, position.siblings) || !sameEditValue(notes[position.index], before))
				return undefined;
			return notes.flatMap((note, index) =>
				index === position.index ? (after ? [after] : []) : [note]
			);
		}
		const matches = notes.flatMap((note, index) => (sameEditValue(note, before) ? [index] : []));
		if (matches.length !== 1) return undefined;
		return notes.flatMap((note, index) => (index === matches[0] ? (after ? [after] : []) : [note]));
	}
	if (!id || (before && after && before.id !== after.id)) return undefined;
	if (notes.filter((note) => note.id === id).length > 1) return undefined;
	const current = notes.find((note) => note.id === id);
	if (!sameEditValue(current, before)) return undefined;
	if (!before) return after ? [...notes, after] : undefined;
	return after
		? notes.map((note) => (note.id === id ? after : note))
		: notes.filter((note) => note.id !== id);
};
