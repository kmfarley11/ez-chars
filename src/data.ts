import { writable, type Writable } from 'svelte/store';
import {
	type CharacterWithSystemData,
	type CharacterDocument5e2014,
	create5e2014Character
} from './schema';

export const emptyChar: CharacterDocument5e2014 = create5e2014Character();

const bryltin: CharacterDocument5e2014 = create5e2014Character({
	name: 'Bryltin Brewhammer',
	meta: {
		id: 'char-bryltin'
	},
	identity: {
		alignment: 'LG',
		ancestryLineage: 'hill dwarf'
	},
	systemData: {
		level: 8,
		proficiencyBonus: 2,
		race: { name: 'hill dwarf' },
		classes: [
			{
				name: 'warrior',
				level: 8
			}
		]
	}
});

const zindra: CharacterDocument5e2014 = create5e2014Character({
	name: 'Zindra Winterbow',
	meta: {
		id: 'char-zindra'
	},
	identity: {
		alignment: 'NG',
		ancestryLineage: 'wood elf'
	},
	systemData: {
		level: 8,
		proficiencyBonus: 2,
		race: { name: 'wood elf' },
		classes: [
			{
				name: 'expert',
				level: 8
			}
		]
	}
});

export let charsArray: Writable<CharacterWithSystemData[]> = writable<CharacterWithSystemData[]>([
	bryltin,
	zindra,
	create5e2014Character({
		meta: {
			id: 'char-001',
			schemaVersion: 'char.v1',
			createdAt: '2026-02-27T16:00:00Z',
			updatedAt: '2026-02-27T16:00:00Z'
		},
		identity: {
			name: 'Theren Vael',
			playerName: 'Kevin',
			ancestryLineage: 'Elf',
			alignment: 'Chaotic Good',
			description: 'Studious elven duelist blending steel and spell.'
		},
		features: [],
		inventory: [
			{
				id: 'item-1',
				name: 'Longsword',
				equipped: true
			},
			{
				id: 'item-2',
				name: 'Spellbook'
			}
		],
		notes: [
			{
				id: 'note-1',
				title: 'Tactics',
				body: 'Open with Shield if pressured. Stay midline.',
				kind: 'quick'
			}
		],
		systemData: {
			level: 2,
			proficiencyBonus: 2,

			abilities: {
				str: { score: 14, mod: 2 },
				dex: { score: 16, mod: 3 },
				con: { score: 13, mod: 1 },
				int: { score: 15, mod: 2 },
				wis: { score: 10, mod: 0 },
				cha: { score: 8, mod: -1 }
			},

			saves: {
				str: { proficient: true, bonus: 4 },
				con: { proficient: true, bonus: 3 },
				int: { proficient: true, bonus: 4 },
				wis: { proficient: true, bonus: 2 }
			},

			skills: {
				Athletics: { proficient: true, bonus: 4 },
				Arcana: { proficient: true, bonus: 4 },
				Perception: { proficient: true, bonus: 2 }
			},

			combat: {
				armorClass: 17,
				initiative: 3,
				speed: 30,
				hitPoints: {
					max: 17,
					current: 17
				},
				hitDice: {
					total: '1d10 + 1d6',
					remaining: '1d10 + 1d6'
				},
				senses: {
					passivePerception: 12,
					darkvision: 60
				}
			},

			race: {
				name: 'Elf',
				subrace: 'High Elf',
				size: 'Medium',
				speed: 30,
				languages: ['Common', 'Elvish'],
				traits: [{ name: 'Darkvision' }, { name: 'Fey Ancestry' }, { name: 'Trance' }]
			},

			background: {
				name: 'Sage',
				proficiencies: {
					skills: ['Arcana', 'History']
				}
			},

			classes: [
				{
					name: 'Fighter',
					level: 1,
					hitDie: 'd10',
					features: [{ name: 'Fighting Style (Defense)' }, { name: 'Second Wind' }]
				},
				{
					name: 'Wizard',
					level: 1,
					hitDie: 'd6',
					subclass: 'Evocation',
					features: [{ name: 'Spellcasting' }, { name: 'Arcane Recovery' }],
					spellcasting: {
						ability: 'int'
					}
				}
			],

			attacks: [
				{
					id: 'atk-1',
					name: 'Longsword',
					kind: 'melee',
					toHit: 5,
					reachOrRange: '5 ft',
					damage: '1d8+2 slashing'
				}
			],

			spellcasting: {
				ability: 'int',
				spellSaveDC: 12,
				spellAttackBonus: 4,
				slots: {
					'1': { max: 2, used: 0 }
				},
				spells: [
					{ name: 'Magic Missile', level: 1, prepared: true },
					{ name: 'Shield', level: 1, prepared: true },
					{ name: 'Fire Bolt', level: 0 }
				]
			}
		}
	}),
	create5e2014Character({
		meta: {
			id: 'char-002',
			schemaVersion: 'char.v1',
			createdAt: '2026-02-27T16:10:00Z',
			updatedAt: '2026-02-27T16:10:00Z'
		},
		identity: {
			name: 'Bram',
			playerName: 'DM',
			ancestryLineage: 'Human',
			description: 'Loyal caravan guard.'
		},
		features: [],
		inventory: [
			{
				id: 'item-1',
				name: 'Spear',
				equipped: true
			}
		],
		systemData: {
			level: 1,
			proficiencyBonus: 2,

			abilities: {
				str: { score: 15, mod: 2 },
				dex: { score: 12, mod: 1 },
				con: { score: 14, mod: 2 },
				int: { score: 8, mod: -1 },
				wis: { score: 10, mod: 0 },
				cha: { score: 9, mod: -1 }
			},

			saves: {},

			skills: {
				Athletics: { proficient: true, bonus: 4 }
			},

			combat: {
				armorClass: 15,
				initiative: 1,
				speed: 30,
				hitPoints: {
					max: 11,
					current: 11
				},
				hitDice: {
					total: '1d8',
					remaining: '1d8'
				}
			},

			race: {
				name: 'Human',
				size: 'Medium',
				speed: 30,
				languages: ['Common']
			},

			classes: [
				{
					name: 'Warrior (Sidekick)',
					level: 1,
					hitDie: 'd8',
					features: [{ name: 'Second Wind (Sidekick)' }]
				}
			],

			attacks: [
				{
					id: 'atk-1',
					name: 'Spear',
					kind: 'melee',
					toHit: 4,
					reachOrRange: '5 ft (20/60)',
					damage: '1d6+2 piercing'
				}
			]
		}
	})
]);
