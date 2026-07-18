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
			{ id: 'gear-1', name: 'Rope', quantity: 1 }
		],
		notes: [{ id: 'scratch-1', title: 'Scratch', body: 'Old scratch', kind: 'quick' }],
		systemData: {
			race: { name: 'Elf' },
			background: { name: 'Sage' },
			currency: { gp: { amount: 5 } },
			roleplay: {
				motives: {
					body: 'Old motive',
					annotations: [{ id: 'motive-note', origin: 'user', kind: 'note', text: 'Secret' }]
				}
			},
			proficiencies: {
				languages: [
					{ name: 'Common', source: { kind: 'ancestry' } },
					{ name: 'Draconic', source: { kind: 'background' } }
				],
				tools: [
					{
						name: 'Calligrapher supplies',
						source: { kind: 'background', sourceId: 'sage' },
						annotations: [
							{ id: 'tool-note', origin: 'user', kind: 'note', text: 'From background' }
						]
					}
				]
			},
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
