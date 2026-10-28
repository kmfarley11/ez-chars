import {
	hydrate5e2014CharacterDocument,
	serialize5e2014CharacterDocument,
	type CharacterDocument5e2014
} from './system.5e2014';
import { SYSTEM_ID_5E2014 } from './versions.5e2014';
import { SYSTEM_ID_5E2024 } from './versions-5e2024';
import { safeParse5e2024CharacterDocument, type CharacterDocument5e2024 } from './system-5e2024';

export type CharacterWithSystemData = CharacterDocument5e2014 | CharacterDocument5e2024;

// Narrow only already validated documents. Untrusted inputs always go through parsing.
export const is5e2014Character = (
	character: CharacterWithSystemData
): character is CharacterDocument5e2014 => character.system.id === SYSTEM_ID_5E2014;
export const is5e2024Character = (
	character: CharacterWithSystemData
): character is CharacterDocument5e2024 => character.system.id === SYSTEM_ID_5E2024;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const getSystemId = (value: unknown): string | undefined => {
	if (!isObjectRecord(value) || !isObjectRecord(value.system)) return undefined;
	return typeof value.system.id === 'string' ? value.system.id : undefined;
};

export const safeParseStoredCharacterDocument = (
	input: unknown
): { success: true; data: CharacterWithSystemData } | { success: false } => {
	if (getSystemId(input) === SYSTEM_ID_5E2014) {
		const hydrated = hydrate5e2014CharacterDocument(input);
		return hydrated.success ? hydrated : { success: false };
	}

	if (getSystemId(input) === SYSTEM_ID_5E2024) {
		const parsed = safeParse5e2024CharacterDocument(input);
		return parsed.success ? parsed : { success: false };
	}
	return { success: false };
};

export const safeParseStoredCharacterDocuments = (
	input: unknown,
	options: { allowDuplicateIds?: boolean } = {}
): { success: true; data: CharacterWithSystemData[] } | { success: false } => {
	if (!Array.isArray(input)) return { success: false };

	const parsedEntries: CharacterWithSystemData[] = [];
	const ids = new Set<string>();
	for (const entry of input) {
		const parsed = safeParseStoredCharacterDocument(entry);
		if (!parsed.success) return { success: false };
		if (!options.allowDuplicateIds && ids.has(parsed.data.meta.id)) return { success: false };
		ids.add(parsed.data.meta.id);
		parsedEntries.push(parsed.data);
	}
	return { success: true, data: parsedEntries };
};

export const serializeStoredCharacterDocuments = (
	characters: ReadonlyArray<CharacterWithSystemData>
): CharacterWithSystemData[] => {
	const ids = new Set<string>();
	return characters.map((character) => {
		const parsed = safeParseStoredCharacterDocument(character);
		if (!parsed.success) throw new Error('Cannot serialize an unsupported or invalid character.');
		if (ids.has(parsed.data.meta.id))
			throw new Error('Duplicate character IDs. Use Merge New to skip duplicates instead.');
		ids.add(parsed.data.meta.id);
		return is5e2014Character(parsed.data)
			? serialize5e2014CharacterDocument(parsed.data)
			: parsed.data;
	});
};
