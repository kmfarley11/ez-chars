import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installMemoryLocalStorage } from '../test-utils/browser';
import { is5e2014Character } from '../schema/storedCharacters';

vi.mock('$app/env', () => ({
	browser: true
}));

describe('local-first character workflow smoke', () => {
	beforeEach(() => {
		vi.resetModules();
		installMemoryLocalStorage();
	});

	it('creates, edits, persists, and reloads a 5e character', async () => {
		const data = await import('$storage/store.js');
		const createdCharacter = data.createNewCharacter('dnd5e-2014');
		const editedName = 'Smoke Test Adventurer';

		data.charsArray.update((characters) =>
			characters.map((character) =>
				character.meta.id === createdCharacter.meta.id && is5e2014Character(character)
					? {
							...character,
							systemData: {
								...character.systemData,
								identity: {
									...character.systemData.identity,
									name: editedName
								}
							}
						}
					: character
			)
		);

		vi.resetModules();
		const reloadedData = await import('$storage/store.js');
		const reloadedCharacter = get(reloadedData.charsArray).find(
			(character) => character.meta.id === createdCharacter.meta.id
		);

		expect(reloadedCharacter?.systemData.identity.name).toBe(editedName);
	});
});
