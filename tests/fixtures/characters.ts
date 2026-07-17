export const e2eCharacter = {
	meta: {
		id: 'e2e-character',
		schemaVersion: 'char.v1',
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
		classes: []
	}
};

export const e2eStoredCharacters = {
	version: 1,
	characters: [e2eCharacter]
};
