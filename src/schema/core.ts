import { z } from 'zod';
import {
	annotationSchema,
	characterDocumentCoreSchema,
	itemIdentitySchema,
	metaSchema,
	referenceSchema,
	systemRefSchema
} from './zod/core';

// =======================================================
// Core: shared across systems
// =======================================================

export type Id = string;

export type Meta = z.infer<typeof metaSchema>;
export type SystemRef = z.infer<typeof systemRefSchema>;
export type ItemIdentity = z.infer<typeof itemIdentitySchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type CharacterDocument = z.infer<typeof characterDocumentCoreSchema>;

export const annotationOriginSchema = z.enum(['user', 'source']);
export type AnnotationOrigin = z.infer<typeof annotationOriginSchema>;

export const annotationKindSchema = z.enum(['note', 'reference', 'summary', 'tag']);
export type AnnotationKind = z.infer<typeof annotationKindSchema>;

export const referenceKindSchema = z.enum(['pdf', 'url']);
export type ReferenceKind = z.infer<typeof referenceKindSchema>;
