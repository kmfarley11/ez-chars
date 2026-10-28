import {
	readGridAnnotationsAtPath,
	resolveGridFieldDescriptors,
	type GridFieldDescriptor
} from '$lib/utils/gridContentHelpers';
import type {
	GridContentBindPath,
	GridContentData,
	GridContentField
} from '$lib/utils/gridContentTypes';
import type { AbilityKey, CharacterDocument5e2014 } from '../../../schema/index';
import type { GridContentListRow } from '$lib/ui/molecules/grid-content-list';
import {
	abilityMetadata,
	annotationEditorConfig,
	currencyPathPrefix,
	inventoryCurrencyMetadata,
	roleplayFieldMetadata,
	roleplayFieldPathPrefix,
	scratchpadNotesPathPrefix,
	skillMetadata,
	spellSlotLevelMetadata,
	toSystemDataAnnotationPath,
	type InventoryGroup,
	type RoleplayFieldKey
} from '$lib/systems/dnd5e-2014/sheet-constants';

type PrimitiveGridValue = string | number | boolean;

// Positional keys are view-only. The existing class editor guards against external array changes.
export const projectClassRows = (character: CharacterDocument5e2014): GridContentListRow[] =>
	character.systemData.classes.map((entry, index) => ({
		key: `class:${index}`,
		label: entry.name,
		badges: [`Level ${entry.level}`, ...(entry.subclass ? [entry.subclass] : [])],
		annotations: ['name', 'level', 'subclass'].flatMap((property) =>
			readGridAnnotationsAtPath(
				character,
				toSystemDataAnnotationPath(['systemData', 'classes', index, property])
			)
		)
	}));

export type AbilityRuntimeColumn = {
	key: AbilityKey;
	shortLabel: string;
	data: GridContentData;
};

export type InventoryRuntimeCard = {
	key: InventoryGroup;
};

export type Sheet5eProjection = {
	annotationEditorConfig: typeof annotationEditorConfig;
	metaPrimaryData: GridContentData;
	metaSecondaryData: GridContentData;
	metaTertiaryData: GridContentData;
	quickRefLiveData: GridContentData;
	quickRefReferenceData: GridContentData;
	proficiencyBonusRuntimeData: GridContentData;
	abilityRuntimeColumns: Array<AbilityRuntimeColumn>;
	inventoryCurrencyRuntimeData: GridContentData;
	inventoryRuntimeCards: Array<InventoryRuntimeCard>;
	organizationalBackgroundData: GridContentData;
	roleplayPrimaryData: GridContentData;
	roleplaySecondaryData: GridContentData;
	scratchpadNotesData: GridContentData;
	spellcastingRuntimeData: GridContentData;
	spellSlotRuntimeData: GridContentData;
};

