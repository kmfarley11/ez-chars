import type { CharacterDocument5e2014, SpellLevel } from '../schema';

const longGearDetail =
	'Wrapped in oilcloth with chalk marks from the flooded lower halls of the XYZ dungeon; the description is intentionally long enough to exercise compact truncation.';

const otherGear = Array.from({ length: 32 }, (_, index) => ({
	id: `saturated-gear-${index + 1}`,
	name:
		index === 0
			? 'Rope'
			: index === 1
				? 'Bucket'
				: index === 2
					? 'Random rock'
					: index === 8
						? 'Rope'
						: `Campaign gear ${index + 1}`,
	quantity: index % 4 === 0 ? index + 1 : 1,
	notes: index === 2 ? longGearDetail : `Authored detail for campaign gear ${index + 1}.`,
	annotations:
		index === 2
			? [
					{
						id: 'saturated-rock-note',
						origin: 'user' as const,
						kind: 'note' as const,
						text: 'Ask the sage whether this is actually magical.'
					}
				]
			: undefined
}));

const weapons = Array.from({ length: 9 }, (_, index) => ({
	id: `saturated-weapon-${index + 1}`,
	name: index === 0 ? 'Longsword' : `Training sword ${index + 1}`,
	notes: index === 0 ? '+7 to hit; 1d8 + 4 slashing.' : `Weapon loadout note ${index + 1}.`,
	tags: ['inventory:weapon'],
	equipped: index < 2
}));

const armor = Array.from({ length: 7 }, (_, index) => ({
	id: `saturated-armor-${index + 1}`,
	name: index === 0 ? 'Shield' : `Armor set ${index + 1}`,
	notes: index === 0 ? '+2 AC while equipped.' : `Armor loadout note ${index + 1}.`,
	tags: ['inventory:armor-shield'],
	equipped: index === 0
}));

const spells = Array.from({ length: 28 }, (_, index) => {
	const level = (index % 5) as SpellLevel;
	return {
		spellId: `saturated-spell-${index + 1}`,
		name: index === 0 || index === 11 ? 'Shield' : `Practice spell ${index + 1}`,
		level,
		prepared: index % 3 === 0,
		notes:
			index === 11
				? 'A duplicate-name spell used to prove stable identity across search results.'
				: `Authored spell reminder ${index + 1}.`,
		annotations:
			index === 4
				? [
						{
							id: 'saturated-spell-note',
							origin: 'user' as const,
							kind: 'reference' as const,
							text: 'Review the area wording before play.'
						}
					]
				: undefined
	};
});

export const saturatedCharacter5e2014: CharacterDocument5e2014 = {
	meta: {
		id: 'char-5e-2014-saturated',
		schemaVersion: 'dnd5e-2014.schema.v0',
		createdAt: '2026-08-01T00:00:00.000Z',
		updatedAt: '2026-08-01T00:00:00.000Z'
	},
	system: {
		id: 'dnd5e-2014',
		version: 'SRD-5.1-2023',
		source: 'local'
	},
	identity: {
		name: 'Saturated Playtest Adventurer',
		playerName: 'Owner rehearsal',
		ancestryLineage: 'Elf',
		background: 'Sage',
		description:
			'A deliberately saturated character for repeatable collection and navigation review.'
	},
	features: Array.from({ length: 8 }, (_, index) => ({
		id: `saturated-feature-${index + 1}`,
		name: `General feature ${index + 1}`,
		summary: `Feature summary ${index + 1}.`
	})),
	inventory: [...weapons, ...armor, ...otherGear],
	notes: Array.from({ length: 10 }, (_, index) => ({
		id: `saturated-note-${index + 1}`,
		title: `Session note ${index + 1}`,
		body: `Campaign note body ${index + 1}.`,
		kind: index % 2 === 0 ? ('quick' as const) : ('session' as const)
	})),
	systemData: {
		level: 9,
		proficiencyBonus: 4,
		abilities: {
			str: { score: 10, mod: 0 },
			dex: { score: 14, mod: 2 },
			con: { score: 12, mod: 1 },
			int: { score: 18, mod: 4 },
			wis: { score: 13, mod: 1 },
			cha: { score: 8, mod: -1 }
		},
		saves: {},
		skills: {},
		combat: {
			armorClass: 16,
			hitPoints: { max: 54, current: 41, temp: 0 },
			deathSaves: { successes: 0, failures: 0 }
		},
		race: {
			name: 'Elf',
			traits: Array.from({ length: 7 }, (_, index) => ({
				featureId: `saturated-trait-${index + 1}`,
				name: `Ancestry trait ${index + 1}`
			}))
		},
		classes: [
			{
				name: 'Wizard',
				level: 9,
				features: Array.from({ length: 10 }, (_, index) => ({
					featureId: `saturated-class-feature-${index + 1}`,
					name: `Class feature ${index + 1}`
				})),
				spellcasting: { ability: 'int' }
			}
		],
		proficiencies: {
			languages: ['Common', 'Elvish', 'Draconic', 'Dwarvish', 'Gnomish'].map((name) => ({
				name,
				source: { kind: 'other' as const }
			})),
			tools: Array.from({ length: 7 }, (_, index) => ({
				name: `Tool proficiency ${index + 1}`,
				source: { kind: 'other' as const }
			}))
		},
		currency: { gp: { amount: 127 }, sp: { amount: 8 } },
		roleplay: {
			motives: { body: 'Keep the expedition alive long enough to recover the archive.' },
			personalityTraits: { body: 'Records observations before offering conclusions.' }
		},
		spellcasting: {
			ability: 'int',
			spellSaveDC: 16,
			spellAttackBonus: 8,
			slots: {
				'1': { max: 4, used: 1 },
				'2': { max: 3, used: 2 },
				'3': { max: 3, used: 0 },
				'4': { max: 3, used: 1 },
				'5': { max: 1, used: 0 }
			},
			spells
		},
		runtimeActions: [
			{
				id: 'saturated-linked-item-action',
				name: 'Longsword attack',
				timing: 'action',
				category: 'attack',
				notes: '+7 to hit; 1d8 + 4 slashing.',
				source: { kind: 'item', id: 'saturated-weapon-1' }
			},
			{
				id: 'saturated-linked-spell-action',
				name: 'Shield reaction',
				timing: 'reaction',
				category: 'effect',
				source: { kind: 'spell', id: 'saturated-spell-1' }
			},
			...Array.from({ length: 8 }, (_, index) => ({
				id: `saturated-custom-action-${index + 1}`,
				name: `Custom runtime action ${index + 1}`,
				timing: 'other' as const,
				category: 'other' as const,
				notes: `Runtime reminder ${index + 1}.`
			}))
		]
	}
};

export const saturatedStoredCharacters5e2014 = {
	version: 1 as const,
	characters: [saturatedCharacter5e2014]
};
