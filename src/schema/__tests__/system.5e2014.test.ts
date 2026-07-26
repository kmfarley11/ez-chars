import { describe, expect, it } from 'vitest';
import { seedChars } from '../../fixtures/characters';
import {
	create5e2014Character,
	parse5e2014CharacterDocument,
	runtimeActionSchema,
	safeParse5e2014CharacterDocument,
	SYSTEM_ID_5E2014
} from '../system.5e2014';

describe('5e 2014 character schema', () => {
	it('creates a valid default 5e character document', () => {
		const character = create5e2014Character();

		expect(character.system.id).toBe(SYSTEM_ID_5E2014);
		expect(character.features).toEqual([]);
		expect(character.inventory).toEqual([]);
		expect(character.notes).toEqual([]);
		expect(character.systemData.runtimeActions).toEqual([]);
		expect(character.systemData.currency).toEqual({});
		expect(character.systemData.roleplay).toEqual({});
		expect(character.systemData.proficiencies).toEqual({ languages: [], tools: [] });
		expect(character.systemData.spellcasting).toBeUndefined();
		expect(character.identity.name).toBe('Ole No Name');
		expect(character.systemData.combat.armorClass).toBe(10);
		expect(character.systemData.combat.hitPoints.current).toBe(5);
		expect(safeParse5e2014CharacterDocument(character).success).toBe(true);
	});

	it('preserves typed constructor overrides through parsing', () => {
		const character = create5e2014Character({
			name: 'Test Adventurer',
			hp: 12,
			ac: 16,
			meta: {
				id: 'test-character'
			},
			systemData: {
				level: 3,
				combat: {
					speed: 30
				}
			}
		});

		const parsed = parse5e2014CharacterDocument(character);

		expect(parsed.meta.id).toBe('test-character');
		expect(parsed.identity.name).toBe('Test Adventurer');
		expect(parsed.systemData.level).toBe(3);
		expect(parsed.systemData.combat.armorClass).toBe(16);
		expect(parsed.systemData.combat.hitPoints.max).toBe(12);
		expect(parsed.systemData.combat.speed).toBe(30);
	});

	it('validates the seeded 5e character documents', () => {
		const seeded5eCharacters = seedChars.filter(
			(character) => character.system.id === SYSTEM_ID_5E2014
		);

		expect(seeded5eCharacters.length).toBeGreaterThan(0);
		for (const character of seeded5eCharacters) {
			expect(safeParse5e2014CharacterDocument(character).success).toBe(true);
		}
	});

	it('keeps linked and fully custom runtime actions in representative seed characters', () => {
		const representativeCharacters = seedChars
			.filter((character) => ['char-001', 'char-002'].includes(character.meta.id))
			.map((character) => parse5e2014CharacterDocument(character));

		expect(representativeCharacters).toHaveLength(2);
		for (const character of representativeCharacters) {
			const linkedActions = character.systemData.runtimeActions.filter(
				(action) => action.source?.kind === 'item'
			);
			const customActions = character.systemData.runtimeActions.filter((action) => !action.source);
			const linkedSourceId = linkedActions[0]?.source?.id;

			expect(linkedActions).toHaveLength(1);
			expect(customActions).toHaveLength(1);
			expect(linkedSourceId).toBeDefined();
			expect(character.inventory.some((item) => item.id === linkedSourceId)).toBe(true);
		}
	});

	it('rejects malformed 5e character documents', () => {
		const malformedCharacter = {
			...create5e2014Character(),
			systemData: {
				level: 1
			}
		};

		expect(safeParse5e2014CharacterDocument(malformedCharacter).success).toBe(false);
		expect(() => parse5e2014CharacterDocument(malformedCharacter)).toThrow();
	});

	it('accepts strict local source shapes while preserving unlinked runtime actions', () => {
		for (const source of [
			{ kind: 'item', id: 'item-1' },
			{ kind: 'spell', id: 'spell-1' },
			{ kind: 'feature', id: 'feature-1' }
		]) {
			expect(
				runtimeActionSchema.safeParse({ id: 'linked-action', name: 'Action', source }).success
			).toBe(true);
		}
		expect(runtimeActionSchema.safeParse({ id: 'custom-action', name: 'Improvise' }).success).toBe(
			true
		);
	});

	it('rejects malformed and unsupported runtime-action source links', () => {
		for (const source of [
			{ kind: 'trait', id: 'trait-1' },
			{ kind: 'item' },
			{ kind: 'item', id: '' },
			{ kind: 'item', id: 'item-1', provider: 'external' }
		]) {
			expect(
				runtimeActionSchema.safeParse({ id: 'linked-action', name: 'Longsword', source }).success
			).toBe(false);
		}
	});

	it('requires stable spell and nested feature identities', () => {
		const character = create5e2014Character({
			systemData: {
				race: {
					name: 'Elf',
					traits: [{ featureId: 'trait-1', name: 'Darkvision' }]
				},
				classes: [
					{
						name: 'Wizard',
						level: 1,
						features: [{ featureId: 'feature-1', name: 'Arcane Recovery' }]
					}
				],
				spellcasting: {
					ability: 'int',
					spells: [{ spellId: 'spell-1', name: 'Shield' }]
				}
			}
		});

		for (const invalid of [
			{
				...structuredClone(character),
				systemData: {
					...character.systemData,
					spellcasting: {
						...character.systemData.spellcasting,
						spells: [{ name: 'Shield' }]
					}
				}
			},
			{
				...structuredClone(character),
				systemData: {
					...character.systemData,
					race: { name: 'Elf', traits: [{ name: 'Darkvision' }] }
				}
			}
		]) {
			expect(safeParse5e2014CharacterDocument(invalid).success).toBe(false);
		}
	});

	it('rejects duplicate inventory, spell, and character-wide feature identities', () => {
		const valid = create5e2014Character({
			features: [{ id: 'general-1', name: 'General' }],
			inventory: [
				{ id: 'item-1', name: 'Longsword' },
				{ id: 'item-2', name: 'Shield' }
			],
			systemData: {
				race: {
					name: 'Elf',
					traits: [{ featureId: 'trait-1', name: 'Darkvision' }]
				},
				background: {
					name: 'Sage',
					features: [{ featureId: 'background-1', name: 'Researcher' }]
				},
				classes: [
					{
						name: 'Wizard',
						level: 1,
						features: [{ featureId: 'class-1', name: 'Arcane Recovery' }]
					}
				],
				spellcasting: {
					ability: 'int',
					spells: [
						{ spellId: 'spell-1', name: 'Shield' },
						{ spellId: 'spell-2', name: 'Magic Missile' }
					]
				}
			}
		});
		const duplicateItem = structuredClone(valid);
		duplicateItem.inventory[1].id = 'item-1';
		const duplicateSpell = structuredClone(valid);
		duplicateSpell.systemData.spellcasting!.spells![1].spellId = 'spell-1';
		const duplicateFeature = structuredClone(valid);
		duplicateFeature.systemData.background!.features![0].featureId = 'general-1';

		expect(safeParse5e2014CharacterDocument(duplicateItem).success).toBe(false);
		expect(safeParse5e2014CharacterDocument(duplicateSpell).success).toBe(false);
		expect(safeParse5e2014CharacterDocument(duplicateFeature).success).toBe(false);
	});

	it('accepts exactly resolved eligible links and rejects missing, ambiguous, or background links', () => {
		const character = create5e2014Character({
			features: [{ id: 'general-1', name: 'General' }],
			inventory: [{ id: 'item-1', name: 'Longsword' }],
			systemData: {
				race: {
					name: 'Elf',
					traits: [{ featureId: 'trait-1', name: 'Darkvision' }]
				},
				background: {
					name: 'Sage',
					features: [{ featureId: 'background-1', name: 'Researcher' }]
				},
				classes: [
					{
						name: 'Wizard',
						level: 1,
						features: [{ featureId: 'class-1', name: 'Arcane Recovery' }]
					}
				],
				spellcasting: {
					ability: 'int',
					spells: [{ spellId: 'spell-1', name: 'Shield' }]
				},
				runtimeActions: [
					{ id: 'item-action', name: 'Longsword', source: { kind: 'item', id: 'item-1' } },
					{ id: 'spell-action', name: 'Shield', source: { kind: 'spell', id: 'spell-1' } },
					{
						id: 'feature-action',
						name: 'Arcane Recovery',
						source: { kind: 'feature', id: 'class-1' }
					},
					{
						id: 'trait-action',
						name: 'Darkvision',
						source: { kind: 'feature', id: 'trait-1' }
					}
				]
			}
		});
		expect(safeParse5e2014CharacterDocument(character).success).toBe(true);

		for (const source of [
			{ kind: 'item' as const, id: 'missing' },
			{ kind: 'spell' as const, id: 'missing' },
			{ kind: 'feature' as const, id: 'background-1' }
		]) {
			const invalid = structuredClone(character);
			invalid.systemData.runtimeActions[0].source = source;
			expect(safeParse5e2014CharacterDocument(invalid).success).toBe(false);
		}

		const ambiguous = structuredClone(character);
		ambiguous.inventory.push({ id: 'item-1', name: 'Duplicate Longsword' });
		expect(safeParse5e2014CharacterDocument(ambiguous).success).toBe(false);
	});
});
