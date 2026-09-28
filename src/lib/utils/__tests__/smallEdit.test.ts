import { describe, expect, it } from 'vitest';
import {
	beginSmallDraft,
	createSmallNote,
	sameEditValue,
	changeSmallDraft,
	isSmallDraftDirty,
	mergeSmallNoteChange,
	parseSmallScalar,
	saveSmallDraft
} from '../smallEdit';
import type { Annotation } from '../../../schema';

describe('small edit transactions', () => {
	it('allocates a new note deterministically without sharing draft state', () => {
		const note = createSmallNote(() => 'test-note');
		expect(note).toEqual({ id: 'test-note', origin: 'user', kind: 'note', text: '' });
		const draft = beginSmallDraft(note);
		draft.value.text = 'Not saved';
		expect(note.text).toBe('');
		expect(draft.initial.text).toBe('');
	});
	it('compares canonicalized records structurally and guards ambiguous imported notes', () => {
		expect(sameEditValue({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
		const note: Annotation = { kind: 'note', origin: 'user', text: 'Imported' };
		expect(mergeSmallNoteChange([note], { before: note, after: undefined })).toEqual([]);
		expect(
			mergeSmallNoteChange([note, { ...note }], { before: note, after: undefined })
		).toBeUndefined();
		expect(
			mergeSmallNoteChange([note, note], {
				before: note,
				after: { ...note, text: 'Second' },
				position: { index: 1, siblings: [note, note] }
			})
		).toEqual([note, { ...note, text: 'Second' }]);
		expect(
			mergeSmallNoteChange([note], {
				before: note,
				after: undefined,
				position: { index: 1, siblings: [note, note] }
			})
		).toBeUndefined();
	});
	it('saves A independently and cancelling B has no operation to roll A back', () => {
		const stored = { a: 1, b: 2 };
		const a = changeSmallDraft(beginSmallDraft('1'), '3');
		expect(isSmallDraftDirty(a)).toBe(true);
		expect(
			saveSmallDraft(a, (raw) => {
				stored.a = Number(raw);
				return { ok: true };
			})
		).toBeUndefined();
		const b = changeSmallDraft(beginSmallDraft('2'), '4');
		expect(isSmallDraftDirty(b)).toBe(true);
		// Local Cancel drops b, never submits its draft or an old whole-target snapshot.
		expect(stored).toEqual({ a: 3, b: 2 });
	});
	it('retains failed drafts and distinguishes clean from dirty navigation', () => {
		const clean = beginSmallDraft(false);
		expect(isSmallDraftDirty(clean)).toBe(false);
		const dirty = changeSmallDraft(clean, true);
		const failed = saveSmallDraft(dirty, () => ({ ok: false, message: 'Target changed.' }));
		expect(failed).toEqual({ initial: false, value: true, error: 'Target changed.' });
		expect(isSmallDraftDirty(failed)).toBe(true);
		expect(changeSmallDraft(failed!, false).error).toBeUndefined();
	});
	it('does not coerce empty or invalid numeric drafts to zero', () => {
		for (const raw of ['', ' ', 'Infinity', 'wat'])
			expect(() => parseSmallScalar('number', raw)).toThrow();
		expect(parseSmallScalar('number', '0')).toBe(0);
		expect(parseSmallScalar('boolean', false)).toBe(false);
		expect(parseSmallScalar('multiline', 'line\nline')).toBe('line\nline');
		expect(() => parseSmallScalar('select', 'unknown', ['known'])).toThrow();
	});
	it('merges one note by identity and preserves neighboring current notes', () => {
		const a: Annotation = { id: 'a', kind: 'note', origin: 'user', text: 'A' };
		const b: Annotation = { id: 'b', kind: 'note', origin: 'user', text: 'New B' };
		expect(mergeSmallNoteChange([a, b], { before: a, after: { ...a, text: 'Edited' } })).toEqual([
			{ ...a, text: 'Edited' },
			b
		]);
		expect(mergeSmallNoteChange([a, b], { before: a, after: undefined })).toEqual([b]);
		expect(mergeSmallNoteChange([b], { before: a, after: a })).toBeUndefined();
		expect(mergeSmallNoteChange([a], { before: undefined, after: a })).toBeUndefined();
		expect(
			mergeSmallNoteChange([{ ...a, text: 'Changed' }], { before: a, after: undefined })
		).toBeUndefined();
	});
});
