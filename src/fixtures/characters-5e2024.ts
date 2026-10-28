import { create5e2024Character } from '../schema/system-5e2024';

const fixtureTime = '2026-10-16T00:00:00.000Z';
const dependencies = (id: string) => ({ createId: () => id, nowIso: () => fixtureTime });

export const representativeCharacter5e2024 = create5e2024Character(
	{
		name: 'Mira — 2024 Representative',
		systemData: {
			identity: {
				species: 'Human',
				background: 'Sage',
				appearance: 'Ink-stained hands and a blue traveling cloak.'
			},
			classes: [
				{
					id: 'mira-wizard',
					name: 'Wizard',
					level: 4,
					subclass: 'Evoker',
					detail: 'Manually authored example, not a validated build.'
				}
			],
			combat: {
				hitPoints: { current: 22, max: 28, temp: 0 },
				armorClass: 14,
				initiative: 2,
				hitDice: '4d6',
				heroicInspiration: true,
				size: 'Medium',
				passivePerception: 12,
				movement: { walk: 30 },
				deathSaves: { successes: 0, failures: 0 }
			},
			abilities: {
				str: { score: 10, modifier: 0 },
				dex: { score: 14, modifier: 2 },
				con: { score: 14, modifier: 2 },
				int: { score: 18, modifier: 4 },
				wis: { score: 12, modifier: 1 },
				cha: { score: 10, modifier: 0 }
			},
			proficiencyBonus: 2,
			saves: { int: { proficient: true, bonus: 6 }, wis: { proficient: true, bonus: 3 } },
			skills: { arcana: { proficient: true, bonus: 6 }, history: { proficient: true, bonus: 6 } },
			training: { weapons: 'Daggers, quarterstaffs' },
			languages: [
				{ id: 'mira-common', name: 'Common' },
				{ id: 'mira-elvish', name: 'Elvish' }
			],
			tools: [{ id: 'mira-calligraphy', name: "Calligrapher's Supplies" }],
			features: [
				{
					id: 'mira-feature',
					name: 'Archive recall',
					context: 'Table feature',
					detail: 'Remember a useful detail about an archive visited before.'
				}
			],
			traits: [
				{
					id: 'mira-trait',
					name: 'Curious',
					context: 'Personal trait',
					detail: 'Always asks one more question.'
				}
			],
			feats: [
				{
					id: 'mira-feat',
					name: 'Scholar',
					context: 'Authored example',
					detail: 'Discuss the exact benefit with the table.'
				}
			],
			currency: { cp: 5, sp: 12, gp: 37 },
			roleplay: {
				personality: 'Writes down every new name.',
				ideals: 'Knowledge should be shared.',
				bonds: 'The city archive.',
				flaws: 'Cannot resist a sealed door.',
				backstory: 'Left the archive to locate a missing volume.'
			},
			spellcasting: {
				ability: 'int',
				saveDC: 14,
				attackBonus: 6,
				slots: { '1': { used: 1, max: 4 }, '2': { used: 0, max: 3 } }
			},
			spells: [
				{
					id: 'mira-light',
					name: 'Light',
					level: 0,
					prepared: true,
					detail: 'A useful light for reading.'
				},
				{
					id: 'mira-shield',
					name: 'Shield',
					level: 1,
					prepared: true,
					detail: 'Consult the spell text for the reaction trigger and duration.'
				}
			],
			fieldNotes: {
				'/systemData/identity/species': [
					{
						id: 'mira-species-reference',
						origin: 'source',
						kind: 'reference',
						name: 'Character species',
						ref: {
							sourceId: 'dnd5e-2024.srd-5-2-1',
							kind: 'pdf',
							locator: { page: 83, url: '/docs/ext/5e2024/SRD_CC_v5.2.1.pdf' }
						}
					}
				]
			},
			inventory: [
				{
					id: 'mira-staff',
					name: 'Quarterstaff',
					category: 'weapons',
					quantity: 1,
					equipped: true,
					detail: 'Walking stick and reliable backup.'
				},
				{ id: 'mira-armor', name: 'Leather armor', category: 'armorShields', equipped: true },
				{
					id: 'mira-pack',
					name: 'Travel pack',
					category: 'other',
					quantity: 1,
					annotations: [
						{
							id: 'mira-pack-note',
							kind: 'note',
							origin: 'user',
							text: 'The map is in the outer pocket.'
						}
					]
				}
			],
			runtimeActions: [
				{
					id: 'mira-strike',
					source: { kind: 'item', id: 'mira-staff' },
					name: 'Quarterstaff strike',
					timing: 'action',
					detail: 'Authored example: +4 to hit; 1d6 + 2 bludgeoning.'
				},
				{
					id: 'mira-assist',
					name: 'Help an ally',
					timing: 'action',
					detail: 'Describe how I help.'
				},
				{
					id: 'mira-escape',
					name: 'Quick escape',
					timing: 'bonusAction',
					detail: 'Example ability granted by our table; track its limits manually.'
				},
				{
					id: 'mira-retaliate',
					name: 'Opportunity Attack',
					timing: 'reaction',
					detail: 'Check the trigger before using my Reaction.'
				}
			],
			notes: [
				{ id: 'mira-note', title: 'Next session', body: 'Ask the archivist about the sealed door.' }
			],
			collectionPins: { inventory: ['mira-pack'], runtimeActions: ['mira-retaliate'] }
		}
	},
	dependencies('char-5e-2024-representative')
);

export const sparseCharacter5e2024 = create5e2024Character(
	{
		name: 'Pip — 2024 Sparse',
		systemData: {
			combat: { hitPoints: { current: 8 }, armorClass: 12 },
			runtimeActions: [
				{
					id: 'pip-action',
					name: 'Spear thrust',
					timing: 'action',
					detail: 'Authored example: +3 to hit, 1d6 + 1 piercing.'
				}
			],
			notes: [{ id: 'pip-note', body: 'Guide the party to the old bridge.' }]
		}
	},
	dependencies('char-5e-2024-sparse')
);

export const saturatedCharacter5e2024 = create5e2024Character(
	{
		name: '2024 Saturated Adventurer',
		systemData: {
			...representativeCharacter5e2024.systemData,
			identity: {
				...representativeCharacter5e2024.systemData.identity,
				name: '2024 Saturated Adventurer'
			},
			features: Array.from({ length: 18 }, (_, index) => ({
				id: `dense-feature-${index}`,
				name: `Practice feature ${index + 1}`,
				context: index % 2 ? 'Class' : 'General',
				detail: 'Authored stress fixture; no rules automation.'
			})),
			spells: Array.from({ length: 40 }, (_, index) => ({
				id: `dense-spell-${index}`,
				name: `Practice spell ${index + 1}`,
				level: index % 10,
				prepared: index % 3 === 0,
				detail: 'Authored spell for retrieval and editing checks.'
			})),
			inventory: [
				...representativeCharacter5e2024.systemData.inventory,
				...Array.from({ length: 15 }, (_, index) => ({
					id: `dense-item-${index}`,
					name: `Expedition item ${index + 1}`,
					category: 'other' as const,
					quantity: index + 1
				}))
			],
			collectionPins: {
				...representativeCharacter5e2024.systemData.collectionPins,
				features: ['dense-feature-15'],
				spells: ['dense-spell-27']
			}
		}
	},
	dependencies('char-5e-2024-saturated')
);
