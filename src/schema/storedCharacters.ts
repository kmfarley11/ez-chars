import { z } from 'zod';
import { characterDocumentCoreSchema } from './zod';
import {
	hydrate5e2014CharacterDocument,
	serialize5e2014CharacterDocument,
	type CharacterDocument5e2014
} from './system.5e2014';
import { SYSTEM_ID_5E2014 } from './versions.5e2014';

export type CharacterDocumentUnknown = z.infer<typeof characterDocumentCoreSchema>;
export type CharacterWithSystemData = CharacterDocument5e2014 | CharacterDocumentUnknown;

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

	const parsed = characterDocumentCoreSchema.safeParse(input);
	return parsed.success ? parsed : { success: false };
};

export const safeParseStoredCharacterDocuments = (
	input: unknown
): { success: true; data: CharacterWithSystemData[] } | { success: false } => {
	if (!Array.isArray(input)) return { success: false };

	const parsedEntries: CharacterWithSystemData[] = [];
	for (const entry of input) {
		const parsed = safeParseStoredCharacterDocument(entry);
		if (!parsed.success) return { success: false };
		parsedEntries.push(parsed.data);
	}
	return { success: true, data: parsedEntries };
};

export const serializeStoredCharacterDocuments = (
	characters: ReadonlyArray<CharacterWithSystemData>
): CharacterWithSystemData[] =>
	characters.map((character) =>
		character.system.id === SYSTEM_ID_5E2014
			? serialize5e2014CharacterDocument(character as CharacterDocument5e2014)
			: characterDocumentCoreSchema.parse(character)
	);
