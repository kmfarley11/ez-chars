import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installMemoryLocalStorage } from '../test-utils/browser';

vi.mock('$app/environment', () => ({
	browser: true
}));

describe('local-first character workflow smoke', () => {
	beforeEach(() => {
		vi.resetModules();
		installMemoryLocalStorage();
	});

	it('creates, edits, persists, and reloads a 5e character', async () => {
		const data = await import('$storage/store.js');
		const createdCharacter = data.createNew5eCharacter();
		const editedName = 'Smoke Test Adventurer';

		data.charsArray.update((characters) =>
			characters.map((character) =>
				character.meta.id === createdCharacter.meta.id
					? {
							...character,
							identity: {
								...character.identity,
								name: editedName
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

		expect(reloadedCharacter?.identity.name).toBe(editedName);
	});
});
