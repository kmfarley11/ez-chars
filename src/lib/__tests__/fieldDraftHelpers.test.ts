import { describe, expect, it } from 'vitest';
import { immutableJSONPatch } from 'immutable-json-patch';
import { FieldDraft } from '../fieldDraftHelpers';
import {
	createRepresentativePatchCharacter,
	type RepresentativePatchCharacter
} from '../../test-utils/jsonPatchFixtures';

describe('field draft helpers', () => {
	it('starts a value draft without mutating the source value', () => {
		const character = createRepresentativePatchCharacter();
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/systemData/abilities/strength/score',
			value: character.systemData.abilities.strength.score
		});

		expect(draft).toMatchObject({
			kind: 'value',
			path: '/systemData/abilities/strength/score',
			initialValue: 12,
			value: 12
		});
		expect(draft.isDirty()).toBe(false);
	});

	it('updates a value draft and prepares a guarded JSON Patch document', () => {
		const character = createRepresentativePatchCharacter();
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/systemData/abilities/strength/score',
			value: character.systemData.abilities.strength.score
		}).update(16);

		const patch = draft.prepareAsPatch();
		const updated = immutableJSONPatch<RepresentativePatchCharacter>(character, patch);

		expect(draft.isDirty()).toBe(true);
		expect(patch).toEqual([
			{ op: 'test', path: '/systemData/abilities/strength/score', value: 12 },
			{ op: 'replace', path: '/systemData/abilities/strength/score', value: 16 }
		]);
		expect(updated.systemData.abilities.strength.score).toBe(16);
		expect(character.systemData.abilities.strength.score).toBe(12);
	});

	it('prepares no operations for unchanged drafts', () => {
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/identity/name',
			value: 'Patch Tester'
		});

		expect(draft.prepareAsPatch()).toEqual([]);
	});

	it('cancels a draft without producing a patch', () => {
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/identity/name',
			value: 'Patch Tester'
		}).update('Changed Name');

		expect(draft.isDirty()).toBe(true);
		expect(draft.cancel()).toBeUndefined();
	});

	it('supports annotation drafts as full-array replacement patches', () => {
		const character = createRepresentativePatchCharacter();
		const draft = FieldDraft.begin({
			kind: 'annotation',
			path: '/systemData/abilities/strength/annotations',
			value: character.systemData.abilities.strength.annotations
		}).update([
			{
				id: 'strength-note',
				text: 'Updated strength note'
			}
		]);

		const patch = draft.prepareAsPatch();
		const updated = immutableJSONPatch<RepresentativePatchCharacter>(character, patch);

		expect(patch).toEqual([
			{
				op: 'test',
				path: '/systemData/abilities/strength/annotations',
				value: [{ id: 'strength-note', text: 'Initial strength note' }]
			},
			{
				op: 'replace',
				path: '/systemData/abilities/strength/annotations',
				value: [{ id: 'strength-note', text: 'Updated strength note' }]
			}
		]);
		expect(updated.systemData.abilities.strength.annotations).toEqual([
			{ id: 'strength-note', text: 'Updated strength note' }
		]);
		expect(character.systemData.abilities.strength.annotations).toEqual([
			{ id: 'strength-note', text: 'Initial strength note' }
		]);
	});
});
