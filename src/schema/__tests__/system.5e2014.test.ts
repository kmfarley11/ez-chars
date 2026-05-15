import { describe, expect, it } from 'vitest';
import { seedChars } from '../../fixtures/characters';
import {
	create5e2014Character,
	parse5e2014CharacterDocument,
	safeParse5e2014CharacterDocument,
	SYSTEM_ID_5E2014_val
} from '../system.5e2014';

describe('5e 2014 character schema', () => {
	it('creates a valid default 5e character document', () => {
		const character = create5e2014Character();

		expect(character.system.id).toBe(SYSTEM_ID_5E2014_val);
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
			(character) => character.system.id === SYSTEM_ID_5E2014_val
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
});
