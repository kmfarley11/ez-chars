import { z } from 'zod';
import { nowIso } from './helpers';
import {
	safeParseStoredCharacterDocuments,
	serializeStoredCharacterDocuments,
	type CharacterWithSystemData
} from './storedCharacters';

export const CHARACTER_EXPORT_KIND = 'ez-chars.character-export';
export const CHARACTER_EXPORT_VERSION = 1;

export const characterExportEnvelopeSchema = z
	.object({
		kind: z.literal(CHARACTER_EXPORT_KIND),
		version: z.literal(CHARACTER_EXPORT_VERSION),
		exportedAt: z.string().min(1),
		app: z
			.object({
				name: z.literal('ez-chars'),
				version: z.string().min(1).optional()
			})
			.strict()
			.optional(),
		characters: z.unknown()
	})
	.strict();

export type CharacterExportEnvelope = {
	kind: typeof CHARACTER_EXPORT_KIND;
	version: typeof CHARACTER_EXPORT_VERSION;
	exportedAt: string;
	app?: {
		name: 'ez-chars';
		version?: string;
	};
	characters: CharacterWithSystemData[];
};

export type CharacterImportMode = 'replace' | 'merge-new';

export type CharacterImportApplyResult = {
	characters: CharacterWithSystemData[];
	addedCount: number;
	skippedDuplicateCount: number;
};

export const createCharacterExportEnvelope = (
	characters: CharacterWithSystemData[]
): CharacterExportEnvelope => ({
	kind: CHARACTER_EXPORT_KIND,
	version: CHARACTER_EXPORT_VERSION,
	exportedAt: nowIso(),
	app: {
		name: 'ez-chars'
	},
	characters: serializeStoredCharacterDocuments(characters)
});

export function safeParseCharacterExportEnvelope(
	input: unknown
): { success: true; data: CharacterExportEnvelope } | { success: false } {
	const parsedEnvelope = characterExportEnvelopeSchema.safeParse(input);
	if (!parsedEnvelope.success) return { success: false };

	const parsedCharacters = safeParseStoredCharacterDocuments(parsedEnvelope.data.characters);
	if (!parsedCharacters.success) return { success: false };

	return {
		success: true,
		data: {
			...parsedEnvelope.data,
			characters: parsedCharacters.data
		}
	};
}

export function applyCharacterImport(
	currentCharacters: CharacterWithSystemData[],
	importEnvelope: CharacterExportEnvelope,
	mode: CharacterImportMode
): CharacterImportApplyResult {
	if (mode === 'replace') {
		return {
			characters: importEnvelope.characters,
			addedCount: importEnvelope.characters.length,
			skippedDuplicateCount: 0
		};
	}

	const existingIds = new Set(currentCharacters.map((character) => character.meta.id));
	const newCharacters: CharacterWithSystemData[] = [];
	let skippedDuplicateCount = 0;

	for (const character of importEnvelope.characters) {
		if (existingIds.has(character.meta.id)) {
			skippedDuplicateCount += 1;
			continue;
		}

		existingIds.add(character.meta.id);
		newCharacters.push(character);
	}

	return {
		characters: [...currentCharacters, ...newCharacters],
		addedCount: newCharacters.length,
		skippedDuplicateCount
	};
}
