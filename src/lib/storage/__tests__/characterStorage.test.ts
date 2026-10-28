import { beforeEach, describe, expect, it, vi } from 'vitest';
import { seedChars } from '$fixtures/characters.js';
import type { CharacterWithSystemData } from '../../../schema/index.js';
import { create5e2014Character } from '../../../schema/system.5e2014.js';
import { create5e2024Character } from '../../../schema/system-5e2024';
import { installMemoryLocalStorage } from '../../../test-utils/browser.js';
import { loadStoredCharacters, saveStoredCharacters } from '../characterStorage';

vi.mock('$app/env', () => ({
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
	it.each(['same edition', 'mixed editions'])(
		'rejects duplicate IDs without overwriting storage: %s',
		(variant) => {
			const first = create5e2014Character({ meta: { id: 'collision' } });
			const second = variant === 'same edition' ? structuredClone(first) : create5e2024Character();
			second.meta.id = first.meta.id;
			const original = JSON.stringify({ version: 1, characters: [first] });
			localStorage.setItem(CHARS_STORAGE_KEY, original);
			expect(saveStoredCharacters([first, second])).toBe(false);
			expect(localStorage.getItem(CHARS_STORAGE_KEY)).toBe(original);
			const duplicateBytes = JSON.stringify({ version: 1, characters: [first, second] });
			localStorage.setItem(CHARS_STORAGE_KEY, duplicateBytes);
			const result = loadStoredCharacters([]);
			expect(result.issue?.originalData).toBe(duplicateBytes);
			expect(result.characters).toEqual([]);
			expect(localStorage.getItem(CHARS_STORAGE_KEY)).toBe(duplicateBytes);
		}
	);

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
			meta: { schemaVersion: 'dnd5e-2014.schema.v0' },

			systemData: {
				features: [],
				inventory: [],
				notes: [],
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

	it('persists and reloads item-linked runtime actions', () => {
		const linkedCharacter = create5e2014Character({
			inventory: [{ category: 'weapons', id: 'item-1', name: 'Longsword', equipped: true }],
			systemData: {
				runtimeActions: [
					{
						id: 'action-1',
						name: 'Longsword',
						source: { kind: 'item', id: 'item-1' }
					}
				]
			}
		});

		saveStoredCharacters([linkedCharacter]);

		expect(loadStoredCharacters([])).toEqual({
			characters: [linkedCharacter],
			issue: null
		});
	});

	it('persists and reloads proficiency identities and priority membership', () => {
		const prioritizedCharacter = create5e2014Character({
			meta: { id: 'prioritized-character' },

			systemData: {
				features: [{ id: 'feature-alert', name: 'Alert' }],
				inventory: [{ category: 'other', id: 'item-rope', name: 'Rope' }],
				race: {
					name: 'Elf',
					traits: [{ featureId: 'trait-darkvision', name: 'Darkvision' }]
				},
				proficiencies: {
					languages: [{ id: 'language-common', name: 'Common' }],
					tools: [{ id: 'tool-navigator', name: "Navigator's tools" }]
				},
				spellcasting: {
					ability: 'int',
					spells: [{ spellId: 'spell-shield', name: 'Shield', level: 1 }]
				},
				collectionPins: {
					inventory: ['item-rope'],
					spells: ['spell-shield'],
					features: ['feature-alert'],
					traits: ['trait-darkvision'],
					languages: ['language-common'],
					tools: ['tool-navigator']
				}
			}
		});

		saveStoredCharacters([prioritizedCharacter]);

		expect(loadStoredCharacters([])).toEqual({
			characters: [prioritizedCharacter],
			issue: null
		});
	});

	it('preserves rejected current-v0 proficiency data that lacks required identities', () => {
		const fallback = cloneCharacters(seedChars);
		const current = create5e2014Character({ meta: { id: 'old-v0-character' } });
		const invalidCurrent = {
			...current,
			systemData: {
				...current.systemData,
				proficiencies: { languages: [{ name: 'Common' }], tools: [] }
			}
		};
		const stored = JSON.stringify({ version: 1, characters: [invalidCurrent] });
		localStorage.setItem(CHARS_STORAGE_KEY, stored);

		expect(loadStoredCharacters(fallback)).toEqual({
			characters: fallback,
			issue: { kind: 'invalid_or_outdated', originalData: stored }
		});
		expect(localStorage.getItem(CHARS_STORAGE_KEY)).toBe(stored);
	});

	it('preserves outdated source data while falling back with a recovery issue', () => {
		const fallback = cloneCharacters(seedChars);
		const firstCharacter = fallback[0];
		const outdatedCharacter = {
			...firstCharacter,
			meta: { ...firstCharacter.meta, schemaVersion: 'dnd5e-2014.v3' }
		};
		const stored = JSON.stringify([outdatedCharacter]);
		localStorage.setItem(CHARS_STORAGE_KEY, stored);

		expect(loadStoredCharacters(fallback)).toEqual({
			characters: fallback,
			issue: { kind: 'invalid_or_outdated', originalData: stored }
		});
		expect(localStorage.getItem(CHARS_STORAGE_KEY)).toBe(stored);
	});

	it('falls back with an issue for invalid JSON', () => {
		const fallback = cloneCharacters(seedChars);
		localStorage.setItem(CHARS_STORAGE_KEY, '{not json');

		expect(loadStoredCharacters(fallback)).toEqual({
			characters: fallback,
			issue: { kind: 'invalid_or_outdated', originalData: '{not json' }
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
			issue: { kind: 'invalid_or_outdated', originalData: localStorage.getItem(CHARS_STORAGE_KEY) }
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
			issue: { kind: 'invalid_or_outdated', originalData: localStorage.getItem(CHARS_STORAGE_KEY) }
		});
	});

	it('treats an empty stored string as rejected data rather than empty storage', () => {
		localStorage.setItem(CHARS_STORAGE_KEY, '');
		expect(loadStoredCharacters([]).issue).toEqual({
			kind: 'invalid_or_outdated',
			originalData: ''
		});
	});

	it('reports failed writes without deleting the original', () => {
		localStorage.setItem(CHARS_STORAGE_KEY, 'original');
		const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
			throw new Error('quota');
		});
		expect(saveStoredCharacters(cloneCharacters(seedChars))).toBe(false);
		expect(localStorage.getItem(CHARS_STORAGE_KEY)).toBe('original');
		setItem.mockRestore();
	});

	it('keeps storage read failures in recovery without inventing original bytes', () => {
		const getItem = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
			throw new Error('unavailable');
		});
		expect(loadStoredCharacters([]).issue).toEqual({
			kind: 'invalid_or_outdated',
			originalData: null
		});
		getItem.mockRestore();
	});
});
