import { describe, expect, it } from 'vitest';
import {
	create5e2024Character,
	safeParse5e2024CharacterDocument,
	serialize5e2024CharacterDocument
} from '../system-5e2024';
import { scalarPaths2024 } from '../fields-5e2024';

const make = () =>
	create5e2024Character(
		{
			name: 'All authored regions',
			systemData: {
				identity: {
					species: 'Human',
					background: 'Sage',
					alignment: 'Neutral',
					appearance: 'Blue cloak'
				},
				classes: [{ id: 'wizard', name: 'Wizard', level: 3, subclass: 'Evoker' }],
				combat: {
					hitPoints: { current: 12, max: 20, temp: 0 },
					armorClass: 12,
					initiative: 2,
					hitDice: '3d6',
					conditions: 'Prone',
					heroicInspiration: true,
					size: 'Medium',
					passivePerception: 13,
					deathSaves: { successes: 0, failures: 1 },
					movement: { walk: 30, fly: 60 }
				},
				abilities: { int: { score: 16 }, wis: { score: 12, modifier: 2 } },
				proficiencyBonus: 2,
				saves: { int: { proficient: true } },
				skills: { arcana: { proficient: true, expertise: true, bonus: 7 } },
				training: { armor: 'Light', weapons: 'Simple' },
				languages: [{ id: 'common', name: 'Common' }],
				tools: [{ id: 'kit', name: 'Kit' }],
				features: [
					{ id: 'recovery', name: 'Recovery', context: 'Wizard', detail: 'Remember rest' }
				],
				traits: [{ id: 'vision', name: 'Vision' }],
				feats: [{ id: 'alert', name: 'Alert', context: 'Origin' }],
				masteries: [{ id: 'push', name: 'Push' }],
				inventory: [
					{ id: 'staff', name: 'Staff', category: 'weapons', quantity: 1, equipped: true }
				],
				currency: { gp: 12 },
				spells: [{ id: 'light', name: 'Light', level: 0, prepared: true }],
				spellcasting: {
					ability: 'int',
					saveDC: 13,
					attackBonus: 5,
					slots: { '1': { used: 1, max: 3 } }
				},
				roleplay: {
					personality: 'Curious',
					ideals: 'Learning',
					bonds: 'Library',
					flaws: 'Distracted',
					backstory: 'An archivist'
				},
				runtimeActions: [
					{ id: 'cast', name: 'Cast Light', source: { kind: 'spell', id: 'light' } },
					{ id: 'recover', name: 'Recover', source: { kind: 'feature', id: 'recovery' } }
				],
				collectionPins: { spells: ['light'], features: ['recovery'] },
				fieldNotes: {
					'/spells/light/detail': [
						{ id: 'reminder', origin: 'user', kind: 'note', text: 'Handy in tunnels' }
					]
				}
			}
		},
		{ createId: () => 'full-2024', nowIso: () => '2026-10-24T00:00:00.000Z' }
	);

describe('hardened authored 2024 schema', () => {
	it('round trips every delivered region without manufacturing unknown facts', () => {
		const original = make();
		const parsed = safeParse5e2024CharacterDocument(
			JSON.parse(JSON.stringify(serialize5e2024CharacterDocument(original)))
		);
		expect(parsed).toEqual({ success: true, data: original });
		expect(original.systemData.abilities?.str).toBeUndefined();
		expect(original.systemData.spellcasting?.slots?.['2']).toBeUndefined();
	});
	it.each([
		{ classes: [{ id: 'a', name: 'Wizard', level: 0 }] },
		{ classes: [{ id: 'a', name: 'Wizard', level: 21 }] },
		{ abilities: { str: { score: 31 } } },
		{ abilities: { luck: { score: 10 } } },
		{ skills: { arcana: { bonus: 1.5 } } },
		{ combat: { deathSaves: { failures: 4 } } },
		{ combat: { movement: { walk: -1 } } },
		{ currency: { gp: -1 } },
		{ spells: [{ id: 'a', name: 'Spell', level: 10 }] },
		{ spellcasting: { ability: 'luck' } },
		{ spellcasting: { slots: { '0': { used: 0, max: 1 } } } },
		{
			languages: [
				{ id: 'same', name: 'A' },
				{ id: 'same', name: 'B' }
			]
		},
		{ feats: [{ id: 'recovery', name: 'Duplicate feature source' }] },
		{ collectionPins: { spells: ['missing'] } },
		{ collectionPins: { features: ['recovery', 'recovery'] } },
		{ runtimeActions: [{ id: 'a', name: 'Bad', source: { kind: 'spell', id: 'staff' } }] },
		{ fieldNotes: { '/spells/missing/name': [] } },
		{ fieldNotes: { '/systemData/identity/invented': [] } },
		{ fieldNotes: { '/spells/light/invented': [] } },
		{ fieldNotes: { '/systemData/__proto__/x': [] } },
		{
			fieldNotes: {
				'/systemData/identity/name': [
					{ id: 'same', kind: 'note', origin: 'user' },
					{ id: 'same', kind: 'note', origin: 'user' }
				]
			}
		}
	])('rejects invalid representation/identity without changing input: %j', (patch) => {
		const original = make();
		const input = { ...original, systemData: { ...original.systemData, ...patch } };
		const before = structuredClone(input);
		expect(safeParse5e2024CharacterDocument(input).success).toBe(false);
		expect(input).toEqual(before);
	});
	it('permits annotations on known but absent fields and independent used/max values', () => {
		const original = make();
		original.systemData.fieldNotes = Object.fromEntries(
			scalarPaths2024.map((path) => [
				'/' + path.join('/'),
				[{ kind: 'note' as const, origin: 'user' as const, text: 'Unknown yet' }]
			])
		);
		original.systemData.spellcasting!.slots = { '1': { used: 4, max: 2 } };
		expect(safeParse5e2024CharacterDocument(original).success).toBe(true);
	});
});
