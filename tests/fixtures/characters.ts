export const e2eCharacter = {
	meta: {
		id: 'e2e-character',
		schemaVersion: 'dnd5e-2014.schema.v0',
		createdAt: '2026-07-17T00:00:00.000Z',
		updatedAt: '2026-07-17T00:00:00.000Z'
	},
	system: {
		id: 'dnd5e-2014',
		version: 'SRD-5.1-2023',
		source: 'local',
		annotations: []
	},
	identity: { name: 'E2E Test Adventurer' },
	features: [],
	inventory: [
		{
			id: 'e2e-seed-longsword',
			name: 'Longsword',
			notes: 'Seeded item detail.',
			tags: ['inventory:weapon'],
			equipped: true
		}
	],
	notes: [],
	systemData: {
		level: 0,
		proficiencyBonus: 0,
		abilities: {
			str: { score: 10, mod: 0 },
			dex: { score: 10, mod: 0 },
			con: { score: 10, mod: 0 },
			int: { score: 10, mod: 0 },
			wis: { score: 10, mod: 0 },
			cha: { score: 10, mod: 0 }
		},
		saves: {},
		skills: {},
		combat: {
			armorClass: 10,
			hitPoints: { max: 17, current: 17, temp: 0 },
			deathSaves: { successes: 0, failures: 0 }
		},
		classes: [],
		runtimeActions: [
			{
				id: 'e2e-seed-linked-action',
				name: 'Longsword attack',
				timing: 'action',
				category: 'attack',
				target: 'one creature within 5 ft',
				notes: 'Seeded item detail.',
				source: { kind: 'item', id: 'e2e-seed-longsword' }
			},
			{
				id: 'e2e-seed-custom-action',
				name: 'Improvise',
				timing: 'bonusAction',
				category: 'effect',
				notes: 'A completely custom runtime action.'
			}
		],
		currency: {},
		roleplay: {},
		proficiencies: { languages: [], tools: [] }
	}
};

export const e2eStoredCharacters = {
	version: 1,
	characters: [e2eCharacter]
};

export const e2eRuntimeActionLinkCharacter = {
	...e2eCharacter,
	meta: {
		...e2eCharacter.meta,
		id: 'e2e-runtime-action-link'
	},
	identity: { name: 'E2E Runtime Action Link' },
	features: [
		{
			id: 'e2e-general-shield',
			name: 'Shield',
			summary: 'A general feature with a duplicate name.'
		}
	],
	inventory: [
		{
			id: 'e2e-longsword',
			name: 'Longsword',
			notes: 'Original item notes.',
			tags: ['inventory:weapon'],
			equipped: true
		},
		{
			id: 'e2e-rope',
			name: 'Rope',
			notes: '50 feet of hempen rope.',
			tags: ['inventory:gear'],
			equipped: false
		}
	],
	systemData: {
		...e2eCharacter.systemData,
		race: {
			name: 'Elf',
			traits: [{ featureId: 'e2e-darkvision', name: 'Darkvision' }]
		},
		classes: [
			{
				name: 'Wizard',
				level: 2,
				features: [{ featureId: 'e2e-arcane-recovery', name: 'Arcane Recovery' }]
			}
		],
		spellcasting: {
			ability: 'int',
			spells: [
				{
					spellId: 'e2e-shield-spell',
					name: 'Shield',
					level: 1,
					prepared: true,
					notes: '+5 AC until your next turn.'
				},
				{ spellId: 'e2e-fire-bolt', name: 'Fire Bolt', level: 0 }
			]
		},
		runtimeActions: []
	}
};

export const e2eRuntimeActionLinkStoredCharacters = {
	version: 1,
	characters: [e2eRuntimeActionLinkCharacter]
};

export const e2eOutdatedStoredCharacters = {
	version: 1,
	characters: [
		{
			...e2eCharacter,
			meta: {
				...e2eCharacter.meta,
				id: 'e2e-outdated-character',
				schemaVersion: 'dnd5e-2014.v3'
			}
		}
	]
};
