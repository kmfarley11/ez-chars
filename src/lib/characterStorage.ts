import { browser } from '$app/environment';
import { safeParseStoredCharacterDocuments, type CharacterWithSystemData } from '../schema';

const CHARS_STORAGE_KEY = 'ez-chars.characters.v1';

export type StoredCharactersLoadIssue = {
	kind: 'invalid_or_outdated';
};

export type LoadStoredCharactersResult = {
	characters: CharacterWithSystemData[];
	issue: StoredCharactersLoadIssue | null;
};

export const loadStoredCharacters = (
	fallback: CharacterWithSystemData[]
): LoadStoredCharactersResult => {
	if (!browser) return { characters: fallback, issue: null };

	try {
		const raw = localStorage.getItem(CHARS_STORAGE_KEY);
		if (!raw) return { characters: fallback, issue: null };

		const parsed = JSON.parse(raw);
		const validated = safeParseStoredCharacterDocuments(parsed);
		if (!validated.success) {
			return {
				characters: fallback,
				issue: { kind: 'invalid_or_outdated' }
			};
		}

		return { characters: validated.data, issue: null };
	} catch {
		return {
			characters: fallback,
			issue: { kind: 'invalid_or_outdated' }
		};
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

export const clearStoredCharacters = (): void => {
	if (!browser) return;

	try {
		localStorage.removeItem(CHARS_STORAGE_KEY);
	} catch {
		// Intentionally ignore storage removal failures.
	}
};
