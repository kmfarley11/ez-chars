import { z } from 'zod';
import { nowIso } from './helpers';
import { safeParse5e2014CharacterDocument, type CharacterDocument5e2014 } from './system.5e2014';
import { characterDocumentCoreSchema } from './zod';

type CharacterDocumentUnknown = z.infer<typeof characterDocumentCoreSchema>;
type CharacterWithSystemData = CharacterDocument5e2014 | CharacterDocumentUnknown;

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

export const createCharacterExportEnvelope = (
	characters: CharacterWithSystemData[]
): CharacterExportEnvelope => ({
	kind: CHARACTER_EXPORT_KIND,
	version: CHARACTER_EXPORT_VERSION,
	exportedAt: nowIso(),
	app: {
		name: 'ez-chars'
	},
	characters
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getSystemId(value: unknown): string | undefined {
	if (!isObjectRecord(value)) return undefined;

	const system = value.system;
	if (!isObjectRecord(system)) return undefined;
	if (typeof system.id !== 'string') return undefined;

	return system.id;
}

function safeParseStoredCharacterDocument(input: unknown) {
	const systemId = getSystemId(input);

	if (systemId === 'dnd5e-2014') {
		return safeParse5e2014CharacterDocument(input);
	}

	return characterDocumentCoreSchema.safeParse(input);
}

function safeParseStoredCharacterDocuments(
	input: unknown
): { success: true; data: CharacterWithSystemData[] } | { success: false } {
	if (!Array.isArray(input)) return { success: false };

	const parsedEntries: CharacterWithSystemData[] = [];

	for (const entry of input) {
		const parsed = safeParseStoredCharacterDocument(entry);
		if (!parsed.success) return { success: false };
		parsedEntries.push(parsed.data);
	}

	return { success: true, data: parsedEntries };
}
