import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { seedChars } from './fixtures/characters';
import {
	clearStoredCharacters,
	loadStoredCharacters,
	saveStoredCharacters,
	type StoredCharactersLoadIssue
} from './lib/characterStorage';
import {
	type CharacterWithSystemData,
	type CharacterDocument5e2014,
	create5e2014Character
} from './schema';

export const emptyChar: CharacterDocument5e2014 = create5e2014Character();

const initialCharactersLoad = loadStoredCharacters(seedChars);
let skipInitialCharsPersist = initialCharactersLoad.issue !== null;

export const charsStorageIssue: Writable<StoredCharactersLoadIssue | null> = writable(
	initialCharactersLoad.issue
);

export let charsArray: Writable<CharacterWithSystemData[]> = writable<CharacterWithSystemData[]>(
	initialCharactersLoad.characters
);

if (browser) {
	charsArray.subscribe((value) => {
		if (skipInitialCharsPersist) {
			skipInitialCharsPersist = false;
			return;
		}

		saveStoredCharacters(value);
		charsStorageIssue.set(null);
	});
}

export const clearRejectedStoredCharacters = (): void => {
	clearStoredCharacters();
	charsStorageIssue.set(null);
};
