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

	it('accepts strict item links while preserving unlinked runtime actions', () => {
		expect(
			runtimeActionSchema.safeParse({
				id: 'linked-action',
				name: 'Longsword',
				source: { kind: 'item', id: 'item-1' }
			}).success
		).toBe(true);
		expect(runtimeActionSchema.safeParse({ id: 'custom-action', name: 'Improvise' }).success).toBe(
			true
		);
	});

	it('rejects malformed and unsupported runtime-action source links', () => {
		for (const source of [
			{ kind: 'spell', id: 'spell-1' },
			{ kind: 'item' },
			{ kind: 'item', id: '' },
			{ kind: 'item', id: 'item-1', provider: 'external' }
		]) {
			expect(
				runtimeActionSchema.safeParse({ id: 'linked-action', name: 'Longsword', source }).success
			).toBe(false);
		}
	});
});
