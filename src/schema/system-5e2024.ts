import { z } from 'zod';
import { defaultCharacterFactoryDependencies, type CharacterFactoryDependencies } from './helpers';
import { characterDocument5e2024Schema, dnd5e2024SystemDataSchema } from './zod/system-5e2024';
import {
	CHARACTER_DATA_VERSION_5E2024,
	RULES_VERSION_5E2024,
	SYSTEM_ID_5E2024
} from './versions-5e2024';

export type CharacterDocument5e2024 = z.infer<typeof characterDocument5e2024Schema>;
export type Dnd5e2024SystemData = CharacterDocument5e2024['systemData'];

const createOptionsSchema = z
	.object({
		name: z.string().min(1).optional(),
		meta: characterDocument5e2024Schema.shape.meta.partial().optional(),
		systemData: dnd5e2024SystemDataSchema.partial().optional()
	})
	.strict();
export type Create5e2024CharacterOptions = z.input<typeof createOptionsSchema>;

export const create5e2024Character = (
	input: Create5e2024CharacterOptions = {},
	dependencies: CharacterFactoryDependencies = defaultCharacterFactoryDependencies
): CharacterDocument5e2024 => {
	const options = createOptionsSchema.parse(input);
	const timestamp = options.meta?.createdAt ?? dependencies.nowIso();
	return characterDocument5e2024Schema.parse({
		meta: {
			id: options.meta?.id ?? dependencies.createId(),
			schemaVersion: CHARACTER_DATA_VERSION_5E2024,
			createdAt: timestamp,
			updatedAt: options.meta?.updatedAt ?? timestamp
		},
		system: { id: SYSTEM_ID_5E2024, version: RULES_VERSION_5E2024 },
		systemData: {
			inventory: [],
			runtimeActions: [],
			notes: [],
			...options.systemData,
			identity: { ...(options.name ? { name: options.name } : {}), ...options.systemData?.identity }
		}
	});
};

export const safeParse5e2024CharacterDocument = (input: unknown) =>
	characterDocument5e2024Schema.safeParse(input);
export const serialize5e2024CharacterDocument = (
	input: CharacterDocument5e2024
): CharacterDocument5e2024 => characterDocument5e2024Schema.parse(input);
