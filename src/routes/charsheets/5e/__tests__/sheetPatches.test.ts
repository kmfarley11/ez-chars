import { describe, expect, it } from 'vitest';
import { applyGridPatches } from '$lib/characterGridHelpers';
import { create5e2014Character, type CharacterDocument5e2014 } from '../../../../schema';
import {
	classFeatureListPathPrefix,
	inventoryCurrencyPathPrefix,
	inventoryListPathPrefix,
	proficiencyLanguagesPathPrefix,
	roleplayNotePathPrefix,
	runtimeActionListPathPrefix,
	scratchpadNotesPathPrefix,
	spellListLevelPathPrefix
} from '../sheetConstants';
import { normalize5eGridPatches } from '../sheetPatches';

const createPatchCharacter = (): CharacterDocument5e2014 =>
	create5e2014Character({
		name: 'Patch Tester',
		meta: { id: 'patch-tester' },
		identity: { ancestryLineage: 'Elf', background: 'Sage' },
		inventory: [
			{ id: 'weapon-1', name: 'Longsword', tags: ['inventory:weapon'], equipped: true },
			{ id: 'gear-1', name: 'Rope', quantity: 1 },
			{ id: 'gp-1', name: 'GP', quantity: 5, tags: ['inventory:currency:gp'] }
		],
		notes: [
			{ id: 'motives-1', title: 'Motives', body: 'Old motive', kind: 'lore' },
			{ id: 'scratch-1', title: 'Scratch', body: 'Old scratch', kind: 'quick' }
		],
		systemData: {
			race: { name: 'Elf', languages: ['Common'] },
			background: { name: 'Sage', proficiencies: { languages: ['Draconic'] } },
			classes: [
				{ name: 'Fighter', level: 1, features: [{ name: 'Second Wind', featureId: 'second-wind' }] }
			],
			runtimeActions: [{ id: 'action-1', name: 'Longsword', timing: 'action', category: 'attack' }],
			spellcasting: {
				ability: 'int',
				slots: { '1': { max: 2, used: 0 } },
				spells: [
					{ name: 'Fire Bolt', level: 0 },
					{ name: 'Shield', level: 1, prepared: true }
				]
			}
		}
	});

