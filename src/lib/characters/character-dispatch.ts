import {
	create5e2014Character,
	create5e2024Character,
	is5e2014Character,
	type CharacterWithSystemData
} from '../../schema';
import type { CharacterFactoryDependencies } from '../../schema/helpers';

export type SupportedSystemId = CharacterWithSystemData['system']['id'];

// Concrete application dispatch, not a universal game-system adapter/registry.
export const characterCreationChoices = [
	{ id: 'dnd5e-2014', label: 'Create New 2014 5e Character' },
	{ id: 'dnd5e-2024', label: 'Create New 2024 5e Character' }
] as const satisfies ReadonlyArray<{ id: SupportedSystemId; label: string }>;

export const createCharacterForSystem = (
	systemId: SupportedSystemId,
	dependencies?: CharacterFactoryDependencies
): CharacterWithSystemData => {
	switch (systemId) {
		case 'dnd5e-2014':
			return create5e2014Character({}, dependencies);
		case 'dnd5e-2024':
			return create5e2024Character({}, dependencies);
		default:
			throw new Error(`Unsupported character system: ${systemId satisfies never}`);
	}
};

export const characterSheetPath = (character: CharacterWithSystemData) =>
	is5e2014Character(character) ? ('/charsheets/5e' as const) : ('/charsheets/5e2024' as const);

export const findCharacterById = (
	characters: ReadonlyArray<CharacterWithSystemData>,
	id: string | null | undefined
): CharacterWithSystemData | undefined =>
	id?.trim() ? characters.find((character) => character.meta.id === id.trim()) : undefined;
