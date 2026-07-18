import {
	readGridAnnotationsAtPath,
	resolveGridFieldDescriptors,
	type GridFieldDescriptor
} from '$utils/gridContentHelpers';
import type {
	GridContentBindPath,
	GridContentData,
	GridContentField
} from '$utils/gridContentTypes';
import type {
	AbilityKey,
	CharacterDocument5e2014,
	FeatureRef,
	Item,
	NamedProficiency
} from '../../../schema';
import {
	abilityMetadata,
	annotationEditorConfig,
	classFeatureListPathPrefix,
	currencyPathPrefix,
	getInventoryGroupForItem,
	inventoryCurrencyMetadata,
	inventoryListPathPrefix,
	proficiencyLanguagesPathPrefix,
	proficiencyToolsPathPrefix,
	roleplayFieldMetadata,
	roleplayFieldPathPrefix,
	runtimeActionListPathPrefix,
	scratchpadNotesPathPrefix,
	skillMetadata,
	spellListLevelPathPrefix,
	spellSlotLevelMetadata,
	toSystemDataAnnotationPath,
	type InventoryGroup,
	type ProficiencyEditorSource,
	type RoleplayFieldKey,
	type SpellListLevel
} from './sheetConstants';

type PrimitiveGridValue = string | number | boolean;
type GridIndexBindPathResolver = (_index: number) => GridContentBindPath;

export type AbilityRuntimeColumn = {
	key: AbilityKey;
	shortLabel: string;
	data: GridContentData;
};

export type InventoryRuntimeCard = {
	key: InventoryGroup;
	data: GridContentData;
};

export type SpellSlotRuntimeCard = {
	key: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'cantrips';
	label: string;
	data: GridContentData;
	slot?: { used: number; max: number };
};

export type Sheet5eProjection = {
	annotationEditorConfig: typeof annotationEditorConfig;
	runtimeActionData: GridContentData;
	metaPrimaryData: GridContentData;
	metaSecondaryData: GridContentData;
	metaTertiaryData: GridContentData;
	quickRefPrimaryData: GridContentData;
	quickRefMovementData: GridContentData;
	quickRefSecondaryData: GridContentData;
	proficiencyBonusRuntimeData: GridContentData;
	abilityRuntimeColumns: Array<AbilityRuntimeColumn>;
	traitRuntimeData: GridContentData;
	proficiencyLanguagesRuntimeData: GridContentData;
	proficiencyToolsRuntimeData: GridContentData;
	classFeaturesRuntimeData: GridContentData;
	inventoryCurrencyRuntimeData: GridContentData;
	inventoryRuntimeCards: Array<InventoryRuntimeCard>;
	organizationalBackgroundData: GridContentData;
	roleplayPrimaryData: GridContentData;
	roleplaySecondaryData: GridContentData;
	scratchpadNotesData: GridContentData;
	spellcastingRuntimeData: GridContentData;
	spellSlotRuntimeCards: Array<SpellSlotRuntimeCard>;
};

const proficiencySourceOptions: Array<ProficiencyEditorSource> = [
	'ancestry',
	'background',
	'class',
	'feature',
	'other'
];

const createProficiencyListField = (
	withFieldAnnotations: (
		value: PrimitiveGridValue,
		bindPath: GridContentBindPath,
		options?: Pick<GridContentField, 'fieldName' | 'label' | 'multiline' | 'inputKind'>
	) => GridContentField,
	fieldName: string,
	bindPath: GridContentBindPath,
	groupKey: 'languages' | 'tools',
	values: Array<NamedProficiency>,
	itemFieldName: string,
	defaultSource: ProficiencyEditorSource
): GridContentField => ({
	fieldName,
	addItemLabel: `Add ${itemFieldName}`,
	addItemTemplate: {
		fieldName: itemFieldName,
		value: {
			name: { fieldName: 'Name', value: itemFieldName },
			source: {
				fieldName: 'Source',
				value: defaultSource,
				editOnly: true,
				options: proficiencySourceOptions
			}
		}
	},
	bindPath,
	value: values.map((entry, index) => ({
		fieldName: itemFieldName,
		value: {
			name: withFieldAnnotations(
				entry.name,
				['systemData', 'proficiencies', groupKey, index, 'name'],
				{ fieldName: 'Name' }
			),
			source: {
				fieldName: 'Source',
				value: entry.source?.kind ?? 'other',
				editOnly: true,
				options: proficiencySourceOptions
			}
		}
	}))
});

