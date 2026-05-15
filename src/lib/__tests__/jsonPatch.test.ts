import { describe, expect, it } from 'vitest';
import { immutableJSONPatch, type JSONPatchDocument } from 'immutable-json-patch';
import {
	createRepresentativePatchCharacter,
	type RepresentativePatchCharacter
} from '../../test-utils/jsonPatchFixtures';

describe('RFC 6902 JSON Patch adoption', () => {
	it('applies standard JSON Patch documents without mutating the source character', () => {
		const character = createRepresentativePatchCharacter();
		const patch: JSONPatchDocument = [
			{ op: 'replace', path: '/systemData/abilities/strength/score', value: 16 },
			{
				op: 'replace',
				path: '/systemData/abilities/strength/annotations',
				value: [{ id: 'strength-note', text: 'Updated strength note' }]
			}
		];

		const updated = immutableJSONPatch<RepresentativePatchCharacter>(character, patch);

		expect(updated.systemData.abilities.strength.score).toBe(16);
		expect(updated.systemData.abilities.strength.annotations).toEqual([
			{ id: 'strength-note', text: 'Updated strength note' }
		]);
		expect(character.systemData.abilities.strength.score).toBe(12);
		expect(character.systemData.abilities.strength.annotations).toEqual([
			{ id: 'strength-note', text: 'Initial strength note' }
		]);
	});

	it('shares unchanged branches while replacing changed ancestors', () => {
		const character = createRepresentativePatchCharacter();
		const patch: JSONPatchDocument = [
			{ op: 'replace', path: '/systemData/abilities/strength/score', value: 18 }
		];

		const updated = immutableJSONPatch<RepresentativePatchCharacter>(character, patch);

		expect(updated).not.toBe(character);
		expect(updated.systemData).not.toBe(character.systemData);
		expect(updated.systemData.abilities).not.toBe(character.systemData.abilities);
		expect(updated.systemData.abilities.strength).not.toBe(character.systemData.abilities.strength);
		expect(updated.systemData.abilities.dexterity).toBe(character.systemData.abilities.dexterity);
		expect(updated.systemData.features).toBe(character.systemData.features);
		expect(updated.systemData.spells).toBe(character.systemData.spells);
		expect(updated.inventory).toBe(character.inventory);
		expect(updated.notes).toBe(character.notes);
	});

	it('supports list updates with standard test, replace, add, remove, and move operations', () => {
		const character = createRepresentativePatchCharacter();
		const patch: JSONPatchDocument = [
			{ op: 'test', path: '/systemData/features/0/id', value: 'feature-action-surge' },
			{
				op: 'replace',
				path: '/systemData/features/0',
				value: { id: 'feature-action-surge', name: 'Action Surge', uses: '2 / short rest' }
			},
			{
				op: 'add',
				path: '/systemData/features/-',
				value: { id: 'feature-indomitable', name: 'Indomitable', uses: '1 / long rest' }
			},
			{ op: 'move', from: '/systemData/features/2', path: '/systemData/features/1' },
			{ op: 'remove', path: '/systemData/features/2' }
		];

		const updated = immutableJSONPatch<RepresentativePatchCharacter>(character, patch);

		expect(updated.systemData.features).toEqual([
			{ id: 'feature-action-surge', name: 'Action Surge', uses: '2 / short rest' },
			{ id: 'feature-indomitable', name: 'Indomitable', uses: '1 / long rest' }
		]);
		expect(character.systemData.features).toEqual([
			{ id: 'feature-action-surge', name: 'Action Surge', uses: '1 / short rest' },
			{ id: 'feature-second-wind', name: 'Second Wind', uses: '1 / short rest' }
		]);
	});

	it('throws on failed test operations without mutating the source character', () => {
		const character = createRepresentativePatchCharacter();
		const patch: JSONPatchDocument = [
			{ op: 'test', path: '/systemData/features/0/id', value: 'unexpected-id' },
			{
				op: 'replace',
				path: '/systemData/features/0',
				value: { id: 'feature-action-surge', name: 'Action Surge', uses: '2 / short rest' }
			}
		];

		expect(() => immutableJSONPatch<RepresentativePatchCharacter>(character, patch)).toThrow(
			'Test failed'
		);
		expect(character.systemData.features[0]).toEqual({
			id: 'feature-action-surge',
			name: 'Action Surge',
			uses: '1 / short rest'
		});
	});
});
