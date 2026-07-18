const legacyAbilities = {
	str: { score: 10, mod: 0 },
	dex: { score: 10, mod: 0 },
	con: { score: 10, mod: 0 },
	int: { score: 10, mod: 0 },
	wis: { score: 10, mod: 0 },
	cha: { score: 10, mod: 0 }
};

const legacySystemDataBase = {
	level: 1,
	proficiencyBonus: 2,
	abilities: legacyAbilities,
	saves: {},
	skills: {},
	combat: {
		armorClass: 12,
		hitPoints: { max: 8, current: 8 }
	},
	classes: []
};

const legacyHeader = {
	meta: {
		id: 'legacy-comprehensive',
		schemaVersion: 'char.v1',
		createdAt: '2026-02-27T16:00:00Z',
		updatedAt: '2026-07-01T12:30:00Z'
	},
	system: {
		id: 'dnd5e-2014',
		version: 'SRD-5.1-2023',
		source: 'local' as const,
		annotations: [
			{ id: 'system-source', origin: 'source' as const, kind: 'tag' as const, text: '2014-5e' }
		]
	},
	identity: {
		name: 'Legacy Adventurer',
		ancestryLineage: 'Elf',
		background: 'Sage'
	}
};

export const legacySparse5eCharacter = {
	...legacyHeader,
	meta: {
		...legacyHeader.meta,
		id: 'legacy-sparse',
		schemaVersion: '0.0.1'
	},
	systemData: {
		...legacySystemDataBase,
		combat: {
			...legacySystemDataBase.combat,
			speed: ' 35 ',
			speedClimb: '',
			speedSwim: '20',
			speedFly: '0'
		}
	}
};

export const legacyOnlyActions5eCharacter = {
	...legacyHeader,
	meta: { ...legacyHeader.meta, id: 'legacy-actions' },
	systemData: {
		...legacySystemDataBase,
		attacks: [
			{ id: 'legacy-spear', name: 'Spear', timing: 'action' as const, category: 'attack' as const }
		]
	}
};

export const legacyComprehensive5eCharacter = {
	...legacyHeader,
	features: [
		{
			id: 'feature-root-1',
			name: 'Alert',
			annotations: [
				{
					id: 'feature-annotation',
					origin: 'user' as const,
					kind: 'note' as const,
					text: 'Chosen at level 1.'
				}
			]
		}
	],
	inventory: [
		{
			id: 'sword-1',
			name: 'Longsword',
			tags: ['inventory:weapon', 'silvered'],
			annotations: [
				{
					id: 'sword-annotation',
					origin: 'user' as const,
					kind: 'note' as const,
					text: 'Family heirloom.'
				}
			]
		},
		{
			id: 'gp-first',
			name: 'Gold Pieces',
			quantity: 5,
			tags: ['inventory:currency:gp'],
			annotations: [
				{
					id: 'gp-first-annotation',
					origin: 'user' as const,
					kind: 'note' as const,
					text: 'Starting gold.'
				}
			]
		},
		{
			id: 'gp-second',
			name: 'More Gold',
			quantity: 7,
			tags: ['inventory:currency:gp'],
			annotations: [
				{
					id: 'gp-second-annotation',
					origin: 'source' as const,
					kind: 'summary' as const,
					text: 'Quest reward.'
				}
			]
		},
		{ id: 'rope-1', name: 'Rope', quantity: 1, tags: ['adventuring-gear'] }
	],
	notes: [
		{ id: 'general-before', title: 'Before', body: 'First general note.', kind: 'quick' as const },
		{
			id: 'motives-primary',
			title: 'Motives',
			body: 'Protect the party.',
			kind: 'lore' as const,
			annotations: [
				{
					id: 'motive-annotation',
					origin: 'user' as const,
					kind: 'note' as const,
					text: 'Keep this private.'
				}
			]
		},
		{ id: 'general-middle', title: 'Middle', body: 'Second general note.' },
		{ id: 'motives-collision', title: 'Motives', body: 'A conflicting authored note.' },
		{ id: 'factions-primary', title: 'Factions & Orgs', body: 'The Harpers.' },
		{ id: 'general-after', title: 'After', body: 'Third general note.', kind: 'session' as const }
	],
	systemData: {
		...legacySystemDataBase,
		race: {
			name: 'Elf',
			languages: ['Common', 'Elvish'],
			traits: [{ featureId: 'darkvision', name: 'Darkvision' }]
		},
		background: {
			name: 'Sage',
			proficiencies: {
				skills: ['Arcana' as const],
				languages: ['Common', 'Draconic'],
				tools: ['Calligrapher supplies']
			}
		},
		runtimeActions: [
			{
				id: 'shared-action',
				name: 'Canonical Longsword',
				timing: 'action' as const,
				annotations: [
					{
						id: 'action-annotation',
						origin: 'user' as const,
						kind: 'note' as const,
						text: 'Canonical wins.'
					}
				]
			},
			{ id: 'canonical-only', name: 'Second Wind', timing: 'bonusAction' as const }
		],
		attacks: [
			{ id: 'shared-action', name: 'Legacy Longsword', timing: 'action' as const },
			{ id: 'legacy-only', name: 'Legacy Dagger', timing: 'action' as const },
			{ id: 'ambiguous', name: 'Ambiguous One', timing: 'action' as const },
			{ id: 'ambiguous', name: 'Ambiguous Two', timing: 'action' as const }
		],
		annotations: {
			combat: {
				armorClass: {
					_annotations: {
						'ac-source': {
							id: 'ac-source',
							origin: 'source' as const,
							kind: 'reference' as const,
							text: 'Leather armor.'
						}
					}
				}
			}
		}
	},
	annotations: [
		{
			id: 'root-annotation',
			origin: 'user' as const,
			kind: 'note' as const,
			text: 'Preserve the document annotation.'
		}
	]
};

export const cloneLegacy5eFixture = <T>(fixture: T): T => structuredClone(fixture);
