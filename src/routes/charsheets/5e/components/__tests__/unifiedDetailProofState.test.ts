import { describe, expect, it } from 'vitest';
import type { Annotation } from '../../../../../schema';
import {
	cloneFeatureDraft,
	cloneInventoryDraft,
	commitFeatureDraft,
	commitInventoryDraft,
	commitProfileDraft,
	commitSpellDraft,
	removeAnnotationForDraft,
	restoreRemovedAnnotation,
	type ProofFeatureRecord,
	type ProofInventoryRecord,
	type ProofSpellRecord
} from '../unifiedDetailProofState';

const annotation: Annotation = {
	id: 'note-1',
	origin: 'user',
	kind: 'note',
	text: 'Original note'
};

describe('BL-077 bounded focused-detail proof state', () => {
	it('composes authored and annotation changes into one valid profile result', () => {
		const current = { body: 'Original motive', annotations: [annotation] };
		const result = commitProfileDraft(current, {
			body: ' Updated motive ',
			annotations: [{ ...annotation, text: 'Updated note' }]
		});

		expect(result).toEqual({
			ok: true,
			value: {
				body: 'Updated motive',
				annotations: [{ ...annotation, text: 'Updated note' }]
			}
		});
		expect(current).toEqual({ body: 'Original motive', annotations: [annotation] });
	});

	it('rejects an invalid mixed draft atomically', () => {
		const current = { body: 'Original motive', annotations: [annotation] };
		const result = commitProfileDraft(current, {
			body: '   ',
			annotations: [{ ...annotation, text: 'Changed but invalid as a complete draft' }]
		});

		expect(result).toEqual({ ok: false, message: 'Background cannot be empty.' });
		expect(current.annotations[0].text).toBe('Original note');
	});

	it('removes and restores an annotation at its stable draft position', () => {
		const second = { ...annotation, id: 'note-2', text: 'Second note' };
		const removed = removeAnnotationForDraft([annotation, second], 'note-1');

		expect(removed.annotations.map((entry) => entry.id)).toEqual(['note-2']);
		expect(removed.removal).toBeDefined();
		expect(
			restoreRemovedAnnotation(removed.annotations, removed.removal!).map((entry) => entry.id)
		).toEqual(['note-1', 'note-2']);
	});

	it('keeps inventory identity, pin, provenance, references, tags, and unrelated values adapter-owned', () => {
		const current: ProofInventoryRecord = {
			item: {
				id: 'saturated-gear-3',
				name: 'Random rock',
				quantity: 1,
				tags: ['inventory:other'],
				notes: 'Original detail',
				annotations: [annotation]
			},
			pinned: true,
			provenance: 'Player-authored inventory',
			references: ['Campaign notebook']
		};
		const draft = cloneInventoryDraft(current);
		draft.item.name = 'Interesting random rock';
		draft.item.notes = 'Updated detail';
		draft.item.annotations = [{ ...annotation, text: 'Updated note' }];
		const result = commitInventoryDraft(current, draft);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toMatchObject({
			item: {
				id: 'saturated-gear-3',
				name: 'Interesting random rock',
				quantity: 1,
				tags: ['inventory:other'],
				notes: 'Updated detail'
			},
			pinned: true,
			provenance: 'Player-authored inventory',
			references: ['Campaign notebook']
		});
	});

	it('preserves mixed feature ownership and identity while committing its focused draft', () => {
		const current: ProofFeatureRecord = {
			id: 'class-feature-1',
			name: 'Arcane Recovery',
			detail: 'Original detail',
			owner: 'Wizard',
			annotations: [annotation]
		};
		const draft = cloneFeatureDraft(current);
		draft.name = 'Arcane Recovery revised';
		draft.detail = 'Updated detail';
		const result = commitFeatureDraft(current, draft);

		expect(result).toEqual({
			ok: true,
			value: {
				...current,
				name: 'Arcane Recovery revised',
				detail: 'Updated detail'
			}
		});
	});

	it('keeps duplicate-name spell identity, level, pin, and source context stable', () => {
		const current: ProofSpellRecord = {
			id: 'shield-level-one',
			name: 'Shield',
			level: 1,
			prepared: false,
			pinned: true,
			detail: 'Original reminder',
			annotations: [annotation],
			source: 'SRD-linked spell'
		};
		const draft = { ...current, prepared: true, detail: 'Updated reminder' };
		const result = commitSpellDraft(current, draft);

		expect(result).toEqual({
			ok: true,
			value: {
				...current,
				prepared: true,
				detail: 'Updated reminder'
			}
		});
	});
});
