import { z } from 'zod';
import {
	characterDocument5e2014Schema,
	currencyDenominationSchema,
	legacyCharacterDocument5e2014Schema,
	annotationSchema
} from '../zod';
import {
	CHARACTER_DATA_VERSION_5E2014,
	LEGACY_CHARACTER_DATA_VERSIONS_5E2014,
	SYSTEM_ID_5E2014
} from '../versions.5e2014';

type CurrentCharacter = z.infer<typeof characterDocument5e2014Schema>;
type LegacyCharacter = z.infer<typeof legacyCharacterDocument5e2014Schema>;
type Annotation = z.infer<typeof annotationSchema>;
type CurrencyDenomination = z.infer<typeof currencyDenominationSchema>;

export type CharacterDataVersionClassification5e2014 =
	| { kind: 'current'; version: typeof CHARACTER_DATA_VERSION_5E2014 }
	| { kind: 'legacy'; version: (typeof LEGACY_CHARACTER_DATA_VERSIONS_5E2014)[number] }
	| { kind: 'future'; version: string }
	| { kind: 'unsupported'; version?: string };

export type Hydrate5e2014CharacterIssue = {
	code:
		| 'invalid-header'
		| 'unsupported-system'
		| 'unsupported-version'
		| 'future-version'
		| 'invalid-historical-data'
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

const futureVersionPattern = /^dnd5e-2014\.v(\d+)$/;
const currentVersionNumber = Number(CHARACTER_DATA_VERSION_5E2014.match(futureVersionPattern)?.[1]);

export const classify5e2014CharacterDataVersion = (
	version: string | undefined
): CharacterDataVersionClassification5e2014 => {
	if (version === CHARACTER_DATA_VERSION_5E2014) {
		return { kind: 'current', version };
	}
	if (
		LEGACY_CHARACTER_DATA_VERSIONS_5E2014.includes(
			version as (typeof LEGACY_CHARACTER_DATA_VERSIONS_5E2014)[number]
		)
	) {
		return {
			kind: 'legacy',
			version: version as (typeof LEGACY_CHARACTER_DATA_VERSIONS_5E2014)[number]
		};
	}

	const versionMatch = version?.match(futureVersionPattern);
	if (versionMatch && Number(versionMatch[1]) > currentVersionNumber) {
		return { kind: 'future', version: version as string };
	}

	return { kind: 'unsupported', ...(version ? { version } : {}) };
};

const roleplayTitleToKey = {
	Motives: 'motives',
	'Personality Traits': 'personalityTraits',
	Ideals: 'ideals',
	Bonds: 'bonds',
	Flaws: 'flaws',
	'Other Background/History': 'otherBackgroundHistory',
	'Factions & Orgs': 'factionsOrgs',
	'Other Character Info': 'otherCharacterInfo'
} as const;

const currencyTagPrefix = 'inventory:currency:';
const movementNumberFields = ['speed', 'speedFly', 'speedSwim', 'speedClimb'] as const;

const getCurrencyDenomination = (
	tags: Array<string> | undefined
): CurrencyDenomination | undefined => {
	for (const tag of tags ?? []) {
		if (!tag.startsWith(currencyTagPrefix)) continue;
		const parsed = currencyDenominationSchema.safeParse(tag.slice(currencyTagPrefix.length));
		if (parsed.success) return parsed.data;
	}
	return undefined;
};

const normalizeCurrencyAmount = (amount: number | undefined): number =>
	Math.max(0, Math.floor(amount ?? 0));

const migrateMovementNumbers = (combat: LegacyCharacter['systemData']['combat']) => {
	const migrated = { ...combat } as Record<string, unknown>;
	for (const field of movementNumberFields) {
		const value = migrated[field];
		if (typeof value !== 'string') continue;
		const trimmed = value.trim();
		if (!trimmed) {
			delete migrated[field];
			continue;
		}
		const parsed = Number(trimmed);
		if (Number.isInteger(parsed) && parsed >= 0) migrated[field] = parsed;
	}
	return migrated;
};

const migrateRuntimeActions = (systemData: LegacyCharacter['systemData']) => {
	if (!systemData.runtimeActions) return systemData.attacks ?? [];
	if (!systemData.attacks) return systemData.runtimeActions;

	const canonicalIds = new Set(systemData.runtimeActions.map((action) => action.id));
	const legacyIdCounts = new Map<string, number>();
	for (const action of systemData.attacks) {
		legacyIdCounts.set(action.id, (legacyIdCounts.get(action.id) ?? 0) + 1);
	}

	return [
		...systemData.runtimeActions,
		...systemData.attacks.filter(
			(action) => !canonicalIds.has(action.id) && legacyIdCounts.get(action.id) === 1
		)
	];
};

const migrateCurrency = (character: LegacyCharacter) => {
	const currency = structuredClone(character.systemData.currency ?? {});
	const migratedAnnotations: Partial<Record<CurrencyDenomination, Array<Annotation>>> = {};
	const migratedAmounts: Partial<Record<CurrencyDenomination, number>> = {};
	const inventory = [];

	for (const item of character.inventory ?? []) {
		const denomination = getCurrencyDenomination(item.tags);
		if (!denomination) {
			inventory.push(item);
			continue;
		}
		migratedAmounts[denomination] =
			(migratedAmounts[denomination] ?? 0) + normalizeCurrencyAmount(item.quantity);
		if (item.annotations?.length) {
			migratedAnnotations[denomination] = [
				...(migratedAnnotations[denomination] ?? []),
				...item.annotations
			];
		}
	}

	for (const denomination of currencyDenominationSchema.options) {
		const current = currency[denomination];
		if (current) continue;
		const amount = migratedAmounts[denomination] ?? 0;
		const annotations = migratedAnnotations[denomination];
		if (amount === 0 && !annotations?.length) continue;
		currency[denomination] = {
			amount,
			...(annotations?.length ? { annotations } : {})
		};
	}

	return { currency, inventory };
};

const migrateRoleplay = (character: LegacyCharacter) => {
	const roleplay = structuredClone(character.systemData.roleplay ?? {});
	const migratedKeys = new Set<string>();
	const notes = [];

	for (const note of character.notes ?? []) {
		const key = note.title
			? roleplayTitleToKey[note.title as keyof typeof roleplayTitleToKey]
			: undefined;
		if (!key || roleplay[key] || migratedKeys.has(key)) {
			notes.push(note);
			continue;
		}
		roleplay[key] = {
			body: note.body,
			...(note.annotations?.length ? { annotations: note.annotations } : {})
		};
		migratedKeys.add(key);
	}

	return { roleplay, notes };
};

const migrateProficiencies = (systemData: LegacyCharacter['systemData']) => {
	const proficiencies = structuredClone(systemData.proficiencies ?? { languages: [], tools: [] });

	for (const name of systemData.race?.languages ?? []) {
		proficiencies.languages.push({ name, source: { kind: 'ancestry' } });
	}
	for (const name of systemData.background?.proficiencies?.languages ?? []) {
		proficiencies.languages.push({ name, source: { kind: 'background' } });
	}
	for (const name of systemData.background?.proficiencies?.tools ?? []) {
		proficiencies.tools.push({ name, source: { kind: 'background' } });
	}

	const race = systemData.race
		? (({ languages: _languages, ...rest }) => rest)(systemData.race)
		: undefined;
	let background = systemData.background ? structuredClone(systemData.background) : undefined;
	if (background?.proficiencies) {
		const { languages: _languages, tools: _tools, ...remaining } = background.proficiencies;
		if (Object.keys(remaining).length > 0) background.proficiencies = remaining;
		else delete background.proficiencies;
	}

	return { proficiencies, race, background };
};

const migrateLegacyV1ToCurrent = (legacy: LegacyCharacter): unknown => {
	const character = structuredClone(legacy);
	const { currency, inventory } = migrateCurrency(character);
	const { roleplay, notes } = migrateRoleplay(character);
	const { proficiencies, race, background } = migrateProficiencies(character.systemData);
	const {
		attacks: _attacks,
		currency: _currency,
		roleplay: _roleplay,
		proficiencies: _proficiencies,
		...remainingSystemData
	} = character.systemData;

	return {
		...character,
		meta: {
			...character.meta,
			schemaVersion: CHARACTER_DATA_VERSION_5E2014
		},
		features: character.features ?? [],
		inventory,
		notes,
		systemData: {
			...remainingSystemData,
			combat: migrateMovementNumbers(character.systemData.combat),
			...(race ? { race } : {}),
			...(background ? { background } : {}),
			runtimeActions: migrateRuntimeActions(character.systemData),
			currency,
			roleplay,
			proficiencies
		}
	};
};

const zodIssues = (
	code: 'invalid-historical-data' | 'invalid-current-data',
	error: z.ZodError
): Array<Hydrate5e2014CharacterIssue> =>
	error.issues.map((issue) => ({
		code,
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
	if (classification.kind === 'current') {
		const parsed = characterDocument5e2014Schema.safeParse(input);
		return parsed.success
			? { success: true, data: parsed.data }
			: { success: false, issues: zodIssues('invalid-current-data', parsed.error) };
	}

	const historical = legacyCharacterDocument5e2014Schema.safeParse(input);
	if (!historical.success) {
		return {
			success: false,
			issues: zodIssues('invalid-historical-data', historical.error)
		};
	}

	const migrated = migrateLegacyV1ToCurrent(historical.data);
	const current = characterDocument5e2014Schema.safeParse(migrated);
	return current.success
		? { success: true, data: current.data }
		: { success: false, issues: zodIssues('invalid-current-data', current.error) };
};

export const serialize5e2014CharacterDocument = (character: CurrentCharacter): CurrentCharacter =>
	characterDocument5e2014Schema.parse(character);
