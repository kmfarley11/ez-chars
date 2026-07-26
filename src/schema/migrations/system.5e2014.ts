import { z } from 'zod';
import { characterDocument5e2014Schema } from '../zod';
import { CHARACTER_DATA_VERSION_5E2014, SYSTEM_ID_5E2014 } from '../versions.5e2014';

type CurrentCharacter = z.infer<typeof characterDocument5e2014Schema>;

export type CharacterDataVersionClassification5e2014 =
	| { kind: 'current'; version: typeof CHARACTER_DATA_VERSION_5E2014 }
	| { kind: 'future'; version: string }
	| { kind: 'unsupported'; version?: string };

export type Hydrate5e2014CharacterIssue = {
	code:
		| 'invalid-header'
		| 'unsupported-system'
		| 'unsupported-version'
		| 'future-version'
		| 'invalid-current-data';
	message: string;
	path?: Array<PropertyKey>;
};

export type Hydrate5e2014CharacterResult =
	| { success: true; data: CurrentCharacter }
	| { success: false; issues: Array<Hydrate5e2014CharacterIssue> };

const characterHeaderSchema = z
	.object({
		meta: z
			.object({
				schemaVersion: z.string().min(1)
			})
			.loose(),
		system: z
			.object({
				id: z.string().min(1)
			})
			.loose()
	})
	.loose();

const versionPattern = /^dnd5e-2014\.schema\.v(\d+)$/;
const currentVersionNumber = Number(CHARACTER_DATA_VERSION_5E2014.match(versionPattern)?.[1]);

export const classify5e2014CharacterDataVersion = (
	version: string | undefined
): CharacterDataVersionClassification5e2014 => {
	if (version === CHARACTER_DATA_VERSION_5E2014) {
		return { kind: 'current', version };
	}

	const versionMatch = version?.match(versionPattern);
	if (versionMatch && Number(versionMatch[1]) > currentVersionNumber) {
		return { kind: 'future', version: version as string };
	}

	return { kind: 'unsupported', ...(version ? { version } : {}) };
};

const currentDataIssues = (error: z.ZodError): Array<Hydrate5e2014CharacterIssue> =>
	error.issues.map((issue) => ({
		code: 'invalid-current-data',
		message: issue.message,
		path: issue.path
	}));

export const hydrate5e2014CharacterDocument = (input: unknown): Hydrate5e2014CharacterResult => {
	const header = characterHeaderSchema.safeParse(input);
	if (!header.success) {
		return {
			success: false,
			issues: [
				{ code: 'invalid-header', message: 'Character metadata and system id are required.' }
			]
		};
	}
	if (header.data.system.id !== SYSTEM_ID_5E2014) {
		return {
			success: false,
			issues: [
				{
					code: 'unsupported-system',
					message: `Expected ${SYSTEM_ID_5E2014}, received ${header.data.system.id}.`,
					path: ['system', 'id']
				}
			]
		};
	}

	const classification = classify5e2014CharacterDataVersion(header.data.meta.schemaVersion);
	if (classification.kind === 'future') {
		return {
			success: false,
			issues: [
				{
					code: 'future-version',
					message: `Character data version ${classification.version} is newer than this application supports.`,
					path: ['meta', 'schemaVersion']
				}
			]
		};
	}
	if (classification.kind === 'unsupported') {
		return {
			success: false,
			issues: [
				{
					code: 'unsupported-version',
					message: `Unsupported character data version ${classification.version ?? '(missing)'}.`,
					path: ['meta', 'schemaVersion']
				}
			]
		};
	}

	const parsed = characterDocument5e2014Schema.safeParse(input);
	return parsed.success
		? { success: true, data: parsed.data }
		: { success: false, issues: currentDataIssues(parsed.error) };
};

export const serialize5e2014CharacterDocument = (character: CurrentCharacter): CurrentCharacter =>
	characterDocument5e2014Schema.parse(character);
