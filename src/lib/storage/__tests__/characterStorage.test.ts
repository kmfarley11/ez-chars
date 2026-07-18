import { beforeEach, describe, expect, it, vi } from 'vitest';
import { seedChars } from '$fixtures/characters.js';
import type { CharacterWithSystemData } from '../../../schema/index.js';
import { parse5e2014CharacterDocument } from '../../../schema/system.5e2014.js';
import { installMemoryLocalStorage } from '../../../test-utils/browser.js';
import {
	clearStoredCharacters,
	loadStoredCharacters,
	saveStoredCharacters
} from '../characterStorage';

vi.mock('$app/environment', () => ({
	browser: true
}));

const CHARS_STORAGE_KEY = 'ez-chars.characters.v1';

const cloneCharacters = (characters: CharacterWithSystemData[]) =>
	JSON.parse(JSON.stringify(characters)) as CharacterWithSystemData[];

describe('character storage adapter', () => {
	beforeEach(() => {
		installMemoryLocalStorage();
	});

	it('returns fallback characters without an issue when storage is empty', () => {
		const fallback = cloneCharacters(seedChars);

		expect(loadStoredCharacters(fallback)).toEqual({
			characters: fallback,
			issue: null
		});
	});

	it('saves and loads a versioned character storage envelope', () => {
		const characters = cloneCharacters(seedChars);

		saveStoredCharacters(characters);
		const raw = localStorage.getItem(CHARS_STORAGE_KEY);

		expect(raw).toEqual(expect.any(String));
		expect(JSON.parse(raw ?? '{}')).toMatchObject({
			version: 1,
			characters
		});
		expect(JSON.parse(raw ?? '{}').characters[0]).toMatchObject({
			meta: { schemaVersion: 'dnd5e-2014.v2' },
			features: [],
			inventory: [],
			notes: [],
			systemData: {
				runtimeActions: [],
				currency: {},
				roleplay: {},
				proficiencies: { languages: [], tools: [] }
			}
		});
		expect(loadStoredCharacters([])).toEqual({
			characters,
			issue: null
		});
	});

	it('loads legacy raw character arrays as current storage data', () => {
		const characters = cloneCharacters(seedChars);
		localStorage.setItem(CHARS_STORAGE_KEY, JSON.stringify(characters));

		expect(loadStoredCharacters([])).toEqual({
			characters,
			issue: null
		});
	});

	it('repairs legacy string movement fields before validation', () => {
		const firstCharacter = parse5e2014CharacterDocument(cloneCharacters(seedChars)[0]);
		const legacyCharacter = {
			...firstCharacter,
			meta: { ...firstCharacter.meta, schemaVersion: 'char.v1' },
			systemData: {
				...firstCharacter.systemData,
				combat: {
					...firstCharacter.systemData.combat,
					speed: ' 35 ',
					speedClimb: '',
					speedSwim: '20',
					speedFly: '0'
				}
			}
		};
		localStorage.setItem(CHARS_STORAGE_KEY, JSON.stringify([legacyCharacter]));

		const result = loadStoredCharacters([]);

		expect(result.issue).toBeNull();
		const repairedCharacter = parse5e2014CharacterDocument(result.characters[0]);
		expect(repairedCharacter.systemData.combat.speed).toBe(35);
		expect(repairedCharacter.systemData.combat.speedClimb).toBeUndefined();
		expect(repairedCharacter.systemData.combat.speedSwim).toBe(20);
		expect(repairedCharacter.systemData.combat.speedFly).toBe(0);
	});

	it('falls back with an issue for invalid JSON', () => {
		const fallback = cloneCharacters(seedChars);
		localStorage.setItem(CHARS_STORAGE_KEY, '{not json');

		expect(loadStoredCharacters(fallback)).toEqual({
			characters: fallback,
			issue: { kind: 'invalid_or_outdated' }
		});
	});

	it('falls back with an issue for unsupported storage envelope versions', () => {
		const fallback = cloneCharacters(seedChars);
		localStorage.setItem(
			CHARS_STORAGE_KEY,
			JSON.stringify({
				version: 2,
				characters: cloneCharacters(seedChars)
			})
		);

		expect(loadStoredCharacters(fallback)).toEqual({
			characters: fallback,
			issue: { kind: 'invalid_or_outdated' }
		});
	});

	it('falls back with an issue when stored characters fail schema validation', () => {
		const fallback = cloneCharacters(seedChars);
		localStorage.setItem(
			CHARS_STORAGE_KEY,
			JSON.stringify({
				version: 1,
				characters: [
					{
						...cloneCharacters(seedChars)[0],
						systemData: {
							level: 1
						}
					}
				]
			})
		);

		expect(loadStoredCharacters(fallback)).toEqual({
			characters: fallback,
			issue: { kind: 'invalid_or_outdated' }
		});
	});

	it('clears stored characters without altering the fallback load path', () => {
		const characters = cloneCharacters(seedChars);
		saveStoredCharacters(characters);

		clearStoredCharacters();

		expect(localStorage.getItem(CHARS_STORAGE_KEY)).toBeNull();
		expect(loadStoredCharacters(characters)).toEqual({
			characters,
			issue: null
		});
	});
});
