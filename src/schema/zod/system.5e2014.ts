import { z } from 'zod';
import {
	annotationSchema,
	featureSchema,
	identitySchema,
	itemSchema,
	metaSchema,
	noteBlockSchema
} from './core';

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

const combatSensesSchema = z
	.object({
		passivePerception: z.number().int().optional(),
		darkvision: z.number().int().optional(),
		blindsight: z.number().int().optional(),
		tremorsense: z.number().int().optional(),
		truesight: z.number().int().optional()
	})
	.strict();

export const combatBlockSchema = z
	.object({
		armorClass: z.number().int().min(0),
		initiative: z.number().int().optional(),
		speed: z.number().int().optional(),
		hitPoints: hitPointsSchema,
		hitDice: hitDiceSchema.optional(),
		senses: combatSensesSchema.optional(),
		conditions: z.array(z.string()).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

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
		languages: z.array(z.string()).optional(),
		traits: z.array(featureRefSchema).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const backgroundChoiceSchema = z
	.object({
		name: z.string().min(1),
		features: z.array(featureRefSchema).optional(),
		proficiencies: z
			.object({
				skills: z.array(dnd5eSkillNameSchema).optional(),
				tools: z.array(z.string()).optional(),
				languages: z.array(z.string()).optional()
			})
			.strict()
			.optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

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

export const attackSchema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1),
		kind: z.enum(['melee', 'ranged', 'spell', 'other']).optional(),
		toHit: z.number().optional(),
		reachOrRange: z.string().optional(),
		target: z.string().optional(),
		damage: z.string().optional(),
		notes: z.string().optional(),
		annotations: z.array(annotationSchema).optional()
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

export const dnd5e2014SystemDataSchema = z
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
		attacks: z.array(attackSchema).optional(),
		spellcasting: spellcastingBlockSchema.optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

const systemRefSchema = z
	.object({
		id: z.literal('dnd5e-2014'),
		version: z.string().optional(),
		source: z.enum(['local', 'remote', 'import']).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const characterDocument5e2014Schema = z
	.object({
		meta: metaSchema,
		system: systemRefSchema,
		identity: identitySchema,
		features: z.array(featureSchema).optional(),
		inventory: z.array(itemSchema).optional(),
		notes: z.array(noteBlockSchema).optional(),
		systemData: dnd5e2014SystemDataSchema,
		annotations: z.array(annotationSchema).optional()
	})
	.strict();
