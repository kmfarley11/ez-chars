import { z } from 'zod';
import {
	abilityKeys2024,
	skillAbilities2024,
	recordKinds2024,
	featureKinds2024,
	scalarPaths2024,
	recordProperties2024
} from '../fields-5e2024';
import {
	annotationSchema,
	characterDocumentCoreSchema,
	itemIdentitySchema,
	metaSchema,
	systemRefSchema
} from './core';
import {
	CHARACTER_DATA_VERSION_5E2024,
	RULES_VERSION_5E2024,
	SYSTEM_ID_5E2024
} from '../versions-5e2024';

const count = z.number().int().nonnegative();
const signed = z.number().int();
const namedRecord = itemIdentitySchema.extend({
	detail: z.string().optional(),
	annotations: z.array(annotationSchema).optional()
});
const checkSchema = z
	.object({
		proficient: z.boolean().optional(),
		expertise: z.boolean().optional(),
		bonus: signed.optional()
	})
	.strict();
export const class5e2024Schema = namedRecord.extend({
	level: z.number().int().min(1).max(20).optional(),
	subclass: z.string().optional()
});
export const feature5e2024Schema = namedRecord.extend({ context: z.string().optional() });
export const spell5e2024Schema = namedRecord.extend({
	level: z.number().int().min(0).max(9),
	prepared: z.boolean().optional()
});
export const inventoryCategory5e2024Schema = z.enum(['weapons', 'armorShields', 'other']);
export const item5e2024Schema = itemIdentitySchema.extend({
	category: inventoryCategory5e2024Schema,
	quantity: z.number().int().min(0).optional(),
	equipped: z.boolean().optional(),
	detail: z.string().optional(),
	annotations: z.array(annotationSchema).optional()
});
export const actionTiming5e2024Schema = z.enum([
	'action',
	'bonusAction',
	'reaction',
	'free',
	'other'
]);
export const runtimeAction5e2024Schema = itemIdentitySchema.extend({
	timing: actionTiming5e2024Schema.optional(),
	detail: z.string().optional(),
	source: z
		.object({ kind: z.enum(['item', 'spell', 'feature']), id: z.string().min(1) })
		.strict()
		.optional(),
	annotations: z.array(annotationSchema).optional()
});
export const note5e2024Schema = z
	.object({
		id: z.string().min(1),
		title: z.string().optional(),
		body: z.string()
	})
	.strict();
export const dnd5e2024SystemDataSchema = z
	.object({
		identity: z
			.object({
				name: z.string().min(1).optional(),
				species: z.string().optional(),
				background: z.string().optional(),
				alignment: z.string().optional(),
				appearance: z.string().optional()
			})
			.strict(),
		combat: z
			.object({
				hitPoints: z
					.object({
						current: z.number().int().min(0).optional(),
						max: z.number().int().min(0).optional(),
						temp: z.number().int().min(0).optional()
					})
					.strict()
					.optional(),
				armorClass: count.optional(),
				initiative: signed.optional(),
				hitDice: z.string().optional(),
				heroicInspiration: z.boolean().optional(),
				conditions: z.string().optional(),
				size: z.string().optional(),
				passivePerception: signed.optional(),
				deathSaves: z
					.object({ successes: count.max(3).optional(), failures: count.max(3).optional() })
					.strict()
					.optional(),
				movement: z
					.object({
						walk: count.optional(),
						climb: count.optional(),
						swim: count.optional(),
						fly: count.optional(),
						burrow: count.optional()
					})
					.strict()
					.optional()
			})
			.strict()
			.optional(),
		inventory: z.array(item5e2024Schema),
		classes: z.array(class5e2024Schema).optional(),
		abilities: z
			.partialRecord(
				z.enum(abilityKeys2024),
				z
					.object({
						score: z.number().int().min(1).max(30).optional(),
						modifier: signed.optional()
					})
					.strict()
			)
			.optional(),
		saves: z.partialRecord(z.enum(abilityKeys2024), checkSchema).optional(),
		skills: z
			.partialRecord(
				z.enum(
					Object.keys(skillAbilities2024) as [
						keyof typeof skillAbilities2024,
						...Array<keyof typeof skillAbilities2024>
					]
				),
				checkSchema
			)
			.optional(),
		proficiencyBonus: count.optional(),
		training: z
			.object({ armor: z.string().optional(), weapons: z.string().optional() })
			.strict()
			.optional(),
		languages: z.array(namedRecord).optional(),
		tools: z.array(namedRecord).optional(),
		features: z.array(feature5e2024Schema).optional(),
		traits: z.array(feature5e2024Schema).optional(),
		feats: z.array(feature5e2024Schema).optional(),
		masteries: z.array(feature5e2024Schema).optional(),
		currency: z
			.object({
				cp: count.optional(),
				sp: count.optional(),
				ep: count.optional(),
				gp: count.optional(),
				pp: count.optional()
			})
			.strict()
			.optional(),
		roleplay: z
			.object({
				personality: z.string().optional(),
				ideals: z.string().optional(),
				bonds: z.string().optional(),
				flaws: z.string().optional(),
				backstory: z.string().optional()
			})
			.strict()
			.optional(),
		spellcasting: z
			.object({
				ability: z.enum(abilityKeys2024).optional(),
				saveDC: count.optional(),
				attackBonus: signed.optional(),
				slots: z
					.partialRecord(
						z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9']),
						z.object({ used: count.optional(), max: count.optional() }).strict()
					)
					.optional()
			})
			.strict()
			.optional(),
		spells: z.array(spell5e2024Schema).optional(),
		runtimeActions: z.array(runtimeAction5e2024Schema),
		notes: z.array(note5e2024Schema),
		fieldNotes: z.record(z.string().min(1), z.array(annotationSchema)).optional(),
		collectionPins: z
			.object({
				inventory: z.array(z.string().min(1)).optional(),
				runtimeActions: z.array(z.string().min(1)).optional(),
				classes: z.array(z.string().min(1)).optional(),
				languages: z.array(z.string().min(1)).optional(),
				tools: z.array(z.string().min(1)).optional(),
				features: z.array(z.string().min(1)).optional(),
				traits: z.array(z.string().min(1)).optional(),
				feats: z.array(z.string().min(1)).optional(),
				masteries: z.array(z.string().min(1)).optional(),
				spells: z.array(z.string().min(1)).optional()
			})
			.strict()
			.optional()
	})
	.strict();