const createFeatureRefListField = (
	withFieldAnnotations: (
		value: PrimitiveGridValue,
		bindPath: GridContentBindPath,
		options?: Pick<GridContentField, 'fieldName' | 'label' | 'multiline' | 'inputKind'>
	) => GridContentField,
	fieldName: string,
	bindPath: GridContentBindPath,
	values: Array<FeatureRef>,
	itemFieldName: string,
	itemBindPathForIndex?: GridIndexBindPathResolver
): GridContentField => ({
	fieldName,
	addItemLabel: `Add ${itemFieldName}`,
	addItemTemplate: {
		fieldName: itemFieldName,
		value: {
			name: {
				fieldName: 'Name',
				value: itemFieldName
			}
		}
	},
	bindPath,
	value: values.map((entry, index) => ({
		fieldName: itemFieldName,
		value: {
			name: itemBindPathForIndex
				? withFieldAnnotations(entry.name, [...itemBindPathForIndex(index), 'name'], {
						fieldName: 'Name'
					})
				: {
						fieldName: 'Name',
						value: entry.name
					},
			...(entry.featureId
				? {
						featureId: {
							fieldName: 'Feature Id',
							value: entry.featureId,
							editOnly: true
						} satisfies GridContentField
					}
				: {})
		}
	}))
});

const createInventoryListField = (
	fieldName: string,
	items: Array<Item>,
	group: InventoryGroup,
	itemPlaceholder: string
): GridContentField => ({
	fieldName,
	addItemLabel: 'Add Item',
	addItemTemplate: {
		fieldName: 'Item',
		value: {
			name: { fieldName: 'Name', value: itemPlaceholder },
			notes: { fieldName: 'Detail', value: '', multiline: true },
			quantity: { fieldName: 'Quantity', value: 1, editOnly: true },
			weight: { fieldName: 'Weight', value: 0, editOnly: true },
			value: { fieldName: 'Value', value: '', editOnly: true },
			equipped: { fieldName: 'Equipped', value: group !== 'other', editOnly: true }
		}
	},
	bindPath: [inventoryListPathPrefix, group],
	value: items.map((item) => ({
		fieldName: 'Item',
		value: {
			name: { fieldName: 'Name', value: item.name },
			notes: { fieldName: 'Detail', value: item.notes ?? '', multiline: true },
			quantity: { fieldName: 'Quantity', value: item.quantity ?? 1, editOnly: true },
			weight: { fieldName: 'Weight', value: item.weight ?? 0, editOnly: true },
			value: { fieldName: 'Value', value: item.value ?? '', editOnly: true },
			equipped: { fieldName: 'Equipped', value: item.equipped ?? false, editOnly: true },
			id: { fieldName: 'Item Id', value: item.id, editOnly: true, hidden: true }
		}
	}))
});

