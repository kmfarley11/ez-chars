import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { seedChars } from './fixtures/characters';
import { loadStoredCharacters, saveStoredCharacters } from './lib/characterStorage';
import {
	type CharacterWithSystemData,
	type CharacterDocument5e2014,
	create5e2014Character
} from './schema';

export const emptyChar: CharacterDocument5e2014 = create5e2014Character();

export let charsArray: Writable<CharacterWithSystemData[]> = writable<CharacterWithSystemData[]>(
	loadStoredCharacters(seedChars)
);

if (browser) {
	charsArray.subscribe((value) => {
		saveStoredCharacters(value);
	});
}
