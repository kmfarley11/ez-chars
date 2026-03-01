// =======================================================
// Discriminated union helper for app code
// =======================================================
import { type SystemRef, type CharacterDocument } from './core';
import { type Dnd5e2014SystemData, type SYSTEM_ID_5E2014 } from './system.5e2014';

export * from './core';
export * from './system.5e2014';

export type CharacterDocument5e2014 = CharacterDocument & {
	system: SystemRef & {
		id: SYSTEM_ID_5E2014;
	};
	systemData: Dnd5e2014SystemData;
};

export type CharacterDocumentUnknown = CharacterDocument & {
	system: SystemRef & {
		id: string;
	};
	systemData: unknown;
};

export type CharacterWithSystemData = CharacterDocument5e2014 | CharacterDocumentUnknown;
