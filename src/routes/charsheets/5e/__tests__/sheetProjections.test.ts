import { describe, expect, it } from 'vitest';
import { create5e2014Character, type CharacterDocument5e2014 } from '../../../../schema';
import { project5eSheet } from '../sheetProjections';

const createProjectionCharacter = (): CharacterDocument5e2014 =>
	create5e2014Character({
		name: 'Projection Tester',
		meta: { id: 'projection-tester' },
		identity: {
			ancestryLineage: 'Elf',
			background: 'Sage',
			appearance: 'Blue cloak',
			description: 'A careful adventurer.'
		},
		inventory: [
			{ id: 'weapon-1', name: 'Longsword', equipped: true },
			{ id: 'armor-1', name: 'Chain mail', equipped: true },
			{ id: 'gear-1', name: 'Rope', quantity: 1 }
		],
		notes: [{ id: 'scratch-1', title: 'Reminder', body: 'Buy rations.', kind: 'quick' }],
		systemData: {
			level: 2,
			proficiencyBonus: 2,
			combat: {
				armorClass: 16,
				initiative: 3,
				speed: 30,
				hitPoints: { max: 18, current: 12 },
				hitDice: { total: '2d8', remaining: '1d8' }
			},
			race: {
				name: 'Elf',
				traits: [{ name: 'Darkvision' }]
			},
			background: { name: 'Sage' },
			currency: { gp: { amount: 12 } },
			roleplay: { motives: { body: 'Protect the party.' } },
			proficiencies: {
				languages: [
					{ name: 'Common', source: { kind: 'ancestry' } },
					{ name: 'Elvish', source: { kind: 'ancestry' } },
					{ name: 'Draconic', source: { kind: 'background' } }
				],
				tools: [{ name: 'Calligrapher supplies', source: { kind: 'background' } }]
			},
			classes: [
				{
					name: 'Wizard',
					level: 2,
					features: [{ name: 'Arcane Recovery', featureId: 'arcane-recovery' }],
					spellcasting: { ability: 'int' }
				}
			],
			runtimeActions: [
				{
					id: 'action-1',
					name: 'Longsword',
					timing: 'action',
					category: 'attack'
				}
			],
			spellcasting: {
				ability: 'int',
				spellSaveDC: 12,
				spellAttackBonus: 4,
				slots: { '1': { max: 3, used: 1 } },
				spells: [
					{ name: 'Fire Bolt', level: 0 },
					{ name: 'Magic Missile', level: 1, prepared: true }
				]
			},
			annotations: {
				combat: {
					hitPoints: {
						current: {
							_annotations: {
								'current-hp-note': {
									id: 'current-hp-note',
									origin: 'user',
									kind: 'note',
									text: 'Reduced by an ogre.'
								}
							}
						}
					}
				}
			}
		}
	});

describe('5e sheet projections', () => {
	it('projects every current sheet region into its existing card groups', () => {
		const projection = project5eSheet(createProjectionCharacter());

		expect(Object.keys(projection.metaPrimaryData)).toEqual(['name', 'classLevels']);
		expect(Object.keys(projection.quickRefPrimaryData)).toEqual([
			'currentHp',
			'tempHp',
			'maxHp',
			'initiative',
			'armorClass'
		]);
		expect(projection.abilityRuntimeColumns).toHaveLength(6);
		expect(projection.runtimeActionData.actions.value).toHaveLength(1);
		expect(projection.proficiencyLanguagesRuntimeData.languages.value).toHaveLength(3);
		expect(projection.classFeaturesRuntimeData.features.value).toHaveLength(1);
		expect(projection.traitRuntimeData.traits.value).toHaveLength(1);
		expect(projection.spellSlotRuntimeCards).toHaveLength(10);
		expect(projection.inventoryRuntimeCards.map((card) => card.key)).toEqual([
			'weapons',
			'armorShields',
			'other'
		]);
		expect(projection.inventoryCurrencyRuntimeData.gp.value).toBe(12);
		expect(projection.roleplayPrimaryData.motives.value).toBe('Protect the party.');
		expect(projection.scratchpadNotesData.notes.value).toHaveLength(1);
	});

	it('resolves annotations and optional direct-edit operations', () => {
		const character = createProjectionCharacter();
		delete character.systemData.combat.hitPoints.temp;
		const projection = project5eSheet(character);
		const currentHp = projection.quickRefPrimaryData.currentHp;
		const tempHp = projection.quickRefPrimaryData.tempHp;

		expect(currentHp.annotations).toEqual([
			expect.objectContaining({ id: 'current-hp-note', text: 'Reduced by an ogre.' })
		]);
		expect(currentHp.binding?.annotationPatchPath).toEqual([
			'systemData',
			'annotations',
			'combat',
			'hitPoints',
			'current',
			'_annotations'
		]);
		expect(tempHp.binding?.valuePatchOperation).toBe('add');
	});
});
