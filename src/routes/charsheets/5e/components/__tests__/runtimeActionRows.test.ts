import { describe, expect, it } from 'vitest';
import { create5e2014Character } from '../../../../../schema';
import { projectRuntimeActionRows } from '../runtimeActionRows';

describe('runtime action row projection', () => {
	it('projects playable summaries, authored notes, and resolved item sources', () => {
		const character = create5e2014Character({
			inventory: [{ id: 'longsword-item', name: 'Longsword' }]
		});
		expect(
			projectRuntimeActionRows(
				[
					{
						id: 'longsword-action',
						name: 'Longsword attack',
						timing: 'bonusAction',
						category: 'attack',
						target: ' One creature ',
						notes: ' Player-authored strike note. ',
						source: { kind: 'item', id: 'longsword-item' }
					}
				],
				character
			)
		).toEqual([
			{
				id: 'longsword-action',
				name: 'Longsword attack',
				timingLabel: 'Bonus action',
				categoryLabel: 'Attack',
				sourceCategoryLabel: 'Inventory',
				target: 'One creature',
				notes: 'Player-authored strike note.',
				source: {
					reference: { kind: 'item', id: 'longsword-item' },
					label: 'Inventory · Longsword',
					context: 'Weapons',
					destination: { kind: 'inventory', group: 'weapons' }
				}
			}
		]);
	});

	it('uses summary defaults and pronounces an unlinked action as custom', () => {
		expect(
			projectRuntimeActionRows(
				[
					{
						id: 'custom-action',
						name: 'Improvise',
						target: ' ',
						notes: '\n'
					}
				],
				create5e2014Character()
			)
		).toEqual([
			{
				id: 'custom-action',
				name: 'Improvise',
				timingLabel: 'Action',
				categoryLabel: 'Attack',
				sourceCategoryLabel: 'Custom'
			}
		]);
	});

	it('projects one durable source-category label for every linked source kind', () => {
		const character = create5e2014Character({
			features: [{ id: 'feature-1', name: 'Second Wind' }],
			inventory: [{ id: 'item-1', name: 'Longsword' }],
			systemData: {
				race: {
					name: 'Elf',
					traits: [{ featureId: 'trait-1', name: 'Darkvision' }]
				},
				spellcasting: {
					ability: 'int',
					spells: [{ spellId: 'spell-1', name: 'Shield', level: 1 }]
				}
			}
		});

		const rows = projectRuntimeActionRows(
			[
				{
					id: 'item-action',
					name: 'Attack',
					source: { kind: 'item', id: 'item-1' }
				},
				{
					id: 'spell-action',
					name: 'Cast Shield',
					source: { kind: 'spell', id: 'spell-1' }
				},
				{
					id: 'feature-action',
					name: 'Second Wind',
					source: { kind: 'feature', id: 'feature-1' }
				},
				{
					id: 'trait-action',
					name: 'Darkvision',
					source: { kind: 'feature', id: 'trait-1' }
				}
			],
			character
		);

		expect(rows.map((row) => row.sourceCategoryLabel)).toEqual([
			'Inventory',
			'Spell',
			'Feature',
			'Trait'
		]);
	});
});
