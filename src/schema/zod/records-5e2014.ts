import { z } from 'zod';
import { annotationSchema, itemIdentitySchema } from './core';

// These records describe the 2014 sheet, not mandatory concepts for every game.
export const identitySchema = z
	.object({
		name: z.string().min(1),
		playerName: z.string().optional(),
		pronouns: z.string().optional(),
		ancestryLineage: z.string().optional(),
		background: z.string().optional(),
		alignment: z.string().optional(),
		appearance: z.string().optional(),
		description: z.string().optional(),
		tags: z.array(z.string()).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const featureSchema = itemIdentitySchema.extend({
	summary: z.string().optional(),
	description: z.string().optional(),
	tags: z.array(z.string()).optional(),
	annotations: z.array(annotationSchema).optional()
});

export const inventoryCategory5e2014Schema = z.enum(['weapons', 'armorShields', 'other']);
export const itemSchema = itemIdentitySchema.extend({
	category: inventoryCategory5e2014Schema,
	quantity: z.number().optional(),
	weight: z.number().optional(),
	value: z.string().optional(),
	equipped: z.boolean().optional(),
	notes: z.string().optional(),
	tags: z.array(z.string()).optional(),
	annotations: z.array(annotationSchema).optional()
});

export const noteBlockSchema = z
	.object({
		id: z.string().min(1),
		title: z.string().optional(),
		body: z.string(),
		kind: z.enum(['quick', 'session', 'lore', 'rules', 'other']).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const provenance5e2014Schema = z
	.object({
		source: z.enum(['local', 'remote', 'import']).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();
