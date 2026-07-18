import type { Reference } from './core';
import { nowIso, createId } from './helpers';
import { FULL_2014_SRD_URL } from '$utils/urlHelpers.js';
import { z } from 'zod';
import {
	hydrate5e2014CharacterDocument,
	serialize5e2014CharacterDocument
} from './migrations/system.5e2014';
import {
	CHARACTER_DATA_VERSION_5E2014,
	RULES_VERSION_5E2014,
	SYSTEM_ID_5E2014
} from './versions.5e2014';
import {
	abilityKeySchema,
	dnd5eSkillNameSchema,
	spellLevelSchema,
	abilityScoreSchema,
	saveSchema,
	skillSchema,
	combatBlockSchema,
	hitPointsSchema,
	hitDiceSchema,
	deathSavesSchema,
	raceChoiceSchema,
	backgroundChoiceSchema,
	classLevelSchema,
	featureRefSchema,
	runtimeActionSchema,
	currencyDenominationSchema,
	currencyAmountSchema,
	currencySchema,
	roleplayFieldKeySchema,
	roleplayFieldSchema,
	roleplaySchema,
	proficiencySourceKindSchema,
	proficiencySourceSchema,
	namedProficiencySchema,
	proficienciesSchema,
	spellcastingBlockSchema,
	spellSlotsSchema,
	spellRefSchema,
	dnd5e2014SystemDataSchema,
	characterDocument5e2014Schema,
	annotationSchema,
	featureSchema,
	itemSchema,
	noteBlockSchema
} from './zod';

export {
	CHARACTER_DATA_VERSION_5E2014,
	RULES_VERSION_5E2014,
	SYSTEM_ID_5E2014,
	hydrate5e2014CharacterDocument,
	serialize5e2014CharacterDocument,
	abilityKeySchema,
	dnd5eSkillNameSchema,
	spellLevelSchema,
	abilityScoreSchema,
	saveSchema,
	skillSchema,
	combatBlockSchema,
	hitPointsSchema,
	hitDiceSchema,
	deathSavesSchema,
	raceChoiceSchema,
	backgroundChoiceSchema,
	classLevelSchema,
	featureRefSchema,
	runtimeActionSchema,
	currencyDenominationSchema,
	currencyAmountSchema,
	currencySchema,
	roleplayFieldKeySchema,
	roleplayFieldSchema,
	roleplaySchema,
	proficiencySourceKindSchema,
	proficiencySourceSchema,
	namedProficiencySchema,
	proficienciesSchema,
	spellcastingBlockSchema,
	spellSlotsSchema,
	spellRefSchema,
	dnd5e2014SystemDataSchema,
	characterDocument5e2014Schema
};

export type AbilityKey = z.infer<typeof abilityKeySchema>;
export type Dnd5eSkillName = z.infer<typeof dnd5eSkillNameSchema>;
export type SpellLevel = z.infer<typeof spellLevelSchema>;
export type AbilityScore = z.infer<typeof abilityScoreSchema>;
export type Save = z.infer<typeof saveSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type CombatBlock = z.infer<typeof combatBlockSchema>;
export type HitPoints = z.infer<typeof hitPointsSchema>;
export type HitDice = z.infer<typeof hitDiceSchema>;
export type DeathSaves = z.infer<typeof deathSavesSchema>;
export type RaceChoice = z.infer<typeof raceChoiceSchema>;
export type BackgroundChoice = z.infer<typeof backgroundChoiceSchema>;
export type ClassLevel = z.infer<typeof classLevelSchema>;
export type FeatureRef = z.infer<typeof featureRefSchema>;
export type RuntimeAction = z.infer<typeof runtimeActionSchema>;
export type CurrencyDenomination = z.infer<typeof currencyDenominationSchema>;
export type CurrencyAmount = z.infer<typeof currencyAmountSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type RoleplayFieldKey = z.infer<typeof roleplayFieldKeySchema>;
export type RoleplayField = z.infer<typeof roleplayFieldSchema>;
export type Roleplay = z.infer<typeof roleplaySchema>;
export type ProficiencySourceKind = z.infer<typeof proficiencySourceKindSchema>;
export type ProficiencySource = z.infer<typeof proficiencySourceSchema>;
export type NamedProficiency = z.infer<typeof namedProficiencySchema>;
export type Proficiencies = z.infer<typeof proficienciesSchema>;
export type SpellcastingBlock = z.infer<typeof spellcastingBlockSchema>;
export type SpellSlots = z.infer<typeof spellSlotsSchema>;
export type SpellRef = z.infer<typeof spellRefSchema>;
export type Dnd5e2014SystemData = z.infer<typeof dnd5e2014SystemDataSchema>;
export type CharacterDocument5e2014 = z.infer<typeof characterDocument5e2014Schema>;

export const SRD_REF_5E_2014: Reference = {
	kind: 'pdf',
	locator: {
		url: FULL_2014_SRD_URL
	},
	sourceId: 'local-5.1-srd' // createId()
};

export const DND_BEYOND_BASIC_RULES_REF_5E_2014: Reference = {
	kind: 'url',
	locator: {
		url: 'https://www.dndbeyond.com/sources/dnd/basic-rules-2014'
	},
	sourceId: 'dndbeyond-basic-rules-2014'
};

