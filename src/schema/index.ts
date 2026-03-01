// =======================================================
// Discriminated union helper for app code
// =======================================================
import { z } from 'zod';
import { characterDocumentCoreSchema } from './zod';
import { characterDocument5e2014Schema } from './system.5e2014';

export * from './core';
export * from './system.5e2014';
export * from './zod';

export type CharacterDocument5e2014 = z.infer<typeof characterDocument5e2014Schema>;
export type CharacterDocumentUnknown = z.infer<typeof characterDocumentCoreSchema>;

export type CharacterWithSystemData = CharacterDocument5e2014 | CharacterDocumentUnknown;
