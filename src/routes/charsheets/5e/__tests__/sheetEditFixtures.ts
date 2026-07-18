import { create5e2014Character, type CharacterDocument5e2014 } from '../../../../schema';

export const createSheetEditCharacter = (): CharacterDocument5e2014 =>
	create5e2014Character({
		name: 'Edit Tester',
		meta: { id: 'edit-tester' },
		identity: { ancestryLineage: 'Elf', background: 'Sage' },
		inventory: [
			{
				id: 'weapon-1',
				name: 'Longsword',
				tags: ['inventory:weapon'],
				equipped: true,
				annotations: [{ id: 'weapon-note', origin: 'user', kind: 'note', text: 'Silvered' }]
			},
			{ id: 'gear-1', name: 'Rope', quantity: 1 },
			{ id: 'gp-1', name: 'GP', quantity: 5, tags: ['inventory:currency:gp'] }
		],
		notes: [
			{
				id: 'motives-1',
				title: 'Motives',
				body: 'Old motive',
				kind: 'lore',
				annotations: [{ id: 'motive-note', origin: 'user', kind: 'note', text: 'Secret' }]
			},
			{ id: 'scratch-1', title: 'Scratch', body: 'Old scratch', kind: 'quick' }
		],
		systemData: {
			race: { name: 'Elf', languages: ['Common'] },
			background: { name: 'Sage', proficiencies: { languages: ['Draconic'] } },
			classes: [
				{
					name: 'Fighter',
					level: 1,
					features: [
						{
							name: 'Second Wind',
							featureId: 'second-wind',
							annotations: [
								{ id: 'feature-note', origin: 'source', kind: 'summary', text: 'Recover HP' }
							]
						}
					]
				}
			],
			runtimeActions: [
				{
					id: 'action-1',
					name: 'Longsword',
					timing: 'action',
					category: 'attack',
					annotations: [{ id: 'action-note', origin: 'user', kind: 'note', text: 'Reach 5 ft.' }]
				}
			],
			spellcasting: {
				ability: 'int',
				slots: { '1': { max: 2, used: 0 } },
				spells: [
					{ spellId: 'fire-bolt', name: 'Fire Bolt', level: 0 },
					{ spellId: 'shield', name: 'Shield', level: 1, prepared: true }
				]
			}
		}
	});
