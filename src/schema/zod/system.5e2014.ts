import { z } from 'zod';
import {
	annotationSchema,
	featureSchema,
	identitySchema,
	itemSchema,
	metaSchema,
	noteBlockSchema
} from './core';
import {
	CHARACTER_DATA_VERSION_5E2014,
	CHARACTER_DATA_VERSION_5E2014_V2,
	SYSTEM_ID_5E2014
} from '../versions.5e2014';

const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export const abilityKeySchema = z.enum(abilityKeys);

const skillNames = [
	'Acrobatics',
	'Animal Handling',
	'Arcana',
	'Athletics',
	'Deception',
	'History',
	'Insight',
	'Intimidation',
	'Investigation',
	'Medicine',
	'Nature',
	'Perception',
	'Performance',
	'Persuasion',
	'Religion',
	'Sleight of Hand',
	'Stealth',
	'Survival'
] as const;
export const dnd5eSkillNameSchema = z.enum(skillNames);

const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const spellLevelSchema = z.union(
	spellLevels.map((level) => z.literal(level)) as [
		z.ZodLiteral<0>,
		z.ZodLiteral<1>,
		z.ZodLiteral<2>,
		z.ZodLiteral<3>,
		z.ZodLiteral<4>,
		z.ZodLiteral<5>,
		z.ZodLiteral<6>,
		z.ZodLiteral<7>,
		z.ZodLiteral<8>,
		z.ZodLiteral<9>
	]
);

