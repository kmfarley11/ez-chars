import { z } from 'zod';
import {
	annotationSchema,
	characterDocumentCoreSchema,
	featureSchema,
	identitySchema,
	itemSchema,
	metaSchema,
	noteBlockSchema,
	referenceSchema,
	systemRefSchema
} from './zod/core';

// =======================================================
// Core: shared across systems
// =======================================================

export const SCHEMA_VER = '0.0.1';

export type Id = string;

export type Meta = z.infer<typeof metaSchema>;
export type SystemRef = z.infer<typeof systemRefSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type NoteBlock = z.infer<typeof noteBlockSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type CharacterDocument = z.infer<typeof characterDocumentCoreSchema>;

export const annotationOriginSchema = z.enum(['user', 'source']);
export type AnnotationOrigin = z.infer<typeof annotationOriginSchema>;

export const annotationKindSchema = z.enum(['note', 'reference', 'summary', 'tag']);
export type AnnotationKind = z.infer<typeof annotationKindSchema>;

export const referenceKindSchema = z.enum(['pdf_page', 'url', 'external_id']);
export type ReferenceKind = z.infer<typeof referenceKindSchema>;
