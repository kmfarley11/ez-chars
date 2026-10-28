import { abilityKeys2024, skillAbilities2024 } from '../../../schema/fields-5e2024';
import type { GridContentData } from '$lib/utils/gridContentTypes';
import type { SheetEditSession } from './editing/sheet-edit-session';
import { abilityLabels, sheetFields, titleCase } from './sheet-fields';
import { proficiencyStatus } from './proficiency-level';

// Only layout/grouping lives here; bindings and writes belong to the edition's session.
export const projectSheet = (session: SheetEditSession) => {
	const pair = (title: string, keys: string[]): GridContentData => ({
		pair: {
			fieldName: title,
			bindPath: sheetFields.find((field) => field.key === keys[0])?.path.slice(0, -1),
			value: Object.fromEntries(
				Object.entries(session.project(keys)).map(([key, field]) => [
					key,
					{ ...field, label: field.fieldName }
				])
			)
		}
	});
	const reference = session.project([
		'maxHp',
		'armorClass',
		'initiative',
		'hitDice',
		'size',
		'passivePerception',
		...['walk', 'climb', 'swim', 'fly', 'burrow'].map((key) => `movement.${key}`)
	]);
	for (const [key, field] of Object.entries(reference))
		if (key.startsWith('movement.')) field.label = 'ft.';
	return {
		identity: session.project(['name']),
		origin: session.project(['species', 'background']),
		appearance: session.project(['alignment', 'appearance']),
		live: session.project([
			'currentHp',
			'tempHp',
			'deathSaves.successes',
			'deathSaves.failures',
			'heroicInspiration',
			'conditions'
		]),
		reference,
		proficiency: session.project(['proficiencyBonus']),
		training: session.project(['training.armor', 'training.weapons']),
		abilities: abilityKeys2024.map((ability) => ({
			key: ability,
			title: abilityLabels[ability],
			data: {
				...pair(ability.toUpperCase(), [
					`abilities.${ability}.score`,
					`abilities.${ability}.modifier`
				]),
				...Object.fromEntries(
					[
						[`saves.${ability}`, 'Save'],
						...Object.entries(skillAbilities2024)
							.filter(([, key]) => key === ability)
							.map(([key]) => [`skills.${key}`, titleCase(key)])
					].map(([key, label]) => {
						const fields = session.project([
							`${key}.proficient`,
							`${key}.expertise`,
							`${key}.bonus`
						]);
						const booleanValue = (leaf: string) =>
							typeof fields[`${key}.${leaf}`].value === 'boolean'
								? (fields[`${key}.${leaf}`].value as boolean)
								: undefined;
						return [
							key,
							{
								fieldName: label,
								displayStatus: proficiencyStatus(
									{
										proficient: booleanValue('proficient'),
										expertise: booleanValue('expertise')
									},
									key.startsWith('skills.')
								),
								bindPath: ['systemData', ...key.split('.'), 'proficient'],
								value: Object.fromEntries(
									Object.entries(fields).map(([path, field]) => [
										path,
										{ ...field, label: field.fieldName }
									])
								)
							}
						];
					})
				)
			} satisfies GridContentData
		})),
		casting: session.project([
			'spellcasting.ability',
			'spellcasting.saveDC',
			'spellcasting.attackBonus'
		]),
		slots: Array.from({ length: 9 }, (_, index) => ({
			level: index + 1,
			data: pair(`Level ${index + 1}`, [`slots.${index + 1}.used`, `slots.${index + 1}.max`])
		})),
		currency: session.project([
			'currency.cp',
			'currency.sp',
			'currency.ep',
			'currency.gp',
			'currency.pp'
		]),
		roleplay: [
			session.project(['roleplay.personality', 'roleplay.ideals']),
			session.project(['roleplay.bonds', 'roleplay.flaws']),
			session.project(['roleplay.backstory'])
		]
	};
};