const spellSlotLevelKeySchema = z.enum(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

export const abilityScoreSchema = z
	.object({
		score: z.number(),
		mod: z.number().optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const saveSchema = z
	.object({
		proficient: z.boolean().optional(),
		bonus: z.number().optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const skillSchema = z
	.object({
		proficient: z.boolean().optional(),
		expertise: z.boolean().optional(),
		bonus: z.number().optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const hitPointsSchema = z
	.object({
		max: z.number().int().min(0),
		current: z.number().int().min(0),
		temp: z.number().int().min(0).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const hitDiceSchema = z
	.object({
		total: z.string().min(1),
		remaining: z.string().min(1).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const deathSavesSchema = z
	.object({
		successes: z.number().int().min(0).max(3).optional(),
		failures: z.number().int().min(0).max(3).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

const combatSensesSchema = z
	.object({
		passivePerception: z.number().int().optional(),
		darkvision: z.number().int().optional(),
		blindsight: z.number().int().optional(),
		tremorsense: z.number().int().optional(),
		truesight: z.number().int().optional()
	})
	.strict();

const movementNumberSchema = z.number().int().min(0);

export const combatBlockSchema = z
	.object({
		armorClass: z.number().int().min(0),
		initiative: z.number().int().optional(),
		speed: movementNumberSchema.optional(),
		speedFly: movementNumberSchema.optional(),
		speedSwim: movementNumberSchema.optional(),
		speedClimb: movementNumberSchema.optional(),
		hitPoints: hitPointsSchema,
		hitDice: hitDiceSchema.optional(),
		deathSaves: deathSavesSchema.optional(),
		senses: combatSensesSchema.optional(),
		conditions: z.array(z.string()).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

const legacyMovementNumberSchema = z.union([movementNumberSchema, z.string()]);

export const legacyCombatBlockSchema = combatBlockSchema.extend({
	speed: legacyMovementNumberSchema.optional(),
	speedFly: legacyMovementNumberSchema.optional(),
	speedSwim: legacyMovementNumberSchema.optional(),
	speedClimb: legacyMovementNumberSchema.optional()
});

export const featureRefSchema = z
	.object({
		featureId: z.string().optional(),
		name: z.string().min(1),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const raceChoiceSchema = z
	.object({
		name: z.string().min(1),
		subrace: z.string().optional(),
		size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']).optional(),
		speed: z.number().int().optional(),
		speedFly: z.number().int().optional(),
		speedSwim: z.number().int().optional(),
		speedClimb: z.number().int().optional(),
		traits: z.array(featureRefSchema).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const legacyRaceChoiceSchema = raceChoiceSchema.extend({
	languages: z.array(z.string()).optional()
});

export const backgroundChoiceSchema = z
	.object({
		name: z.string().min(1),
		features: z.array(featureRefSchema).optional(),
		proficiencies: z
			.object({
				skills: z.array(dnd5eSkillNameSchema).optional()
			})
			.strict()
			.optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const legacyBackgroundChoiceSchema = backgroundChoiceSchema.extend({
	proficiencies: z
		.object({
			skills: z.array(dnd5eSkillNameSchema).optional(),
			tools: z.array(z.string()).optional(),
			languages: z.array(z.string()).optional()
		})
		.strict()
		.optional()
});

export const classLevelSchema = z
	.object({
		name: z.string().min(1),
		level: z.number().int().min(1),
		subclass: z.string().optional(),
		hitDie: z.string().optional(),
		features: z.array(featureRefSchema).optional(),
		spellcasting: z
			.object({
				ability: abilityKeySchema.optional()
			})
			.strict()
			.optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const runtimeActionV2Schema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1),
		timing: z.enum(['action', 'bonusAction', 'reaction', 'free', 'other']).optional(),
		category: z.enum(['attack', 'effect', 'other']).optional(),
		target: z.string().optional(),
		notes: z.string().optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const runtimeActionSourceSchema = z
	.object({
		kind: z.literal('item'),
		id: z.string().min(1)
	})
	.strict();

export const runtimeActionSchema = runtimeActionV2Schema.extend({
	source: runtimeActionSourceSchema.optional()
});

export const currencyDenominationSchema = z.enum(['pp', 'gp', 'ep', 'sp', 'cp']);

export const currencyAmountSchema = z
	.object({
		amount: z.number().int().min(0),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const currencySchema = z
	.object({
		pp: currencyAmountSchema.optional(),
		gp: currencyAmountSchema.optional(),
		ep: currencyAmountSchema.optional(),
		sp: currencyAmountSchema.optional(),
		cp: currencyAmountSchema.optional()
	})
	.strict();

export const roleplayFieldKeySchema = z.enum([
	'motives',
	'personalityTraits',
	'ideals',
	'bonds',
	'flaws',
	'otherBackgroundHistory',
	'factionsOrgs',
	'otherCharacterInfo'
]);

export const roleplayFieldSchema = z
	.object({
		body: z.string(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const roleplaySchema = z
	.object({
		motives: roleplayFieldSchema.optional(),
		personalityTraits: roleplayFieldSchema.optional(),
		ideals: roleplayFieldSchema.optional(),
		bonds: roleplayFieldSchema.optional(),
		flaws: roleplayFieldSchema.optional(),
		otherBackgroundHistory: roleplayFieldSchema.optional(),
		factionsOrgs: roleplayFieldSchema.optional(),
		otherCharacterInfo: roleplayFieldSchema.optional()
	})
	.strict();

export const proficiencySourceKindSchema = z.enum([
	'ancestry',
	'background',
	'class',
	'feature',
	'other'
]);

export const proficiencySourceSchema = z
	.object({
		kind: proficiencySourceKindSchema,
		sourceId: z.string().min(1).optional()
	})
	.strict();

export const namedProficiencySchema = z
	.object({
		name: z.string().min(1),
		source: proficiencySourceSchema.optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const proficienciesSchema = z
	.object({
		languages: z.array(namedProficiencySchema),
		tools: z.array(namedProficiencySchema)
	})
	.strict();

export const spellSlotsSchema = z
	.object({
		max: z.number().int().min(0),
		used: z.number().int().min(0),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const spellRefSchema = z
	.object({
		spellId: z.string().optional(),
		name: z.string().min(1),
		level: spellLevelSchema.optional(),
		prepared: z.boolean().optional(),
		notes: z.string().optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const spellcastingBlockSchema = z
	.object({
		ability: abilityKeySchema,
		spellSaveDC: z.number().optional(),
		spellAttackBonus: z.number().optional(),
		slots: z.partialRecord(spellSlotLevelKeySchema, spellSlotsSchema).optional(),
		spells: z.array(spellRefSchema).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

const savesSchema = z
	.object({
		str: saveSchema.optional(),
		dex: saveSchema.optional(),
		con: saveSchema.optional(),
		int: saveSchema.optional(),
		wis: saveSchema.optional(),
		cha: saveSchema.optional()
	})
	.strict();

const skillsSchema = z
	.object({
		Acrobatics: skillSchema.optional(),
		'Animal Handling': skillSchema.optional(),
		Arcana: skillSchema.optional(),
		Athletics: skillSchema.optional(),
		Deception: skillSchema.optional(),
		History: skillSchema.optional(),
		Insight: skillSchema.optional(),
		Intimidation: skillSchema.optional(),
		Investigation: skillSchema.optional(),
		Medicine: skillSchema.optional(),
		Nature: skillSchema.optional(),
		Perception: skillSchema.optional(),
		Performance: skillSchema.optional(),
		Persuasion: skillSchema.optional(),
		Religion: skillSchema.optional(),
		'Sleight of Hand': skillSchema.optional(),
		Stealth: skillSchema.optional(),
		Survival: skillSchema.optional()
	})
	.strict();

const annotationEntriesSchema = z.record(z.string().min(1), annotationSchema);

const mirroredSystemDataAnnotationNodeSchema: z.ZodType<unknown> = z.lazy(() =>
	z
		.object({
			_annotations: annotationEntriesSchema.optional()
		})
		.catchall(
			z.union([
				mirroredSystemDataAnnotationNodeSchema,
				z.array(mirroredSystemDataAnnotationNodeSchema)
			])
		)
);

const mirroredSystemDataAnnotationsSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
	z
		.object({
			_annotations: annotationEntriesSchema.optional()
		})
		.catchall(
			z.union([
				mirroredSystemDataAnnotationNodeSchema,
				z.array(mirroredSystemDataAnnotationNodeSchema)
			])
		)
);

const dnd5e2014SystemDataBaseSchema = z
	.object({
		level: z.number().int().min(0),
		proficiencyBonus: z.number().int().min(0),
		abilities: z
			.object({
				str: abilityScoreSchema,
				dex: abilityScoreSchema,
				con: abilityScoreSchema,
				int: abilityScoreSchema,
				wis: abilityScoreSchema,
				cha: abilityScoreSchema
			})
			.strict(),
		saves: savesSchema,
		skills: skillsSchema,
		combat: combatBlockSchema,
		race: raceChoiceSchema.optional(),
		background: backgroundChoiceSchema.optional(),
		classes: z.array(classLevelSchema),
		currency: currencySchema,
		roleplay: roleplaySchema,
		proficiencies: proficienciesSchema,
		spellcasting: spellcastingBlockSchema.optional(),
		annotations: mirroredSystemDataAnnotationsSchema.optional()
	})
	.strict();

export const dnd5e2014SystemDataV2Schema = dnd5e2014SystemDataBaseSchema.extend({
	runtimeActions: z.array(runtimeActionV2Schema)
});

export const dnd5e2014SystemDataSchema = dnd5e2014SystemDataBaseSchema.extend({
	runtimeActions: z.array(runtimeActionSchema)
});

export const legacyDnd5e2014SystemDataSchema = dnd5e2014SystemDataV2Schema
	.omit({
		combat: true,
		race: true,
		background: true,
		runtimeActions: true,
		currency: true,
		roleplay: true,
		proficiencies: true
	})
	.extend({
		combat: legacyCombatBlockSchema,
		race: legacyRaceChoiceSchema.optional(),
		background: legacyBackgroundChoiceSchema.optional(),
		runtimeActions: z.array(runtimeActionV2Schema).optional(),
		attacks: z.array(runtimeActionV2Schema).optional(),
		currency: currencySchema.optional(),
		roleplay: roleplaySchema.optional(),
		proficiencies: proficienciesSchema.optional()
	});

const systemRefSchema = z
	.object({
		id: z.literal(SYSTEM_ID_5E2014),
		version: z.string().optional(),
		source: z.enum(['local', 'remote', 'import']).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const characterDocument5e2014Schema = z
	.object({
		meta: metaSchema.extend({ schemaVersion: z.literal(CHARACTER_DATA_VERSION_5E2014) }),
		system: systemRefSchema,
		identity: identitySchema,
		features: z.array(featureSchema),
		inventory: z.array(itemSchema),
		notes: z.array(noteBlockSchema),
		systemData: dnd5e2014SystemDataSchema,
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const characterDocument5e2014V2Schema = z
	.object({
		meta: metaSchema.extend({ schemaVersion: z.literal(CHARACTER_DATA_VERSION_5E2014_V2) }),
		system: systemRefSchema,
		identity: identitySchema,
		features: z.array(featureSchema),
		inventory: z.array(itemSchema),
		notes: z.array(noteBlockSchema),
		systemData: dnd5e2014SystemDataV2Schema,
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const legacyCharacterDocument5e2014Schema = z
	.object({
		meta: metaSchema,
		system: systemRefSchema,
		identity: identitySchema,
		features: z.array(featureSchema).optional(),
		inventory: z.array(itemSchema).optional(),
		notes: z.array(noteBlockSchema).optional(),
		systemData: legacyDnd5e2014SystemDataSchema,
		annotations: z.array(annotationSchema).optional()
	})
	.strict();
