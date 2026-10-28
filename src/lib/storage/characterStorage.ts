import { browser } from '$app/env';
import { z } from 'zod';
import {
	safeParseStoredCharacterDocuments,
	serializeStoredCharacterDocuments,
	type CharacterWithSystemData
} from '../../schema/index.js';

const CHARS_STORAGE_KEY = 'ez-chars.characters.v1';
const CHARS_STORAGE_ENVELOPE_VERSION = 1;

const storedCharactersEnvelopeHeaderSchema = z
	.object({
		version: z.number().int(),
		characters: z.unknown()
	})
	.strict();

type StoredCharactersEnvelope = {
	version: typeof CHARS_STORAGE_ENVELOPE_VERSION;
	characters: CharacterWithSystemData[];
};

export type StoredCharactersLoadIssue = {
	kind: 'invalid_or_outdated';
	// Retain the exact local bytes for recovery, never a parsed or normalized substitute.
	// null means storage could not be read, not that it is safe to overwrite.
	originalData: string | null;
};

export type LoadStoredCharactersResult = {
	characters: CharacterWithSystemData[];
	issue: StoredCharactersLoadIssue | null;
};

function migrateStoredCharactersEnvelope(
	input: unknown
): { version: typeof CHARS_STORAGE_ENVELOPE_VERSION; characters: unknown } | null {
	// Legacy storage format before slice 4 stored the character array directly.
	if (Array.isArray(input)) {
		return {
			version: CHARS_STORAGE_ENVELOPE_VERSION,
			characters: input
		};
	}

	const parsedEnvelope = storedCharactersEnvelopeHeaderSchema.safeParse(input);
	if (!parsedEnvelope.success) return null;

	switch (parsedEnvelope.data.version) {
		case CHARS_STORAGE_ENVELOPE_VERSION:
			return {
				version: CHARS_STORAGE_ENVELOPE_VERSION,
				characters: parsedEnvelope.data.characters
			};
		default:
			return null;
	}
}

export const loadStoredCharacters = (
	fallback: CharacterWithSystemData[]
): LoadStoredCharactersResult => {
	if (!browser) return { characters: fallback, issue: null };

	let raw: string | null = null;
	try {
		raw = localStorage.getItem(CHARS_STORAGE_KEY);
		if (raw === null) return { characters: fallback, issue: null };

		const parsed = JSON.parse(raw);
		const migratedEnvelope = migrateStoredCharactersEnvelope(parsed);
		if (!migratedEnvelope) {
			return {
				characters: fallback,
				issue: { kind: 'invalid_or_outdated', originalData: raw }
			};
		}

		const validated = safeParseStoredCharacterDocuments(migratedEnvelope.characters);
		if (!validated.success) {
			return {
				characters: fallback,
				issue: { kind: 'invalid_or_outdated', originalData: raw }
			};
		}

		return { characters: validated.data, issue: null };
	} catch {
		return {
			characters: fallback,
			issue: { kind: 'invalid_or_outdated', originalData: raw }
		};
	}
};

export const saveStoredCharacters = (characters: CharacterWithSystemData[]): boolean => {
	if (!browser) return false;

	try {
		const serializedCharacters = serializeStoredCharacterDocuments(characters);
		const envelope: StoredCharactersEnvelope = {
			version: CHARS_STORAGE_ENVELOPE_VERSION,
			characters: serializedCharacters
		};

		localStorage.setItem(CHARS_STORAGE_KEY, JSON.stringify(envelope));
		return true;
	} catch {
		// The caller must not claim that a recovery reset succeeded after a failed write.
		return false;
	}
};
