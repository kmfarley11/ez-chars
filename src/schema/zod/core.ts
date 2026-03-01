import { z } from 'zod';

export const referenceSchema = z
	.object({
		sourceId: z.string().min(1),
		kind: z.enum(['pdf_page', 'url', 'external_id']),
		locator: z
			.object({
				page: z.number().int().optional(),
				url: z
					.string()
					.min(1)
					.refine((value) => {
						if (value.startsWith('/')) return true;
						try {
							new URL(value);
							return true;
						} catch {
							return false;
						}
					}, 'Invalid URL')
					.optional(),
				id: z.string().optional(),
				anchor: z.string().optional(),
				label: z.string().optional()
			})
			.strict()
	})
	.strict();

export const annotationSchema = z
	.object({
		id: z.string().optional(),
		origin: z.enum(['user', 'source']),
		kind: z.enum(['note', 'reference', 'summary', 'tag']),
		text: z.string().optional(),
		ref: referenceSchema.optional(),
		tags: z.array(z.string()).optional()
	})
	.strict();

export const metaSchema = z
	.object({
		id: z.string().min(1),
		schemaVersion: z.string().min(1),
		createdAt: z.string().min(1),
		updatedAt: z.string().min(1)
	})
	.strict();

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

export const featureSchema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1),
		summary: z.string().optional(),
		description: z.string().optional(),
		tags: z.array(z.string()).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const itemSchema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1),
		quantity: z.number().optional(),
		weight: z.number().optional(),
		value: z.string().optional(),
		equipped: z.boolean().optional(),
		notes: z.string().optional(),
		tags: z.array(z.string()).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const noteBlockSchema = z
	.object({
		id: z.string().min(1),
		title: z.string().optional(),
		body: z.string(),
		kind: z.enum(['quick', 'session', 'lore', 'rules', 'other']).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const systemRefSchema = z
	.object({
		id: z.string().min(1),
		version: z.string().optional(),
		source: z.enum(['local', 'remote', 'import']).optional(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();

export const characterDocumentCoreSchema = z
	.object({
		meta: metaSchema,
		system: systemRefSchema,
		identity: identitySchema,
		features: z.array(featureSchema).optional(),
		inventory: z.array(itemSchema).optional(),
		notes: z.array(noteBlockSchema).optional(),
		systemData: z.unknown(),
		annotations: z.array(annotationSchema).optional()
	})
	.strict();