export const characterDocument5e2024Schema = characterDocumentCoreSchema
	.extend({
		meta: metaSchema.extend({ schemaVersion: z.literal(CHARACTER_DATA_VERSION_5E2024) }),
		system: systemRefSchema.extend({
			id: z.literal(SYSTEM_ID_5E2024),
			version: z.literal(RULES_VERSION_5E2024)
		}),
		systemData: dnd5e2024SystemDataSchema
	})
	.superRefine((character, context) => {
		const data = character.systemData;
		const sourceIds = {
			item: new Set(data.inventory.map((item) => item.id)),
			spell: new Set((data.spells ?? []).map((item) => item.id)),
			feature: new Set<string>()
		};
		for (const kind of featureKinds2024)
			for (const [index, entry] of (data[kind] ?? []).entries()) {
				if (sourceIds.feature.has(entry.id))
					context.addIssue({
						code: 'custom',
						message:
							'Feature source identities must be unique across features, traits, feats and masteries.',
						path: ['systemData', kind, index, 'id']
					});
				sourceIds.feature.add(entry.id);
			}
		for (const [index, action] of character.systemData.runtimeActions.entries()) {
			if (action.source && !sourceIds[action.source.kind].has(action.source.id))
				context.addIssue({
					code: 'custom',
					message: 'Action sources must resolve to an eligible record on this character.',
					path: ['systemData', 'runtimeActions', index, 'source']
				});
		}
		for (const kind of recordKinds2024) {
			const seen = new Set<string>();
			for (const [index, entry] of (character.systemData[kind] ?? []).entries()) {
				if (seen.has(entry.id))
					context.addIssue({
						code: 'custom',
						message: 'Record identities must be unique within their collection.',
						path: ['systemData', kind, index, 'id']
					});
				seen.add(entry.id);
				if ('annotations' in entry) {
					const ids = (entry.annotations ?? []).flatMap((note) => (note.id ? [note.id] : []));
					if (new Set(ids).size !== ids.length)
						context.addIssue({
							code: 'custom',
							message: 'Note identities must be unique on their record.',
							path: ['systemData', kind, index, 'annotations']
						});
				}
			}
			if (kind === 'notes') continue;
			const pins = character.systemData.collectionPins?.[kind] ?? [];
			const pinned = new Set<string>();
			for (const [index, id] of pins.entries()) {
				if (!seen.has(id) || pinned.has(id))
					context.addIssue({
						code: 'custom',
						message: 'Each pin must resolve to one distinct record in its collection.',
						path: ['systemData', 'collectionPins', kind, index]
					});
				pinned.add(id);
			}
		}
		for (const [key, notes] of Object.entries(data.fieldNotes ?? {})) {
			const ids = notes.flatMap((note) => (note.id ? [note.id] : []));
			if (new Set(ids).size !== ids.length)
				context.addIssue({
					code: 'custom',
					message: 'Note identities must be unique on their field.',
					path: ['systemData', 'fieldNotes', key]
				});
			const parts = key
				.split('/')
				.slice(1)
				.map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
			if (
				!key.startsWith('/') ||
				parts.some((part) => ['__proto__', 'prototype', 'constructor'].includes(part))
			) {
				context.addIssue({
					code: 'custom',
					message: 'Field notes require a safe field pointer.',
					path: ['systemData', 'fieldNotes', key]
				});
				continue;
			}
			if (parts[0] === 'systemData') {
				if (
					!scalarPaths2024.some(
						(path) =>
							path.length === parts.length && path.every((part, index) => part === parts[index])
					)
				)
					context.addIssue({
						code: 'custom',
						message: 'Field notes must target a supported scalar field.',
						path: ['systemData', 'fieldNotes', key]
					});
			} else {
				const kind = recordKinds2024.find((kind) => kind === parts[0]);
				if (
					!kind ||
					parts.length !== 3 ||
					!recordProperties2024[kind].includes(parts[2]) ||
					!(data[kind] ?? []).some((record) => record.id === parts[1])
				)
					context.addIssue({
						code: 'custom',
						message: 'Record field notes must resolve to an existing record and supported field.',
						path: ['systemData', 'fieldNotes', key]
					});
			}
		}
	});