describe('5e grid patch normalization', () => {
	it('normalizes spell, runtime action, language, and class-feature virtual paths', () => {
		const character = createPatchCharacter();

		const spellPatches = normalize5eGridPatches(character, [
			{
				path: [spellListLevelPathPrefix, 1],
				value: [{ name: 'Magic Missile', prepared: true }]
			}
		]);
		expect(spellPatches).toEqual([
			{
				path: ['systemData', 'spellcasting', 'spells'],
				value: [
					{ name: 'Fire Bolt', level: 0 },
					{ name: 'Magic Missile', level: 1, prepared: true }
				]
			}
		]);

		const actionPatches = normalize5eGridPatches(character, [
			{
				path: [runtimeActionListPathPrefix],
				value: [{ id: 'action-1', name: 'Longsword +1', timing: 'action' }]
			}
		]);
		expect(actionPatches).toEqual([
			expect.objectContaining({
				path: ['systemData', 'runtimeActions'],
				value: [expect.objectContaining({ id: 'action-1', name: 'Longsword +1' })]
			})
		]);

		const languagePatches = normalize5eGridPatches(character, [
			{
				path: [proficiencyLanguagesPathPrefix],
				value: [
					{ name: 'Elvish', source: 'race' },
					{ name: 'Dwarvish', source: 'background' }
				]
			}
		]);
		expect(languagePatches).toEqual([
			{ path: ['systemData', 'race', 'languages'], value: ['Elvish'] },
			{
				path: ['systemData', 'background', 'proficiencies', 'languages'],
				value: ['Dwarvish']
			}
		]);

		const featurePatches = normalize5eGridPatches(character, [
			{
				path: [classFeatureListPathPrefix],
				value: [{ name: 'Action Surge', classIndex: 0, featureId: 'action-surge' }]
			}
		]);
		expect(featurePatches).toEqual([
			{
				path: ['systemData', 'classes', 0, 'features'],
				value: [{ name: 'Action Surge', featureId: 'action-surge' }]
			}
		]);
	});

	it('preserves unrelated inventory records and injects deterministic IDs', () => {
		const character = createPatchCharacter();
		const ids = ['new-weapon', 'new-sp'];
		const createId = () => ids.shift() ?? 'unexpected-id';

		const inventoryPatches = normalize5eGridPatches(
			character,
			[
				{
					path: [inventoryListPathPrefix, 'weapons'],
					value: [{ name: 'Battleaxe', equipped: true }]
				}
			],
			{ createId }
		);
		const inventory = inventoryPatches[0]?.value as Array<{ id: string; name: string }>;
		expect(inventory).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'new-weapon', name: 'Battleaxe' }),
				expect.objectContaining({ id: 'gear-1', name: 'Rope' }),
				expect.objectContaining({ id: 'gp-1', name: 'GP' })
			])
		);

		const currencyPatches = normalize5eGridPatches(
			character,
			[
				{ path: [inventoryCurrencyPathPrefix, 'gp'], value: 9 },
				{ path: [inventoryCurrencyPathPrefix, 'sp'], value: 3 }
			],
			{ createId }
		);
		const currencyInventory = currencyPatches[0]?.value as Array<{
			id: string;
			quantity?: number;
			tags?: Array<string>;
		}>;
		expect(currencyInventory).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'gp-1', quantity: 9, tags: ['inventory:currency:gp'] }),
				expect.objectContaining({ id: 'new-sp', quantity: 3, tags: ['inventory:currency:sp'] })
			])
		);
	});

	it('coalesces roleplay and scratchpad edits while preserving identities', () => {
		const character = createPatchCharacter();
		const patches = normalize5eGridPatches(character, [
			{ path: [roleplayNotePathPrefix, 'motives'], value: 'New motive' },
			{
				path: [scratchpadNotesPathPrefix],
				value: [{ id: 'scratch-1', title: 'Scratch', body: 'New scratch', kind: 'quick' }]
			}
		]);

		expect(patches).toHaveLength(1);
		expect(patches[0]?.path).toEqual(['notes']);
		expect(patches[0]?.value).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'scratch-1', body: 'New scratch' }),
				expect.objectContaining({ id: 'motives-1', title: 'Motives', body: 'New motive' })
			])
		);
	});

	it('converts annotation arrays, drops no-ops, and preserves undefined deletion semantics', () => {
		const character = createPatchCharacter();
		const annotationPatches = normalize5eGridPatches(
			character,
			[
				{
					path: ['systemData', 'annotations', 'combat', 'hitPoints', 'current', '_annotations'],
					value: [{ origin: 'user', kind: 'note', text: 'Watch this value.' }]
				}
			],
			{ createId: () => 'annotation-1' }
		);
		expect(annotationPatches).toEqual([
			{
				path: ['systemData', 'annotations', 'combat', 'hitPoints', 'current', '_annotations'],
				value: {
					'annotation-1': {
						id: 'annotation-1',
						origin: 'user',
						kind: 'note',
						text: 'Watch this value.'
					}
				}
			}
		]);

		expect(
			normalize5eGridPatches(character, [
				{
					path: ['systemData', 'combat', 'armorClass'],
					value: character.systemData.combat.armorClass
				}
			])
		).toEqual([]);

		const removeAttacks = normalize5eGridPatches(character, [
			{ path: ['systemData', 'attacks'], value: undefined }
		]);
		expect(removeAttacks).toEqual([]);
		const legacyCharacter = {
			...character,
			systemData: {
				...character.systemData,
				attacks: [{ id: 'legacy', name: 'Legacy attack' }]
			}
		};
		expect(
			normalize5eGridPatches(legacyCharacter, [
				{ path: ['systemData', 'attacks'], value: undefined }
			])
		).toEqual([{ path: ['systemData', 'attacks'], value: undefined }]);
	});

	it('adds schema-backed defaults around virtual patches and applies the result', () => {
		const character = create5e2014Character({ name: 'Defaults', identity: { background: 'Sage' } });
		const normalized = normalize5eGridPatches(character, [
			{
				path: [proficiencyLanguagesPathPrefix],
				value: [{ name: 'Elvish', source: 'race' }]
			}
		]);

		expect(normalized).toEqual([
			{ path: ['systemData', 'race', 'name'], value: 'Ancestry' },
			{ path: ['systemData', 'race', 'languages'], value: ['Elvish'] }
		]);
		const next = applyGridPatches(character, normalized);
		expect(next.identity.name).toBe('Defaults');
		expect(next.systemData.combat).toEqual(character.systemData.combat);
	});
});