export const project5eSheet = (char: CharacterDocument5e2014): Sheet5eProjection => {
	const withFieldAnnotations = (
		value: PrimitiveGridValue,
		bindPath: GridContentBindPath,
		options: Pick<
			GridContentField,
			'fieldName' | 'label' | 'multiline' | 'inputKind' | 'interaction' | 'capabilities'
		> = {}
	): GridContentField => {
		const annotationBindPath = toSystemDataAnnotationPath(bindPath);
		if (!annotationBindPath) return { ...options, bindPath, value };
		return {
			...options,
			bindPath,
			annotationBindPath,
			annotations: readGridAnnotationsAtPath(char, annotationBindPath),
			value
		};
	};
	const checkField = (
		label: string,
		path: GridContentBindPath,
		check: { proficient?: boolean; expertise?: boolean; bonus?: number } | undefined,
		skill = false
	): GridContentField => ({
		fieldName: label,
		bindPath: [...path, 'proficient'],
		displayStatus: {
			mark: skill && check?.expertise ? 'E' : check?.proficient ? 'P' : '',
			label:
				skill && check?.expertise
					? 'Expertise'
					: check?.proficient
						? 'Proficient'
						: 'Not proficient'
		},
		value: {
			proficient: withFieldAnnotations(check?.proficient ?? false, [...path, 'proficient'], {
				fieldName: `${label}: Proficiency`,
				label: 'proficient'
			}),
			...(skill
				? {
						expertise: withFieldAnnotations(check?.expertise ?? false, [...path, 'expertise'], {
							fieldName: `${label}: Expertise`,
							label: 'expertise'
						})
					}
				: {}),
			bonus: withFieldAnnotations(check?.bonus ?? '', [...path, 'bonus'], {
				fieldName: `${label}: Bonus`,
				label: 'bonus',
				inputKind: 'number'
			})
		}
	});

	const createRoleplayFieldData = (keys: Array<RoleplayFieldKey>): GridContentData =>
		Object.fromEntries(
			keys.map((key) => {
				const title = roleplayFieldMetadata.find((entry) => entry.key === key)?.title ?? key;
				return [
					key,
					{
						fieldName: title,
						bindPath: [roleplayFieldPathPrefix, key],
						annotationBindPath: ['systemData', 'roleplay', key, 'annotations'],
						annotations: char.systemData.roleplay[key]?.annotations ?? [],
						value: char.systemData.roleplay[key]?.body ?? '',
						multiline: true
					} satisfies GridContentField
				];
			})
		);

	const metaPrimaryData: GridContentData = {
		name: withFieldAnnotations(char.systemData.identity.name, ['systemData', 'identity', 'name']),
		playerName: withFieldAnnotations(
			char.systemData.identity.playerName ?? '',
			['systemData', 'identity', 'playerName'],
			{ fieldName: 'Player Name' }
		),
		classLevels: {
			addItemLabel: 'Add Class',
			addItemTemplate: {
				fieldName: 'Class',
				value: {
					name: { fieldName: 'Name', value: 'Class' },
					level: { fieldName: 'Level', value: 1 }
				}
			},
			bindPath: ['systemData', 'classes'],
			value: char.systemData.classes.map((entry, index) => ({
				fieldName: `Class ${index + 1}`,
				value: {
					name: withFieldAnnotations(entry.name, ['systemData', 'classes', index, 'name'], {
						fieldName: `Class ${index + 1} Name`
					}),
					level: withFieldAnnotations(entry.level, ['systemData', 'classes', index, 'level'], {
						fieldName: `Class ${index + 1} Level`
					}),
					subclass: withFieldAnnotations(
						entry.subclass ?? '',
						['systemData', 'classes', index, 'subclass'],
						{ fieldName: `Class ${index + 1} Subclass` }
					)
				}
			}))
		}
	};

	const metaSecondaryData: GridContentData = {
		ancestry: withFieldAnnotations(
			char.systemData.identity.ancestryLineage ?? char.systemData.race?.name ?? '',
			['systemData', 'identity', 'ancestryLineage']
		),
		background: withFieldAnnotations(
			char.systemData.identity.background ?? char.systemData.background?.name ?? '',
			['systemData', 'identity', 'background']
		)
	};
	const metaTertiaryData: GridContentData = {
		alignment: withFieldAnnotations(char.systemData.identity.alignment ?? '', [
			'systemData',
			'identity',
			'alignment'
		]),
		appearance: withFieldAnnotations(char.systemData.identity.appearance ?? '', [
			'systemData',
			'identity',
			'appearance'
		])
	};

	const quickRefLiveDescriptors: Array<GridFieldDescriptor> = [
		{
			key: 'currentHp',
			path: ['systemData', 'combat', 'hitPoints', 'current'],
			interaction: {
				tier: 'runtime',
				editAffordance: 'persistent',
				annotationAffordance: 'persistent'
			}
		},
		{
			key: 'tempHp',
			path: ['systemData', 'combat', 'hitPoints', 'temp'],
			valuePatchOperation: char.systemData.combat.hitPoints.temp === undefined ? 'add' : 'replace',
			interaction: {
				tier: 'runtime',
				editAffordance: 'persistent',
				annotationAffordance: 'persistent'
			}
		},
		{
			key: 'deathSavesOk',
			fieldName: 'Death Saves OK',
			path: ['systemData', 'combat', 'deathSaves', 'successes'],
			defaultValue: 0,
			interaction: {
				tier: 'runtime',
				editAffordance: 'persistent',
				annotationAffordance: 'persistent'
			}
		},
		{
			key: 'deathSavesRip',
			fieldName: 'Death Saves RIP',
			path: ['systemData', 'combat', 'deathSaves', 'failures'],
			defaultValue: 0,
			interaction: {
				tier: 'runtime',
				editAffordance: 'persistent',
				annotationAffordance: 'persistent'
			}
		},
		...(char.systemData.combat.hitDice
			? [
					{
						key: 'hitDiceRemaining',
						fieldName: 'Hit Dice Remaining',
						path: ['systemData', 'combat', 'hitDice', 'remaining'] as GridContentBindPath,
						valuePatchOperation:
							char.systemData.combat.hitDice.remaining === undefined
								? ('add' as const)
								: ('replace' as const),
						interaction: {
							tier: 'runtime' as const,
							editAffordance: 'persistent' as const,
							annotationAffordance: 'persistent' as const
						}
					}
				]
			: [])
	];
	const quickRefLiveData = resolveGridFieldDescriptors(char, quickRefLiveDescriptors, {
		annotationPathForValuePath: toSystemDataAnnotationPath
	});
	const quickRefReferenceData: GridContentData = {
		inspiration: withFieldAnnotations(
			char.systemData.combat.inspiration ?? false,
			['systemData', 'combat', 'inspiration'],
			{ fieldName: 'Inspiration' }
		),
		passivePerception: withFieldAnnotations(
			char.systemData.combat.senses?.passivePerception ?? '',
			['systemData', 'combat', 'senses', 'passivePerception'],
			{ fieldName: 'Passive Perception', inputKind: 'number' }
		),
		maxHp: withFieldAnnotations(
			char.systemData.combat.hitPoints.max,
			['systemData', 'combat', 'hitPoints', 'max'],
			{ fieldName: 'Maximum HP', inputKind: 'number' }
		),
		armorClass: withFieldAnnotations(
			char.systemData.combat.armorClass,
			['systemData', 'combat', 'armorClass'],
			{ fieldName: 'Armor Class', inputKind: 'number' }
		),
		initiative: withFieldAnnotations(
			char.systemData.combat.initiative ?? 0,
			['systemData', 'combat', 'initiative'],
			{ fieldName: 'Initiative', inputKind: 'number' }
		),
		hitDiceTotal: withFieldAnnotations(
			char.systemData.combat.hitDice?.total ?? '',
			['systemData', 'combat', 'hitDice', 'total'],
			{ fieldName: 'Total Hit Dice' }
		),
		speed: withFieldAnnotations(
			char.systemData.combat.speed ?? char.systemData.race?.speed ?? 0,
			['systemData', 'combat', 'speed'],
			{ fieldName: 'Walking Speed', label: 'ft', inputKind: 'number' }
		),
		climb: withFieldAnnotations(
			char.systemData.combat.speedClimb ?? char.systemData.race?.speedClimb ?? 0,
			['systemData', 'combat', 'speedClimb'],
			{ fieldName: 'Climb Speed', label: 'ft', inputKind: 'number' }
		),
		swim: withFieldAnnotations(
			char.systemData.combat.speedSwim ?? char.systemData.race?.speedSwim ?? 0,
			['systemData', 'combat', 'speedSwim'],
			{ fieldName: 'Swim Speed', label: 'ft', inputKind: 'number' }
		),
		fly: withFieldAnnotations(
			char.systemData.combat.speedFly ?? char.systemData.race?.speedFly ?? 0,
			['systemData', 'combat', 'speedFly'],
			{ fieldName: 'Fly Speed', label: 'ft', inputKind: 'number' }
		)
	};

	const proficiencyBonusRuntimeData: GridContentData = {
		proficiencyBonus: withFieldAnnotations(
			char.systemData.proficiencyBonus,
			['systemData', 'proficiencyBonus'],
			{
				fieldName: 'Prof. Bonus',
				inputKind: 'number',
				capabilities: { canEditValue: true, canEditAnnotations: true },
				interaction: {
					tier: 'read-first',
					editAffordance: 'hover',
					annotationAffordance: 'badge'
				}
			}
		)
	};
	const abilityRuntimeColumns: Array<AbilityRuntimeColumn> = abilityMetadata.map(
		({ key, shortLabel }) => {
			const abilityData = char.systemData.abilities[key];
			const saveData = char.systemData.saves[key];
			const skillsForAbility = skillMetadata.filter((entry) => entry.abilityKey === key);
			return {
				key,
				shortLabel,
				data: Object.fromEntries([
					[
						'ability',
						{
							fieldName: shortLabel,
							value: {
								score: withFieldAnnotations(
									abilityData.score,
									['systemData', 'abilities', key, 'score'],
									{ fieldName: 'Score', label: 'score' }
								),
								mod: withFieldAnnotations(
									abilityData.mod ?? 0,
									['systemData', 'abilities', key, 'mod'],
									{ fieldName: 'Modifier', label: 'mod' }
								)
							}
						}
					],
					['save', checkField(`${shortLabel} Save`, ['systemData', 'saves', key], saveData)],
					...skillsForAbility.map(
						({ name }) =>
							[
								name,
								checkField(name, ['systemData', 'skills', name], char.systemData.skills[name], true)
							] as const
					)
				])
			};
		}
	);

	const defaultSpellcastingAbility: AbilityKey =
		char.systemData.spellcasting?.ability ??
		char.systemData.classes.find((entry) => entry.spellcasting?.ability)?.spellcasting?.ability ??
		'int';
	const inventoryCurrencyRuntimeData: GridContentData = Object.fromEntries(
		inventoryCurrencyMetadata.map(({ key, label }) => [
			key,
			{
				fieldName: label,
				bindPath: [currencyPathPrefix, key],
				inputKind: 'number',
				capabilities: { canEditValue: true, canEditAnnotations: false },
				interaction: {
					tier: 'runtime',
					editAffordance: 'persistent',
					annotationAffordance: 'badge'
				},
				value: char.systemData.currency[key]?.amount ?? 0
			} satisfies GridContentField
		])
	);
	const inventoryRuntimeCards: Array<InventoryRuntimeCard> = [
		{ key: 'weapons' },
		{ key: 'armorShields' },
		{ key: 'other' }
	];

	const organizationalBackgroundData: GridContentData = {
		background: withFieldAnnotations(
			char.systemData.background?.name ?? char.systemData.identity.background ?? '',
			['systemData', 'background', 'name'],
			{ fieldName: 'Background' }
		),
		appearance: withFieldAnnotations(
			char.systemData.identity.appearance ?? '',
			['systemData', 'identity', 'appearance'],
			{
				fieldName: 'Appearance',
				multiline: true
			}
		),
		description: withFieldAnnotations(
			char.systemData.identity.description ?? '',
			['systemData', 'identity', 'description'],
			{ fieldName: 'Description', multiline: true }
		)
	};
	const roleplayPrimaryData = createRoleplayFieldData([
		'motives',
		'personalityTraits',
		'ideals',
		'bonds',
		'flaws'
	]);
	const roleplaySecondaryData = createRoleplayFieldData([
		'otherBackgroundHistory',
		'factionsOrgs',
		'otherCharacterInfo'
	]);
	const scratchpadNotesData: GridContentData = {
		notes: {
			fieldName: 'Misc. Notes & Scratchpad',
			addItemLabel: 'Add Note',
			addItemTemplate: {
				fieldName: 'Note',
				value: {
					title: { fieldName: 'Title', value: 'Note' },
					body: { fieldName: 'Body', value: '', multiline: true },
					kind: {
						fieldName: 'Kind',
						value: 'other',
						editOnly: true,
						options: ['quick', 'session', 'lore', 'rules', 'other']
					}
				}
			},
			bindPath: [scratchpadNotesPathPrefix],
			value: char.systemData.notes.map((note) => ({
				fieldName: 'Note',
				value: {
					title: { fieldName: 'Title', value: note.title ?? '' },
					body: { fieldName: 'Body', value: note.body, multiline: true },
					kind: {
						fieldName: 'Kind',
						value: note.kind ?? 'other',
						editOnly: true,
						options: ['quick', 'session', 'lore', 'rules', 'other']
					},
					id: { fieldName: 'Note Id', value: note.id, editOnly: true, hidden: true }
				}
			}))
		}
	};

	const spellSlotRuntimeData: GridContentData = Object.fromEntries(
		spellSlotLevelMetadata.map(({ key, label }) => {
			const slot = char.systemData.spellcasting?.slots?.[key];
			return [
				`slot${key}`,
				{
					fieldName: label,
					value: {
						used: withFieldAnnotations(
							slot?.used ?? 0,
							['systemData', 'spellcasting', 'slots', key, 'used'],
							{
								fieldName: 'Used',
								inputKind: 'number',
								capabilities: { canEditValue: true, canEditAnnotations: true },
								interaction: {
									tier: 'runtime',
									editAffordance: 'persistent',
									annotationAffordance: 'persistent'
								}
							}
						),
						max: withFieldAnnotations(
							slot?.max ?? 0,
							['systemData', 'spellcasting', 'slots', key, 'max'],
							{
								fieldName: 'Max',
								inputKind: 'number',
								capabilities: { canEditValue: true, canEditAnnotations: true },
								interaction: {
									tier: 'runtime',
									editAffordance: 'persistent',
									annotationAffordance: 'persistent'
								}
							}
						)
					}
				}
			] satisfies [string, GridContentField];
		})
	);
	const spellcastingRuntimeData: GridContentData = {
		spellcastingSummary: {
			fieldName: 'Spellcasting summary',
			value: {
				ability: withFieldAnnotations(
					char.systemData.spellcasting?.ability ?? defaultSpellcastingAbility,
					['systemData', 'spellcasting', 'ability'],
					{ fieldName: 'Ability', label: 'ability' }
				),
				spellSaveDC: withFieldAnnotations(
					char.systemData.spellcasting?.spellSaveDC ?? 0,
					['systemData', 'spellcasting', 'spellSaveDC'],
					{ fieldName: 'Save DC', label: 'save dc', inputKind: 'number' }
				),
				spellAttackBonus: withFieldAnnotations(
					char.systemData.spellcasting?.spellAttackBonus ?? 0,
					['systemData', 'spellcasting', 'spellAttackBonus'],
					{ fieldName: 'Attack Bonus', label: 'attack bonus', inputKind: 'number' }
				)
			}
		}
	};
	return {
		annotationEditorConfig,
		metaPrimaryData,
		metaSecondaryData,
		metaTertiaryData,
		quickRefLiveData,
		quickRefReferenceData,
		proficiencyBonusRuntimeData,
		abilityRuntimeColumns,
		inventoryCurrencyRuntimeData,
		inventoryRuntimeCards,
		organizationalBackgroundData,
		roleplayPrimaryData,
		roleplaySecondaryData,
		scratchpadNotesData,
		spellcastingRuntimeData,
		spellSlotRuntimeData
	};
};
