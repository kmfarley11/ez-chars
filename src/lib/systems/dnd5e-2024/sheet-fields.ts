import {
	abilityKeys2024,
	skillAbilities2024,
	featureKinds2024,
	type RecordKind2024
} from '../../../schema/fields-5e2024';
import type { GridContentBindPath } from '$lib/utils/gridContentTypes';
import type { SmallEditField } from '$lib/utils/smallEdit';

export const inventoryCategories = {
	weapons: 'Weapons',
	armorShields: 'Armor & Shields',
	other: 'Other Gear'
} as const;
export const actionTimings = {
	action: 'Action',
	bonusAction: 'Bonus Action',
	reaction: 'Reaction',
	free: 'Free',
	other: 'Other'
} as const;
export const abilityLabels = {
	str: 'Strength',
	dex: 'Dexterity',
	con: 'Constitution',
	int: 'Intelligence',
	wis: 'Wisdom',
	cha: 'Charisma'
} as const;
export const titleCase = (key: string) =>
	key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
export type FieldDefinition = {
	key: string;
	label: string;
	kind: SmallEditField['kind'];
	choices?: Record<string, string>;
	required?: boolean;
};
export type SheetFieldDefinition = FieldDefinition & {
	path: GridContentBindPath;
	runtime?: boolean;
	detailLabel?: string;
};
const field = (
	key: string,
	label: string,
	kind: SmallEditField['kind'],
	path: string[],
	runtime = false
): SheetFieldDefinition => ({ key, label, kind, path: ['systemData', ...path], runtime });
export const sheetFields: readonly SheetFieldDefinition[] = [
	...['name', 'species', 'background', 'alignment', 'appearance'].map((key) =>
		field(key, titleCase(key), key === 'appearance' ? 'multiline' : 'text', ['identity', key])
	),
	...(['current', 'temp', 'max'] as const).map((key) =>
		field(`${key}Hp`, `${titleCase(key)} HP`, 'number', ['combat', 'hitPoints', key], key !== 'max')
	),
	field('armorClass', 'Armor Class', 'number', ['combat', 'armorClass']),
	field('initiative', 'Initiative', 'number', ['combat', 'initiative']),
	field('hitDice', 'Hit Dice', 'text', ['combat', 'hitDice']),
	field('heroicInspiration', 'Heroic Inspiration', 'boolean', ['combat', 'heroicInspiration']),
	field('conditions', 'Conditions', 'multiline', ['combat', 'conditions']),
	field('size', 'Size', 'text', ['combat', 'size']),
	field('passivePerception', 'Passive Perception', 'number', ['combat', 'passivePerception']),
	...['successes', 'failures'].map((key) =>
		field(
			`deathSaves.${key}`,
			`Death Saves ${titleCase(key)}`,
			'number',
			['combat', 'deathSaves', key],
			true
		)
	),
	...['walk', 'climb', 'swim', 'fly', 'burrow'].map((key) =>
		field(`movement.${key}`, titleCase(key), 'number', ['combat', 'movement', key])
	),
	...abilityKeys2024.flatMap((key) =>
		['score', 'modifier'].map((leaf) =>
			field(`abilities.${key}.${leaf}`, titleCase(leaf), 'number', ['abilities', key, leaf])
		)
	),
	...(['saves', 'skills'] as const).flatMap((group) =>
		(group === 'saves' ? abilityKeys2024 : Object.keys(skillAbilities2024)).flatMap((key) =>
			['proficient', 'expertise', 'bonus'].map((leaf) => ({
				...field(
					`${group}.${key}.${leaf}`,
					titleCase(leaf),
					leaf === 'bonus' ? 'number' : 'boolean',
					[group, key, leaf]
				),
				detailLabel: `${group === 'saves' ? `${abilityLabels[key as keyof typeof abilityLabels]} Save` : titleCase(key)}: ${titleCase(leaf)}`
			}))
		)
	),
	field('proficiencyBonus', 'Prof. Bonus', 'number', ['proficiencyBonus']),
	...['armor', 'weapons'].map((key) =>
		field(`training.${key}`, `${titleCase(key)} Training`, 'text', ['training', key])
	),
	...['cp', 'sp', 'ep', 'gp', 'pp'].map((key) =>
		field(`currency.${key}`, key.toUpperCase(), 'number', ['currency', key], true)
	),
	...['personality', 'ideals', 'bonds', 'flaws', 'backstory'].map((key) =>
		field(`roleplay.${key}`, titleCase(key), 'multiline', ['roleplay', key])
	),
	{
		...field('spellcasting.ability', 'Ability', 'select', ['spellcasting', 'ability']),
		choices: abilityLabels
	},
	field('spellcasting.saveDC', 'Save DC', 'number', ['spellcasting', 'saveDC']),
	field('spellcasting.attackBonus', 'Attack Bonus', 'number', ['spellcasting', 'attackBonus']),
	...Array.from({ length: 9 }, (_, i) => String(i + 1)).flatMap((level) =>
		['used', 'max'].map((key) =>
			field(`slots.${level}.${key}`, titleCase(key), 'number', [
				'spellcasting',
				'slots',
				level,
				key
			])
		)
	)
];

const name: FieldDefinition = { key: 'name', label: 'Name', kind: 'text', required: true };
const detail: FieldDefinition = { key: 'detail', label: 'Description', kind: 'multiline' };
// One edition-owned definition feeds creation and independent Detail edits.
export const recordFields = (kind: RecordKind2024): FieldDefinition[] => {
	if (kind === 'notes')
		return [
			{ key: 'title', label: 'Title', kind: 'text' },
			{ key: 'body', label: 'Note', kind: 'multiline', required: true }
		];
	const extra: FieldDefinition[] =
		kind === 'inventory'
			? [
					{
						key: 'category',
						label: 'Category',
						kind: 'select',
						required: true,
						choices: inventoryCategories
					},
					{ key: 'quantity', label: 'Quantity', kind: 'number' },
					{ key: 'equipped', label: 'Equipped', kind: 'boolean' }
				]
			: kind === 'runtimeActions'
				? [{ key: 'timing', label: 'Timing', kind: 'select', choices: actionTimings }]
				: kind === 'classes'
					? [
							{ key: 'level', label: 'Level', kind: 'number' },
							{ key: 'subclass', label: 'Subclass', kind: 'text' }
						]
					: kind === 'spells'
						? [
								{ key: 'level', label: 'Level', kind: 'number', required: true },
								{ key: 'prepared', label: 'Prepared', kind: 'boolean' }
							]
						: featureKinds2024.some((entry) => entry === kind)
							? [{ key: 'context', label: 'Source / Context', kind: 'text' }]
							: [];
	return [name, ...extra, detail];
};