export const project5eSheet = (char: CharacterDocument5e2014): Sheet5eProjection => {
	const withFieldAnnotations = (
		value: PrimitiveGridValue,
		bindPath: GridContentBindPath,
		options: Pick<GridContentField, 'fieldName' | 'label' | 'multiline' | 'inputKind'> = {}
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

	const runtimeActions = char.systemData.runtimeActions;
	const runtimeActionData: GridContentData = {
		actions: {
			fieldName: 'Runtime Actions',
			addItemLabel: 'Add Action',
			addItemTemplate: {
				fieldName: 'Action',
				value: {
					name: { fieldName: 'Name', value: 'Action' },
					timing: {
						fieldName: 'Timing',
						value: 'action',
						options: ['action', 'bonusAction', 'reaction', 'free', 'other']
					},
					category: {
						fieldName: 'Category',
						value: 'effect',
						options: ['attack', 'effect', 'other']
					},
					target: { fieldName: 'Target', value: '' },
					notes: { fieldName: 'Notes', value: '', multiline: true, editOnly: true }
				}
			},
			bindPath: [runtimeActionListPathPrefix],
			value: runtimeActions.map((action, actionIndex) => ({
				fieldName: 'Action',
				value: {
					name: withFieldAnnotations(
						action.name,
						['systemData', 'runtimeActions', actionIndex, 'name'],
						{ fieldName: 'Name' }
					),
					timing: {
						fieldName: 'Timing',
						value: action.timing ?? 'action',
						options: ['action', 'bonusAction', 'reaction', 'free', 'other']
					},
					category: {
						fieldName: 'Category',
						value: action.category ?? 'attack',
						options: ['attack', 'effect', 'other']
					},
					target: { fieldName: 'Target', value: action.target ?? '' },
					notes: {
						fieldName: 'Notes',
						value: action.notes ?? '',
						multiline: true,
						editOnly: true
					},
					id: { fieldName: 'Action Id', value: action.id, editOnly: true, hidden: true }
				}
			}))
		}
	};

	const createRoleplayFieldData = (keys: Array<RoleplayFieldKey>): GridContentData =>
		Object.fromEntries(
			keys.map((key) => {
				const title = roleplayFieldMetadata.find((entry) => entry.key === key)?.title ?? key;
				return [
					key,
					{
						fieldName: title,
						bindPath: [roleplayFieldPathPrefix, key],
						value: char.systemData.roleplay[key]?.body ?? '',
						multiline: true
					} satisfies GridContentField
				];
			})
		);

	const metaPrimaryData: GridContentData = {
		name: withFieldAnnotations(char.identity.name, ['identity', 'name']),
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
					})
				}
			}))
		}
	};

	const metaSecondaryData: GridContentData = {
		ancestry: withFieldAnnotations(
			char.identity.ancestryLineage ?? char.systemData.race?.name ?? '',
			['identity', 'ancestryLineage']
		),
		background: withFieldAnnotations(
			char.identity.background ?? char.systemData.background?.name ?? '',
			['identity', 'background']
		)
	};
	const metaTertiaryData: GridContentData = {
		alignment: withFieldAnnotations(char.identity.alignment ?? '', ['identity', 'alignment']),
		appearance: withFieldAnnotations(char.identity.appearance ?? '', ['identity', 'appearance'])
	};

	const quickRefPrimaryDescriptors: Array<GridFieldDescriptor> = [
		{
			key: 'currentHp',
			path: ['systemData', 'combat', 'hitPoints', 'current'],
			interaction: { editAffordance: 'persistent', annotationAffordance: 'persistent' }
		},
		{
			key: 'tempHp',
			path: ['systemData', 'combat', 'hitPoints', 'temp'],
			valuePatchOperation: char.systemData.combat.hitPoints.temp === undefined ? 'add' : 'replace',
			interaction: { editAffordance: 'persistent', annotationAffordance: 'persistent' }
		},
		{ key: 'maxHp', path: ['systemData', 'combat', 'hitPoints', 'max'] },
		{ key: 'initiative', path: ['systemData', 'combat', 'initiative'] },
		{ key: 'armorClass', path: ['systemData', 'combat', 'armorClass'] }
	];
	const quickRefPrimaryData = resolveGridFieldDescriptors(char, quickRefPrimaryDescriptors, {
		annotationPathForValuePath: toSystemDataAnnotationPath
	});
	const quickRefMovementData: GridContentData = {
		...resolveGridFieldDescriptors(
			char,
			[
				{
					key: 'deathSavesOk',
					fieldName: 'Death Saves OK',
					path: ['systemData', 'combat', 'deathSaves', 'successes'],
					defaultValue: 0,
					interaction: { editAffordance: 'persistent', annotationAffordance: 'persistent' }
				},
				{
					key: 'deathSavesRip',
					fieldName: 'Death Saves RIP',
					path: ['systemData', 'combat', 'deathSaves', 'failures'],
					defaultValue: 0,
					interaction: { editAffordance: 'persistent', annotationAffordance: 'persistent' }
				}
			],
			{ annotationPathForValuePath: toSystemDataAnnotationPath }
		),
		speed: withFieldAnnotations(
			char.systemData.combat.speed ?? char.systemData.race?.speed ?? '',
			['systemData', 'combat', 'speed'],
			{ inputKind: 'number', label: 'walking ft' }
		),
		climb: withFieldAnnotations(
			char.systemData.combat.speedClimb ?? char.systemData.race?.speedClimb ?? '',
			['systemData', 'combat', 'speedClimb'],
			{ fieldName: 'Climb', inputKind: 'number', label: 'ft' }
		),
		swim: withFieldAnnotations(
			char.systemData.combat.speedSwim ?? char.systemData.race?.speedSwim ?? '',
			['systemData', 'combat', 'speedSwim'],
			{ fieldName: 'Swim', inputKind: 'number', label: 'ft' }
		),
		fly: withFieldAnnotations(
			char.systemData.combat.speedFly ?? char.systemData.race?.speedFly ?? '',
			['systemData', 'combat', 'speedFly'],
			{ inputKind: 'number', label: 'ft' }
		)
	};
	const quickRefSecondaryData: GridContentData = {
		...resolveGridFieldDescriptors(
			char,
			char.systemData.combat.hitDice
				? [
						{
							key: 'hitDiceRemaining',
							fieldName: 'Hit Dice Remaining',
							path: ['systemData', 'combat', 'hitDice', 'remaining'],
							valuePatchOperation:
								char.systemData.combat.hitDice.remaining === undefined ? 'add' : 'replace',
							interaction: {
								editAffordance: 'persistent',
								annotationAffordance: 'persistent'
							}
						}
					]
				: [],
			{ annotationPathForValuePath: toSystemDataAnnotationPath }
		),
		hitDice: {
			fieldName: 'Hit Dice',
			value: {
				remaining: withFieldAnnotations(char.systemData.combat.hitDice?.remaining ?? '', [
					'systemData',
					'combat',
					'hitDice',
					'remaining'
				]),
				total: withFieldAnnotations(char.systemData.combat.hitDice?.total ?? '', [
					'systemData',
					'combat',
					'hitDice',
					'total'
				])
			}
		}
	};

	const proficiencyBonusRuntimeData: GridContentData = {
		proficiencyBonus: withFieldAnnotations(
			char.systemData.proficiencyBonus,
			['systemData', 'proficiencyBonus'],
			{ fieldName: 'Prof. Bonus' }
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
					[
						'save',
						withFieldAnnotations(
							saveData?.proficient ?? false,
							['systemData', 'saves', key, 'proficient'],
							{ fieldName: 'Save' }
						)
					],
					...skillsForAbility.map(
						({ name }) =>
							[
								name,
								withFieldAnnotations(
									char.systemData.skills[name]?.proficient ?? false,
									['systemData', 'skills', name, 'proficient'],
									{ fieldName: name }
								) satisfies GridContentField
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
	const defaultProficiencySource: ProficiencyEditorSource =
		char.systemData.background?.name !== undefined || char.identity.background !== undefined
			? 'background'
			: 'ancestry';

	const traitRuntimeData: GridContentData = {
		traits: createFeatureRefListField(
			withFieldAnnotations,
			'Traits',
			['systemData', 'race', 'traits'],
			char.systemData.race?.traits ?? [],
			'Trait',
			(index) => ['systemData', 'race', 'traits', index]
		)
	};
	const proficiencyLanguagesRuntimeData: GridContentData = {
		languages: createProficiencyListField(
			withFieldAnnotations,
			'Prof. Languages',
			[proficiencyLanguagesPathPrefix],
			'languages',
			char.systemData.proficiencies.languages,
			'Language',
			defaultProficiencySource
		)
	};
	const proficiencyToolsRuntimeData: GridContentData = {
		tools: createProficiencyListField(
			withFieldAnnotations,
			'Prof. Tools',
			[proficiencyToolsPathPrefix],
			'tools',
			char.systemData.proficiencies.tools,
			'Tool',
			defaultProficiencySource
		)
	};
	const classFeaturesRuntimeData: GridContentData = {
		features: {
			fieldName: 'Class Features',
			bindPath: [classFeatureListPathPrefix],
			value: char.systemData.classes.flatMap((entry, classIndex) =>
				(entry.features ?? []).map((feature, featureIndex) => ({
					fieldName: entry.subclass ? `${entry.name} (${entry.subclass})` : entry.name,
					value: {
						name: withFieldAnnotations(
							feature.name,
							['systemData', 'classes', classIndex, 'features', featureIndex, 'name'],
							{ fieldName: 'Name' }
						),
						classIndex: {
							fieldName: 'Class Index',
							value: classIndex,
							editOnly: true,
							hidden: true
						},
						...(feature.featureId
							? {
									featureId: {
										fieldName: 'Feature Id',
										value: feature.featureId,
										editOnly: true,
										hidden: true
									} satisfies GridContentField
								}
							: {})
					}
				}))
			)
		}
	};

	const inventoryCurrencyRuntimeData: GridContentData = Object.fromEntries(
		inventoryCurrencyMetadata.map(({ key, label }) => [
			key,
			{
				fieldName: label,
				bindPath: [currencyPathPrefix, key],
				value: char.systemData.currency[key]?.amount ?? 0
			} satisfies GridContentField
		])
	);
	const inventory = char.inventory;
	const inventoryRuntimeCards: Array<InventoryRuntimeCard> = [
		{
			key: 'weapons',
			data: {
				items: createInventoryListField(
					'Weapons',
					inventory.filter((item) => getInventoryGroupForItem(item) === 'weapons'),
					'weapons',
					'Weapon'
				)
			}
		},
		{
			key: 'armorShields',
			data: {
				items: createInventoryListField(
					'Armor & Shields',
					inventory.filter((item) => getInventoryGroupForItem(item) === 'armorShields'),
					'armorShields',
					'Armor'
				)
			}
		},
		{
			key: 'other',
			data: {
				items: createInventoryListField(
					'Other Gear',
					inventory.filter((item) => getInventoryGroupForItem(item) === 'other'),
					'other',
					'Gear'
				)
			}
		}
	];

	const organizationalBackgroundData: GridContentData = {
		background: withFieldAnnotations(
			char.systemData.background?.name ?? char.identity.background ?? '',
			['systemData', 'background', 'name'],
			{ fieldName: 'Background' }
		),
		appearance: withFieldAnnotations(char.identity.appearance ?? '', ['identity', 'appearance'], {
			fieldName: 'Appearance',
			multiline: true
		}),
		description: withFieldAnnotations(
			char.identity.description ?? '',
			['identity', 'description'],
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
			value: char.notes.map((note) => ({
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

	const spellcastingRuntimeData: GridContentData = {
		ability: withFieldAnnotations(
			char.systemData.spellcasting?.ability ?? defaultSpellcastingAbility,
			['systemData', 'spellcasting', 'ability'],
			{ fieldName: 'Ability' }
		),
		spellSaveDC: withFieldAnnotations(
			char.systemData.spellcasting?.spellSaveDC ?? 0,
			['systemData', 'spellcasting', 'spellSaveDC'],
			{ fieldName: 'Save DC' }
		),
		spellAttackBonus: withFieldAnnotations(
			char.systemData.spellcasting?.spellAttackBonus ?? 0,
			['systemData', 'spellcasting', 'spellAttackBonus'],
			{ fieldName: 'Attack Bonus' }
		)
	};
	const currentSpells = char.systemData.spellcasting?.spells ?? [];
	const createSpellListField = (level: SpellListLevel): GridContentField => ({
		fieldName: level === 0 ? 'Cantrips' : 'Spells',
		addItemLabel: level === 0 ? 'Add Cantrip' : 'Add Spell',
		addItemTemplate: {
			fieldName: level === 0 ? 'Cantrip' : 'Spell',
			value: {
				name: { fieldName: 'Name', value: level === 0 ? 'Cantrip' : 'Spell' },
				prepared: { fieldName: 'Prepared', value: false, editOnly: true },
				notes: { fieldName: 'Notes', value: '', editOnly: true, multiline: true }
			}
		},
		bindPath: [spellListLevelPathPrefix, level],
		value: currentSpells
			.flatMap((spell, spellIndex) => ((spell.level ?? 0) === level ? [{ spell, spellIndex }] : []))
			.map(({ spell, spellIndex }) => ({
				fieldName: level === 0 ? 'Cantrip' : 'Spell',
				value: {
					name: withFieldAnnotations(
						spell.name,
						['systemData', 'spellcasting', 'spells', spellIndex, 'name'],
						{ fieldName: 'Name' }
					),
					prepared: { fieldName: 'Prepared', value: spell.prepared ?? false, editOnly: true },
					notes: {
						fieldName: 'Notes',
						value: spell.notes ?? '',
						editOnly: true,
						multiline: true
					},
					...(spell.spellId
						? {
								spellId: {
									fieldName: 'Spell Id',
									value: spell.spellId,
									editOnly: true,
									hidden: true
								} satisfies GridContentField
							}
						: {})
				}
			}))
	});
	const spellSlotRuntimeCards: Array<SpellSlotRuntimeCard> = [
		{ key: 'cantrips', label: 'Cantrips', data: { spells: createSpellListField(0) } },
		...spellSlotLevelMetadata.map(({ key, label }) => {
			const slot = char.systemData.spellcasting?.slots?.[key];
			return {
				key,
				label,
				slot,
				data: {
					...resolveGridFieldDescriptors(
						char,
						slot
							? [
									{
										key: `slot${key}Used`,
										fieldName: `${label} Used`,
										path: ['systemData', 'spellcasting', 'slots', key, 'used'],
										defaultValue: 0,
										valuePatchOperation: slot.used === undefined ? 'add' : 'replace',
										interaction: {
											editAffordance: 'persistent',
											annotationAffordance: 'persistent'
										}
									}
								]
							: [],
						{ annotationPathForValuePath: toSystemDataAnnotationPath }
					),
					slots: {
						fieldName: label,
						value: {
							used: withFieldAnnotations(slot?.used ?? 0, [
								'systemData',
								'spellcasting',
								'slots',
								key,
								'used'
							]),
							max: withFieldAnnotations(slot?.max ?? 0, [
								'systemData',
								'spellcasting',
								'slots',
								key,
								'max'
							])
						}
					},
					spells: createSpellListField(Number(key) as SpellListLevel)
				}
			};
		})
	];

	return {
		annotationEditorConfig,
		runtimeActionData,
		metaPrimaryData,
		metaSecondaryData,
		metaTertiaryData,
		quickRefPrimaryData,
		quickRefMovementData,
		quickRefSecondaryData,
		proficiencyBonusRuntimeData,
		abilityRuntimeColumns,
		traitRuntimeData,
		proficiencyLanguagesRuntimeData,
		proficiencyToolsRuntimeData,
		classFeaturesRuntimeData,
		inventoryCurrencyRuntimeData,
		inventoryRuntimeCards,
		organizationalBackgroundData,
		roleplayPrimaryData,
		roleplaySecondaryData,
		scratchpadNotesData,
		spellcastingRuntimeData,
		spellSlotRuntimeCards
	};
};
