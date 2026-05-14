import { browser } from '$app/environment';
import { z } from 'zod';
import { safeParseStoredCharacterDocuments, type CharacterWithSystemData } from '../schema';

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
};

export type LoadStoredCharactersResult = {
	characters: CharacterWithSystemData[];
	issue: StoredCharactersLoadIssue | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const movementNumberFields = ['speed', 'speedFly', 'speedSwim', 'speedClimb'] as const;

function repair5eMovementNumbers(input: unknown): unknown {
	if (!Array.isArray(input)) return input;

	return input.map((entry) => {
		if (!isRecord(entry)) return entry;
		const system = entry.system;
		if (!isRecord(system) || system.id !== 'dnd5e-2014') return entry;
		const systemData = entry.systemData;
		if (!isRecord(systemData)) return entry;
		const combat = systemData.combat;
		if (!isRecord(combat)) return entry;

		const nextCombat: Record<string, unknown> = { ...combat };
		let changed = false;
		for (const field of movementNumberFields) {
			const value = nextCombat[field];
			if (typeof value !== 'string') continue;
			const trimmed = value.trim();
			if (trimmed.length === 0) {
				delete nextCombat[field];
				changed = true;
				continue;
			}
			const parsed = Number(trimmed);
			if (Number.isInteger(parsed) && parsed >= 0) {
				nextCombat[field] = parsed;
				changed = true;
			}
		}

		if (!changed) return entry;
		return {
			...entry,
			systemData: {
				...systemData,
				combat: nextCombat
			}
		};
	});
}

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

	try {
		const raw = localStorage.getItem(CHARS_STORAGE_KEY);
		if (!raw) return { characters: fallback, issue: null };

		const parsed = JSON.parse(raw);
		const migratedEnvelope = migrateStoredCharactersEnvelope(parsed);
		if (!migratedEnvelope) {
			return {
				characters: fallback,
				issue: { kind: 'invalid_or_outdated' }
			};
		}

		const repairedCharacters = repair5eMovementNumbers(migratedEnvelope.characters);
		const validated = safeParseStoredCharacterDocuments(repairedCharacters);
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
		const envelope: StoredCharactersEnvelope = {
			version: CHARS_STORAGE_ENVELOPE_VERSION,
			characters
		};

		localStorage.setItem(CHARS_STORAGE_KEY, JSON.stringify(envelope));
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
