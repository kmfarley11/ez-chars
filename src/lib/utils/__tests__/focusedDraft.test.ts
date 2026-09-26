import { describe, expect, it } from 'vitest';
import {
	cloneAnnotations,
	findRemovedDraftAnnotation,
	restoreRemovedDraftAnnotation,
	validateDraftAnnotations
} from '../focusedDraft';

describe('focused annotation drafts', () => {
	it('clones nested reference state and restores a removed annotation at its prior position', () => {
		const source = [
			{ id: 'a', origin: 'user' as const, kind: 'note' as const, text: 'First' },
			{
				id: 'b',
				origin: 'user' as const,
				kind: 'note' as const,
				text: 'Second',
				ref: { kind: 'pdf' as const, sourceId: 'srd', locator: { page: 7 } }
			}
		];
		const draft = cloneAnnotations(source);
		draft[1].ref!.locator.page = 8;
		expect(source[1].ref?.locator.page).toBe(7);

		const remaining = [draft[0]];
		const removal = findRemovedDraftAnnotation(draft, remaining);
		expect(removal).toMatchObject({ index: 1, annotation: { id: 'b' } });
		expect(restoreRemovedDraftAnnotation(remaining, removal!)).toEqual(draft);
	});

	it('rejects an empty annotation while accepting named or referenced notes', () => {
		expect(
			validateDraftAnnotations([{ id: 'empty', origin: 'user', kind: 'note', text: '  ' }])
		).toBe('Note 1 needs text, a name, or a reference.');
		expect(
			validateDraftAnnotations([{ id: 'named', origin: 'user', kind: 'note', name: 'Reminder' }])
		).toBeUndefined();
	});
});
