// Edition-owned vocabulary shared by validation and sheet projections, not a core RPG contract.
export const abilityKeys2024 = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export const skillAbilities2024 = {
	acrobatics: 'dex',
	animalHandling: 'wis',
	arcana: 'int',
	athletics: 'str',
	deception: 'cha',
	history: 'int',
	insight: 'wis',
	intimidation: 'cha',
	investigation: 'int',
	medicine: 'wis',
	nature: 'int',
	perception: 'wis',
	performance: 'cha',
	persuasion: 'cha',
	religion: 'int',
	sleightOfHand: 'dex',
	stealth: 'dex',
	survival: 'wis'
} as const;
export const recordKinds2024 = [
	'inventory',
	'runtimeActions',
	'notes',
	'classes',
	'languages',
	'tools',
	'features',
	'traits',
	'feats',
	'masteries',
	'spells'
] as const;
export type RecordKind2024 = (typeof recordKinds2024)[number];
export const featureKinds2024 = ['features', 'traits', 'feats', 'masteries'] as const;

export const scalarPaths2024 = [
	...['name', 'species', 'background', 'appearance', 'alignment'].map((key) => ['identity', key]),
	...[
		'armorClass',
		'initiative',
		'hitDice',
		'heroicInspiration',
		'conditions',
		'size',
		'passivePerception'
	].map((key) => ['combat', key]),
	...['current', 'max', 'temp'].map((key) => ['combat', 'hitPoints', key]),
	...['successes', 'failures'].map((key) => ['combat', 'deathSaves', key]),
	...['walk', 'climb', 'swim', 'fly', 'burrow'].map((key) => ['combat', 'movement', key]),
	...abilityKeys2024.flatMap((key) =>
		['score', 'modifier'].map((leaf) => ['abilities', key, leaf])
	),
	...abilityKeys2024.flatMap((key) =>
		['proficient', 'expertise', 'bonus'].map((leaf) => ['saves', key, leaf])
	),
	...Object.keys(skillAbilities2024).flatMap((key) =>
		['proficient', 'expertise', 'bonus'].map((leaf) => ['skills', key, leaf])
	),
	['proficiencyBonus'],
	...['armor', 'weapons'].map((key) => ['training', key]),
	...['cp', 'sp', 'ep', 'gp', 'pp'].map((key) => ['currency', key]),
	...['personality', 'ideals', 'bonds', 'flaws', 'backstory'].map((key) => ['roleplay', key]),
	...['ability', 'saveDC', 'attackBonus'].map((key) => ['spellcasting', key]),
	...Array.from({ length: 9 }, (_, i) => String(i + 1)).flatMap((key) =>
		['used', 'max'].map((leaf) => ['spellcasting', 'slots', key, leaf])
	)
].map((path) => ['systemData', ...path]);

export const recordProperties2024: Record<RecordKind2024, readonly string[]> = {
	inventory: ['name', 'category', 'quantity', 'equipped', 'detail'],
	runtimeActions: ['name', 'timing', 'detail'],
	notes: ['title', 'body'],
	classes: ['name', 'level', 'subclass', 'detail'],
	languages: ['name', 'detail'],
	tools: ['name', 'detail'],
	features: ['name', 'context', 'detail'],
	traits: ['name', 'context', 'detail'],
	feats: ['name', 'context', 'detail'],
	masteries: ['name', 'context', 'detail'],
	spells: ['name', 'level', 'prepared', 'detail']
};
