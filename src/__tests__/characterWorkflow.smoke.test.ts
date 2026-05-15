import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true
}));

vi.hoisted(() => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			location: {
				origin: 'http://localhost'
			}
		}
	});
});

class MemoryStorage implements Storage {
	private items = new Map<string, string>();

	get length() {
		return this.items.size;
	}

	clear() {
		this.items.clear();
	}

	getItem(key: string) {
		return this.items.get(key) ?? null;
	}

	key(index: number) {
		return Array.from(this.items.keys())[index] ?? null;
	}

	removeItem(key: string) {
		this.items.delete(key);
	}

	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
}

describe('local-first character workflow smoke', () => {
	beforeEach(() => {
		vi.resetModules();
		Object.defineProperty(globalThis, 'localStorage', {
			configurable: true,
			value: new MemoryStorage()
		});
	});

	it('creates, edits, persists, and reloads a 5e character', async () => {
		const data = await import('../data');
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
		const reloadedData = await import('../data');
		const reloadedCharacter = get(reloadedData.charsArray).find(
			(character) => character.meta.id === createdCharacter.meta.id
		);

		expect(reloadedCharacter?.identity.name).toBe(editedName);
	});
});
