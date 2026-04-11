// =======================================================
// Discriminated union helper for app code
// =======================================================
import { z } from 'zod';
import { characterDocumentCoreSchema } from './zod';
import { safeParse5e2014CharacterDocument, type CharacterDocument5e2014 } from './system.5e2014';

export * from './core';
export * from './system.5e2014';
export * from './zod';

export type CharacterDocumentUnknown = z.infer<typeof characterDocumentCoreSchema>;
export type CharacterWithSystemData = CharacterDocument5e2014 | CharacterDocumentUnknown;

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

export function safeParseStoredCharacterDocuments(
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
