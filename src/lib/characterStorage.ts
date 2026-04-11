import { browser } from '$app/environment';
import type { CharacterWithSystemData } from '../schema';

const CHARS_STORAGE_KEY = 'ez-chars.characters.v1';

export const loadStoredCharacters = (
	fallback: CharacterWithSystemData[]
): CharacterWithSystemData[] => {
	if (!browser) return fallback;

	try {
		const raw = localStorage.getItem(CHARS_STORAGE_KEY);
		if (!raw) return fallback;

		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return fallback;

		return parsed as CharacterWithSystemData[];
	} catch {
		return fallback;
	}
};

export const saveStoredCharacters = (characters: CharacterWithSystemData[]): void => {
	if (!browser) return;

	try {
		localStorage.setItem(CHARS_STORAGE_KEY, JSON.stringify(characters));
	} catch {
		// Intentionally ignore storage write failures.
	}
};
