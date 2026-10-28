import { get, readonly, writable, type Writable } from 'svelte/store';
import { browser } from '$app/env';
import { seedChars } from '$fixtures/characters.js';
import {
	loadStoredCharacters,
	saveStoredCharacters,
	type StoredCharactersLoadIssue
} from './characterStorage.js';
import {
	type CharacterWithSystemData,
	applyCharacterImport,
	type CharacterExportEnvelope,
	type CharacterImportMode,
	type CharacterImportApplyResult
} from '../../schema/index.js';

import {
	createCharacterForSystem,
	type SupportedSystemId
} from '$lib/characters/character-dispatch';

const initialCharactersLoad = loadStoredCharacters(structuredClone(seedChars));

const storageIssue: Writable<StoredCharactersLoadIssue | null> = writable(
	initialCharactersLoad.issue
);
export const charsStorageIssue = readonly(storageIssue);

export let charsArray: Writable<CharacterWithSystemData[]> = writable<CharacterWithSystemData[]>(
	initialCharactersLoad.characters
);

export const createNewCharacter = (systemId: SupportedSystemId): CharacterWithSystemData => {
	const nextCharacter = createCharacterForSystem(systemId);
	charsArray.update((entries) => [...entries, nextCharacter]);
	return nextCharacter;
};

export const deleteCharacterById = (characterId: string): void => {
	charsArray.update((entries) => entries.filter((entry) => entry.meta.id !== characterId));
};

if (browser) {
	charsArray.subscribe((value) => {
		// Recovery is a session-long write barrier, not a skipped initial subscription.
		if (get(storageIssue)) return;
		saveStoredCharacters(value);
	});
}

export const resetRejectedStoredCharacters = (): boolean => {
	if (!get(storageIssue)) return false;
	const baseline = structuredClone(seedChars);
	// One atomic replacement: never delete the original before a potentially failing write.
	if (!saveStoredCharacters(baseline)) return false;
	charsArray.set(baseline); // Still guarded: don't perform a second subscription write.
	storageIssue.set(null);
	return true;
};

export const importCharacters = (
	envelope: CharacterExportEnvelope,
	mode: CharacterImportMode
): CharacterImportApplyResult | null => {
	if (get(storageIssue)) return null;
	const result = applyCharacterImport(get(charsArray), envelope, mode);
	charsArray.set(result.characters);
	return result;
};
