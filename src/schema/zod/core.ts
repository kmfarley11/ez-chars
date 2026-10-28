import { z } from 'zod';

export const referenceSchema = z
	.object({
		sourceId: z.string().min(1),
		kind: z.enum(['pdf', 'url']),
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
		name: z.string().min(1).optional(),
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

// An opt-in identity primitive, not a universal inventory/mechanics contract.
export const itemIdentitySchema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1)
	})
	.strict();

export const systemRefSchema = z
	.object({
		id: z.string().min(1),
		version: z.string().min(1)
	})
	.strict();

export const characterDocumentCoreSchema = z
	.object({
		meta: metaSchema,
		system: systemRefSchema,
		systemData: z.unknown()
	})
	.strict();