const create5e2014CharacterOptionsSchema = z
	.object({
		name: z.string().min(1).optional(),
		hp: z.coerce.number().int().min(0).optional(),
		ac: z.coerce.number().int().min(0).optional(),
		meta: z
			.object({
				id: z.string().min(1).optional(),
				schemaVersion: z.literal(CHARACTER_DATA_VERSION_5E2014).optional(),
				createdAt: z.string().min(1).optional(),
				updatedAt: z.string().min(1).optional()
			})
			.partial()
			.optional(),
		system: z
			.object({
				id: z.literal(SYSTEM_ID_5E2014).optional(),
				version: z.string().min(1).optional(),
				source: z.enum(['local', 'remote', 'import']).optional(),
				annotations: z.array(annotationSchema).optional()
			})
			.partial()
			.optional(),
		identity: z.record(z.string(), z.unknown()).optional(),
		features: z.array(featureSchema).optional(),
		inventory: z.array(itemSchema).optional(),
		notes: z.array(noteBlockSchema).optional(),
		annotations: z.array(annotationSchema).optional(),
		systemData: z.record(z.string(), z.unknown()).optional()
	})
	.strict();
export type Create5e2014CharacterOptions = z.infer<typeof create5e2014CharacterOptionsSchema>;

const create5e2014FactoryInputSchema = create5e2014CharacterOptionsSchema.pick({
	name: true,
	hp: true,
	ac: true
});

export function parse5e2014CharacterDocument(input: unknown): CharacterDocument5e2014 {
	return characterDocument5e2014Schema.parse(input);
}

export function safeParse5e2014CharacterDocument(input: unknown) {
	return characterDocument5e2014Schema.safeParse(input);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override?: unknown): T {
	if (override === undefined) return base;
	if (Array.isArray(base)) return (override as T) ?? base;
	if (!isPlainObject(base) || !isPlainObject(override)) return (override as T) ?? base;

	const merged: Record<string, unknown> = { ...base };
	for (const key of Object.keys(override)) {
		const baseVal = (base as Record<string, unknown>)[key];
		const overrideVal = (override as Record<string, unknown>)[key];
		if (overrideVal === undefined) continue;
		if (isPlainObject(baseVal) && isPlainObject(overrideVal)) {
			merged[key] = deepMerge(baseVal, overrideVal);
			continue;
		}
		merged[key] = overrideVal;
	}

	return merged as T;
}

function normalizeCharacterOptions(
	arg0?: string | Create5e2014CharacterOptions,
	hp?: number,
	ac?: number
): Create5e2014CharacterOptions {
	if (typeof arg0 === 'string' || arg0 === undefined) return { name: arg0, hp, ac };
	return arg0;
}

export function create5e2014Character(): CharacterDocument5e2014;
export function create5e2014Character(
	name?: string,
	hp?: number,
	ac?: number
): CharacterDocument5e2014;
export function create5e2014Character(
	options: Create5e2014CharacterOptions
): CharacterDocument5e2014;
export function create5e2014Character(
	arg0?: string | Create5e2014CharacterOptions,
	hp?: number,
	ac?: number
): CharacterDocument5e2014 {
	const normalized = normalizeCharacterOptions(arg0, hp, ac);
	const basic = create5e2014FactoryInputSchema.parse({
		name: normalized.name,
		hp: normalized.hp,
		ac: normalized.ac
	});
	const options = create5e2014CharacterOptionsSchema.parse(normalized);
	const hpValue = basic.hp ?? 5;
	const acValue = basic.ac ?? 10;

	const base: CharacterDocument5e2014 = {
		meta: {
			id: createId(),
			schemaVersion: CHARACTER_DATA_VERSION_5E2014,
			createdAt: nowIso(),
			updatedAt: nowIso()
		},
		system: {
			id: SYSTEM_ID_5E2014,
			version: RULES_VERSION_5E2014,
			source: 'local',
			annotations: [
				{ origin: 'source', kind: 'tag', text: '2014-5e' },
				{ origin: 'source', kind: 'tag', text: '2014-5e-srd', ref: SRD_REF_5E_2014 },
				{ origin: 'source', kind: 'tag', text: '2014-5e-ua-sidekick' }
			]
		},
		identity: {
			name: options.name ?? 'Ole No Name'
		},
		features: [],
		inventory: [],
		notes: [],
		systemData: {
			level: 0,
			proficiencyBonus: 0,
			abilities: {
				str: { score: 10, mod: 0 },
				dex: { score: 10, mod: 0 },
				con: { score: 10, mod: 0 },
				int: { score: 10, mod: 0 },
				wis: { score: 10, mod: 0 },
				cha: { score: 10, mod: 0 }
			},
			saves: {},
			skills: {},
			combat: {
				armorClass: acValue,
				hitPoints: {
					max: hpValue,
					current: hpValue,
					temp: 0
				},
				deathSaves: {
					successes: 0,
					failures: 0
				}
			},
			classes: [],
			runtimeActions: [],
			currency: {},
			roleplay: {},
			proficiencies: {
				languages: [],
				tools: []
			}
		}
	};

	const withOverrides: CharacterDocument5e2014 = {
		...base,
		meta: {
			...base.meta,
			...options.meta
		},
		system: {
			...base.system,
			...options.system
		},
		identity: deepMerge(base.identity, options.identity),
		features: options.features ?? base.features,
		inventory: options.inventory ?? base.inventory,
		notes: options.notes ?? base.notes,
		systemData: deepMerge(base.systemData, options.systemData)
	};

	if (options.annotations !== undefined) withOverrides.annotations = options.annotations;

	return serialize5e2014CharacterDocument(withOverrides);
}
