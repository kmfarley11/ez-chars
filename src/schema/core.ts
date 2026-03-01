// =======================================================
// Core: shared across systems
// =======================================================

export const SCHEMA_VER = '0.0.1';

export type Id = string; // uuid, nanoid, etc.

export interface CharacterDocument {
	meta: Meta;
	system: SystemRef;

	identity: Identity;

	/** System-agnostic buckets: safe for any RPG */
	features?: Feature[]; // generic “things your character can do”
	inventory?: Item[];
	notes?: NoteBlock[];

	/** Canonical system-specific data (e.g., 5e, Shadowdark) */
	systemData: unknown; // narrowed by SystemRef.id in app code (discriminated union)

	/** Optional top-level refs (campaign doc, SRD, house rules) */
	annotations?: Annotation[];
}

export interface Meta {
	id: Id;
	schemaVersion: string; // e.g. "char.v1"
	createdAt: string; // ISO
	updatedAt: string; // ISO
}

export interface SystemRef {
	/** Canonical system ID (stable key for discriminated union) */
	id: string; // e.g. "dnd5e-2014"
	/** Ruleset/SRD version label (not app version) */
	version?: string; // e.g. "SRD5.1"
	/** Optional: where the system definition came from */
	source?: 'local' | 'remote' | 'import';
	annotations?: Annotation[];
}

export interface Identity {
	name: string;
	playerName?: string;
	pronouns?: string;
	ancestryLineage?: string; // generic string (systemData holds canonical for systems that care)
	background?: string;
	alignment?: string;
	appearance?: string; // short
	description?: string; // longer
	tags?: string[];
	annotations?: Annotation[];
}

export interface NoteBlock {
	id: Id;
	title?: string;
	body: string; // markdown-ish or plain text
	kind?: 'quick' | 'session' | 'lore' | 'rules' | 'other';
	annotations?: Annotation[];
}

export interface Feature {
	id: Id;
	name: string;
	summary?: string;
	description?: string; // optional longform
	tags?: string[];
	annotations?: Annotation[];
}

export interface Item {
	id: Id;
	name: string;
	quantity?: number;
	weight?: number;
	value?: string; // "15 gp"
	equipped?: boolean;
	notes?: string;
	tags?: string[];
	annotations?: Annotation[];
}

// =======================================================
// Annotations + References (shared building blocks)
// =======================================================

export type AnnotationOrigin = 'user' | 'source';

/**
 * Keep "kind" small and stable. You can extend later without breaking old data.
 */
export type AnnotationKind = 'note' | 'reference' | 'summary' | 'tag';

export interface Annotation {
	id?: Id;
	origin: AnnotationOrigin;
	kind: AnnotationKind;

	/** For note/summary/tag */
	text?: string;

	/** For reference */
	ref?: Reference;

	/** Optional: external linking or grouping */
	tags?: string[];
}

export type ReferenceKind = 'pdf_page' | 'url' | 'external_id';

export interface Reference {
	sourceId: string; // e.g. "SRD5.1"
	kind: ReferenceKind;

	locator: {
		page?: number; // for pdf_page
		url?: string; // for url
		id?: string; // for external_id (e.g., open5e id)
		anchor?: string; // "#conditions-blinded"
		label?: string; // human-friendly
	};
}
