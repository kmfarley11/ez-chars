import type { GridAnnotationEditorConfig, GridContentBindPath } from '$utils/gridContentTypes';
export {
	getInventoryGroupForItem,
	withInventoryGroupTags,
	type InventoryGroup
} from '$lib/dnd5e2014/inventory';
import {
	DND_BEYOND_BASIC_RULES_REF_5E_2014,
	SRD_REF_5E_2014,
	type AbilityKey,
	type CurrencyDenomination as CharacterCurrencyDenomination,
	type Dnd5eSkillName,
	type ProficiencySourceKind,
	type RoleplayFieldKey as CharacterRoleplayFieldKey,
	type SpellLevel
} from '../../../schema';

export type SpellListLevel = SpellLevel;
export type ProficiencyEditorSource = ProficiencySourceKind;
export type CurrencyDenomination = CharacterCurrencyDenomination;

export const abilityMetadata: Array<{ key: AbilityKey; label: string; shortLabel: string }> = [
	{ key: 'str', label: 'Strength', shortLabel: 'STR' },
	{ key: 'dex', label: 'Dexterity', shortLabel: 'DEX' },
	{ key: 'con', label: 'Constitution', shortLabel: 'CON' },
	{ key: 'wis', label: 'Wisdom', shortLabel: 'WIS' },
	{ key: 'int', label: 'Intelligence', shortLabel: 'INT' },
	{ key: 'cha', label: 'Charisma', shortLabel: 'CHA' }
];

export const skillMetadata: Array<{ name: Dnd5eSkillName; abilityKey: AbilityKey }> = [
	{ name: 'Acrobatics', abilityKey: 'dex' },
	{ name: 'Animal Handling', abilityKey: 'wis' },
	{ name: 'Arcana', abilityKey: 'int' },
	{ name: 'Athletics', abilityKey: 'str' },
	{ name: 'Deception', abilityKey: 'cha' },
	{ name: 'History', abilityKey: 'int' },
	{ name: 'Insight', abilityKey: 'wis' },
	{ name: 'Intimidation', abilityKey: 'cha' },
	{ name: 'Investigation', abilityKey: 'int' },
	{ name: 'Medicine', abilityKey: 'wis' },
	{ name: 'Nature', abilityKey: 'int' },
	{ name: 'Perception', abilityKey: 'wis' },
	{ name: 'Performance', abilityKey: 'cha' },
	{ name: 'Persuasion', abilityKey: 'cha' },
	{ name: 'Religion', abilityKey: 'int' },
	{ name: 'Sleight of Hand', abilityKey: 'dex' },
	{ name: 'Stealth', abilityKey: 'dex' },
	{ name: 'Survival', abilityKey: 'wis' }
];

export type SpellSlotLevelKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export const spellSlotLevelMetadata: Array<{
	key: SpellSlotLevelKey;
	label: string;
}> = [
	{ key: '1', label: '1st' },
	{ key: '2', label: '2nd' },
	{ key: '3', label: '3rd' },
	{ key: '4', label: '4th' },
	{ key: '5', label: '5th' },
	{ key: '6', label: '6th' },
	{ key: '7', label: '7th' },
	{ key: '8', label: '8th' },
	{ key: '9', label: '9th' }
];

export const isSpellSlotLevelKey = (value: unknown): value is SpellSlotLevelKey =>
	typeof value === 'string' && spellSlotLevelMetadata.some(({ key }) => key === value);

export const spellListLevelPathPrefix = '__spellLevelList';
export const runtimeActionListPathPrefix = '__runtimeActions';
export const proficiencyLanguagesPathPrefix = '__proficiencyLanguages';
export const proficiencyToolsPathPrefix = '__proficiencyTools';
export const featureListPathPrefix = '__features';
export const traitListPathPrefix = '__traits';
export const inventoryListPathPrefix = '__inventory';
export const currencyPathPrefix = '__currency';
export const roleplayFieldPathPrefix = '__roleplayField';
export const scratchpadNotesPathPrefix = '__scratchpadNotes';

export const inventoryCurrencyMetadata: Array<{
	key: CurrencyDenomination;
	label: string;
}> = [
	{ key: 'pp', label: 'PP' },
	{ key: 'gp', label: 'GP' },
	{ key: 'ep', label: 'EP' },
	{ key: 'sp', label: 'SP' },
	{ key: 'cp', label: 'CP' }
];

export const roleplayFieldMetadata = [
	{ key: 'motives', title: 'Motives' },
	{ key: 'personalityTraits', title: 'Personality Traits' },
	{ key: 'ideals', title: 'Ideals' },
	{ key: 'bonds', title: 'Bonds' },
	{ key: 'flaws', title: 'Flaws' },
	{ key: 'otherBackgroundHistory', title: 'Other Background/History' },
	{ key: 'factionsOrgs', title: 'Factions & Orgs' },
	{ key: 'otherCharacterInfo', title: 'Other Character Info' }
] as const satisfies ReadonlyArray<{ key: CharacterRoleplayFieldKey; title: string }>;

export type RoleplayFieldKey = CharacterRoleplayFieldKey;

export const annotationEditorConfig: GridAnnotationEditorConfig = {
	defaultKind: 'note',
	defaultOrigin: 'user',
	referenceTemplates: [
		{
			key: 'srd-5e-2014',
			label: 'SRD 5.1 (local PDF)',
			reference: SRD_REF_5E_2014
		},
		{
			key: 'dnd-beyond-basic-rules-2014',
			label: 'D&D Beyond Basic Rules (2014)',
			reference: DND_BEYOND_BASIC_RULES_REF_5E_2014
		}
	]
};

export const toSystemDataAnnotationPath = (
	bindPath: GridContentBindPath
): GridContentBindPath | undefined => {
	if (bindPath.length === 0) return undefined;
	if (bindPath[0] === 'systemData') {
		return ['systemData', 'annotations', ...bindPath.slice(1), '_annotations'];
	}
	if (bindPath[0] === 'identity') {
		return ['systemData', 'annotations', 'identity', ...bindPath.slice(1), '_annotations'];
	}
	if (bindPath[0] === 'inventory' && typeof bindPath[1] === 'number') {
		return ['inventory', bindPath[1], 'annotations'];
	}
	return undefined;
};

export const isCurrencyDenomination = (value: string): value is CurrencyDenomination =>
	inventoryCurrencyMetadata.some((entry) => entry.key === value);
