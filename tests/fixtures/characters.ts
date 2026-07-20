export const e2eCharacter = {
	meta: {
		id: 'e2e-character',
		schemaVersion: 'dnd5e-2014.v3',
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
	inventory: [],
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
		runtimeActions: [],
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
	inventory: [
		{
			id: 'e2e-longsword',
			name: 'Longsword',
			notes: 'Original item notes.',
			tags: ['inventory:weapon'],
			equipped: true
		}
	],
	systemData: {
		...e2eCharacter.systemData,
		runtimeActions: []
	}
};

export const e2eRuntimeActionLinkStoredCharacters = {
	version: 1,
	characters: [e2eRuntimeActionLinkCharacter]
};

export const e2eLegacyCharacter = {
	meta: { ...e2eCharacter.meta, id: 'e2e-legacy-character', schemaVersion: 'char.v1' },
	system: e2eCharacter.system,
	identity: { ...e2eCharacter.identity, name: 'E2E Legacy Adventurer', ancestryLineage: 'Elf' },
	inventory: [
		{ id: 'legacy-rope', name: 'Rope', quantity: 1 },
		{ id: 'legacy-gp', name: 'GP', quantity: 4, tags: ['inventory:currency:gp'] }
	],
	notes: [
		{ id: 'legacy-motives', title: 'Motives', body: 'Protect the migrated party.', kind: 'lore' }
	],
	systemData: {
		level: e2eCharacter.systemData.level,
		proficiencyBonus: e2eCharacter.systemData.proficiencyBonus,
		abilities: e2eCharacter.systemData.abilities,
		saves: e2eCharacter.systemData.saves,
		skills: e2eCharacter.systemData.skills,
		combat: { ...e2eCharacter.systemData.combat, speed: '30' },
		classes: [],
		race: { name: 'Elf', languages: ['Common', 'Elvish'] },
		attacks: [{ id: 'legacy-action', name: 'Legacy Dash', timing: 'action' }]
	}
};

export const e2eLegacyStoredCharacters = {
	version: 1,
	characters: [e2eLegacyCharacter]
};
