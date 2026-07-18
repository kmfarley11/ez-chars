import { describe, expect, it } from 'vitest';
import { getValueAtGridPath } from '$lib/gridContentHelpers';
import { reduce5eSheetEditIntents, type SheetEditIntent } from '../sheetEditIntents';
import { createSheetEditCharacter } from './sheetEditFixtures';

const deterministicIds = (...ids: Array<string>) => {
	const pending = [...ids];
	return () => pending.shift() ?? 'unexpected-id';
};

describe('5e sheet edit intent reducer', () => {
	it('reduces spells, actions, languages, and class features while preserving identities', () => {
		const character = createSheetEditCharacter();
		const original = structuredClone(character);
		const intents: Array<SheetEditIntent> = [
			{
				type: 'replace-spell-level',
				level: 1,
				spells: [
					{ spellId: 'shield', name: 'Shield+', prepared: true },
					{ name: 'Magic Missile', prepared: true }
				]
			},
			{
				type: 'replace-runtime-actions',
				actions: [
					{ id: 'action-1', name: 'Longsword +1', timing: 'action' },
					{ name: 'Second Wind', timing: 'bonusAction', category: 'effect' }
				]
			},
			{
				type: 'replace-proficiency-languages',
				languages: [
					{ name: 'Elvish', source: 'ancestry' },
					{ name: 'Dwarvish', source: 'background' }
				]
			},
			{
				type: 'replace-proficiency-tools',
				tools: [
					{ name: 'Calligrapher supplies', source: 'background' },
					{ name: "Thieves' tools", source: 'class' }
				]
			},
			{
				type: 'replace-class-features',
				features: [
					{ featureId: 'second-wind', name: 'Second Wind+', classIndex: 0 },
					{ name: 'Action Surge', classIndex: 0 }
				]
			}
		];

		const result = reduce5eSheetEditIntents(character, intents, {
			createId: deterministicIds('magic-missile', 'second-wind-action', 'action-surge')
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(character).toEqual(original);
		expect(result.character.systemData.spellcasting?.spells).toEqual([
			{ spellId: 'fire-bolt', name: 'Fire Bolt', level: 0 },
			{ spellId: 'shield', name: 'Shield+', level: 1, prepared: true },
			{ spellId: 'magic-missile', name: 'Magic Missile', level: 1, prepared: true }
		]);
		expect(result.character.systemData.runtimeActions).toEqual([
			expect.objectContaining({
				id: 'action-1',
				name: 'Longsword +1',
				annotations: [expect.objectContaining({ id: 'action-note' })]
			}),
			expect.objectContaining({ id: 'second-wind-action', name: 'Second Wind' })
		]);
		expect(result.character.systemData.proficiencies.languages).toEqual([
			{ name: 'Elvish', source: { kind: 'ancestry' } },
			{ name: 'Dwarvish', source: { kind: 'background' } }
		]);
		expect(result.character.systemData.proficiencies.tools).toEqual([
			{
				name: 'Calligrapher supplies',
				source: { kind: 'background', sourceId: 'sage' },
				annotations: [expect.objectContaining({ id: 'tool-note' })]
			},
			{ name: "Thieves' tools", source: { kind: 'class' } }
		]);
		expect(result.character.systemData.classes[0]?.features).toEqual([
			expect.objectContaining({
				featureId: 'second-wind',
				name: 'Second Wind+',
				annotations: [expect.objectContaining({ id: 'feature-note' })]
			}),
			{ featureId: 'action-surge', name: 'Action Surge' }
		]);
	});

	it('replaces one inventory group and updates currency without disturbing other records', () => {
		const character = createSheetEditCharacter();
		const result = reduce5eSheetEditIntents(
			character,
			[
				{
					type: 'replace-inventory-group',
					group: 'weapons',
					items: [
						{ id: 'weapon-1', name: 'Longsword +1', equipped: true },
						{ name: 'Battleaxe', equipped: true }
					]
				},
				{ type: 'update-currency', amounts: { gp: 9, sp: 3 } }
			],
			{ createId: deterministicIds('new-weapon') }
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.inventory).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: 'weapon-1',
					name: 'Longsword +1',
					annotations: [expect.objectContaining({ id: 'weapon-note' })]
				}),
				expect.objectContaining({ id: 'new-weapon', name: 'Battleaxe' }),
				expect.objectContaining({ id: 'gear-1', name: 'Rope' })
			])
		);
		expect(result.character.systemData.currency).toEqual({
			gp: { amount: 9 },
			sp: { amount: 3 }
		});
	});

	it('coalesces roleplay and scratchpad edits and replaces annotations with stable IDs', () => {
		const character = createSheetEditCharacter();
		const annotationPath = [
			'systemData',
			'annotations',
			'combat',
			'hitPoints',
			'current',
			'_annotations'
		];
		const result = reduce5eSheetEditIntents(
			character,
			[
				{
					type: 'replace-organizational-notes',
					roleplayBodies: { motives: 'New motive' },
					scratchpad: [
						{ id: 'scratch-1', title: 'Scratch', body: 'New scratch', kind: 'quick' },
						{ title: 'Session', body: 'Met a dragon', kind: 'session' }
					]
				},
				{
					type: 'replace-annotations',
					targetPath: annotationPath,
					annotations: [
						{ id: 'annotation-1', origin: 'user', kind: 'note', text: 'Existing ID' },
						{ origin: 'user', kind: 'note', text: 'New ID' }
					]
				}
			],
			{ createId: deterministicIds('new-note', 'annotation-2') }
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.notes).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'scratch-1', body: 'New scratch' }),
				expect.objectContaining({ id: 'new-note', body: 'Met a dragon' })
			])
		);
		expect(result.character.systemData.roleplay.motives).toEqual({
			body: 'New motive',
			annotations: [expect.objectContaining({ id: 'motive-note' })]
		});
		expect(getValueAtGridPath(result.character, annotationPath)).toEqual({
			'annotation-1': expect.objectContaining({ id: 'annotation-1', text: 'Existing ID' }),
			'annotation-2': expect.objectContaining({ id: 'annotation-2', text: 'New ID' })
		});
	});

	it('preserves explicit default and deletion behavior', () => {
		const character = createSheetEditCharacter();
		const result = reduce5eSheetEditIntents(character, [
			{ type: 'replace-runtime-actions', actions: [] },
			{ type: 'update-currency', amounts: { gp: 0 } },
			{
				type: 'replace-organizational-notes',
				roleplayBodies: { motives: '' },
				scratchpad: []
			}
		]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.systemData.runtimeActions).toEqual([]);
		expect(result.character.inventory).toEqual([
			expect.objectContaining({ id: 'weapon-1' }),
			expect.objectContaining({ id: 'gear-1' })
		]);
		expect(result.character.systemData.currency).toEqual({});
		expect(result.character.systemData.roleplay).toEqual({});
		expect(result.character.notes).toEqual([]);
	});

	it('updates proficiency provenance without creating ancestry source records', () => {
		const character = createSheetEditCharacter();
		delete character.systemData.race;
		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'replace-proficiency-languages',
				languages: [{ name: 'Elvish', source: 'ancestry' }]
			}
		]);

		expect(result).toMatchObject({
			ok: true,
			character: {
				systemData: {
					proficiencies: {
						languages: [{ name: 'Elvish', source: { kind: 'ancestry' } }]
					}
				}
			}
		});
		if (result.ok) expect(result.character.systemData.race).toBeUndefined();
	});

	it('fails atomically for an invalid semantic target without mutating the input', () => {
		const character = createSheetEditCharacter();
		const original = structuredClone(character);
		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'replace-runtime-actions',
				actions: [{ id: 'action-1', name: 'Changed first' }]
			},
			{
				type: 'replace-class-features',
				features: [{ name: 'Impossible', classIndex: 3 }]
			}
		]);

		expect(result).toMatchObject({
			ok: false,
			issues: [{ code: 'invalid-intent-target' }]
		});
		expect(character).toEqual(original);
		expect(result).not.toHaveProperty('character');
	});

	it('validates the final candidate and returns explicit schema issues', () => {
		const character = createSheetEditCharacter();
		const invalidCharacter = {
			...character,
			identity: { ...character.identity, name: '' }
		};
		const result = reduce5eSheetEditIntents(invalidCharacter, []);

		expect(result).toMatchObject({
			ok: false,
			issues: [{ code: 'invalid-character' }]
		});
	});
});
