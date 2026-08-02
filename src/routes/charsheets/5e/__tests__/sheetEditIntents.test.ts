import { describe, expect, it } from 'vitest';
import { getValueAtGridPath } from '$utils/gridContentHelpers';
import { reduce5eSheetEditIntents, type SheetEditIntent } from '../sheetEditIntents';
import { createSheetEditCharacter } from './sheetEditFixtures';

const deterministicIds = (...ids: Array<string>) => {
	const pending = [...ids];
	return () => pending.shift() ?? 'unexpected-id';
};

describe('5e sheet edit intent reducer', () => {
	it('adds previously absent spell-slot levels and prunes untouched zero defaults', () => {
		const character = createSheetEditCharacter();
		delete character.systemData.spellcasting;

		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'replace-spell-slots',
				slots: {
					'1': { used: 0, max: 0 },
					'3': { used: 1, max: 2 },
					'9': { used: 0, max: 0 }
				}
			}
		]);

		expect(result).toMatchObject({
			ok: true,
			character: {
				systemData: {
					spellcasting: {
						ability: 'int',
						slots: { '3': { used: 1, max: 2 } }
					}
				}
			}
		});

		const zeroOnlyCharacter = createSheetEditCharacter();
		delete zeroOnlyCharacter.systemData.spellcasting;
		const zeroOnly = reduce5eSheetEditIntents(zeroOnlyCharacter, [
			{ type: 'replace-spell-slots', slots: { '1': { used: 0, max: 0 } } }
		]);
		expect(zeroOnly).toMatchObject({ ok: true });
		if (zeroOnly.ok) expect(zeroOnly.character.systemData.spellcasting).toBeUndefined();
	});

	it('reduces spells, actions, languages, and mixed-owner features while preserving identities', () => {
		const character = createSheetEditCharacter();
		const original = structuredClone(character);
		const intents: Array<SheetEditIntent> = [
			{
				type: 'replace-spell-level',
				level: 1,
				spells: [
					{ spellId: 'shield', name: 'Shield+', prepared: true },
					{ name: 'Magic Missile', prepared: true }
				]
			},
			{
				type: 'replace-runtime-actions',
				actions: [
					{ id: 'action-1', name: 'Longsword +1', timing: 'action' },
					{ name: 'Second Wind', timing: 'bonusAction', category: 'effect' }
				]
			},
			{
				type: 'replace-proficiency-languages',
				languages: [
					{ name: 'Elvish', source: 'ancestry' },
					{ name: 'Dwarvish', source: 'background' }
				]
			},
			{
				type: 'replace-proficiency-tools',
				tools: [
					{ name: 'Calligrapher supplies', source: 'background' },
					{ name: "Thieves' tools", source: 'class' }
				]
			},
			{
				type: 'replace-features',
				features: [
					{
						featureId: 'general-feature',
						name: 'Keen Mind+',
						owner: 'general'
					},
					{ name: 'Quick Study', owner: 'general' },
					{
						featureId: 'second-wind',
						name: 'Second Wind+',
						owner: 'class',
						classIndex: 0
					},
					{ name: 'Action Surge', owner: 'class', classIndex: 0 }
				]
			}
		];

		const result = reduce5eSheetEditIntents(character, intents, {
			createId: deterministicIds(
				'magic-missile',
				'second-wind-action',
				'quick-study',
				'action-surge'
			)
		});

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(character).toEqual(original);
		expect(result.character.systemData.spellcasting?.spells).toEqual([
			{ spellId: 'fire-bolt', name: 'Fire Bolt', level: 0 },
			{ spellId: 'shield', name: 'Shield+', level: 1, prepared: true },
			{ spellId: 'magic-missile', name: 'Magic Missile', level: 1, prepared: true }
		]);
		expect(result.character.systemData.runtimeActions).toEqual([
			expect.objectContaining({
				id: 'action-1',
				name: 'Longsword +1',
				source: { kind: 'item', id: 'weapon-1' },
				annotations: [expect.objectContaining({ id: 'action-note' })]
			}),
			expect.objectContaining({ id: 'second-wind-action', name: 'Second Wind' })
		]);
		expect(result.character.systemData.runtimeActions[1].source).toBeUndefined();
		expect(result.character.systemData.proficiencies.languages).toEqual([
			{ name: 'Elvish', source: { kind: 'ancestry' } },
			{ name: 'Dwarvish', source: { kind: 'background' } }
		]);
		expect(result.character.systemData.proficiencies.tools).toEqual([
			{
				name: 'Calligrapher supplies',
				source: { kind: 'background', sourceId: 'sage' },
				annotations: [expect.objectContaining({ id: 'tool-note' })]
			},
			{ name: "Thieves' tools", source: { kind: 'class' } }
		]);
		expect(result.character.features).toEqual([
			expect.objectContaining({
				id: 'general-feature',
				name: 'Keen Mind+',
				summary: 'Recall details accurately.',
				annotations: [expect.objectContaining({ id: 'general-feature-note' })]
			}),
			{ id: 'quick-study', name: 'Quick Study' }
		]);
		expect(result.character.systemData.classes[0]?.features).toEqual([
			expect.objectContaining({
				featureId: 'second-wind',
				name: 'Second Wind+',
				annotations: [expect.objectContaining({ id: 'feature-note' })]
			}),
			{ featureId: 'action-surge', name: 'Action Surge' }
		]);
	});

	it('accepts repeated suggestions with unique action IDs after revalidating the source', () => {
		const character = createSheetEditCharacter();
		const suggestion = {
			name: 'Longsword',
			notes: 'Suggested snapshot.',
			source: { kind: 'item' as const, id: 'weapon-1' }
		};
		const result = reduce5eSheetEditIntents(
			character,
			[
				{ type: 'create-runtime-action', draft: suggestion },
				{ type: 'create-runtime-action', draft: suggestion }
			],
			{ createId: deterministicIds('suggested-1', 'suggested-2') }
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.systemData.runtimeActions.slice(-2)).toEqual([
			{ ...suggestion, id: 'suggested-1' },
			{ ...suggestion, id: 'suggested-2' }
		]);
	});

	it('creates custom and linked actions from every eligible source kind', () => {
		const character = createSheetEditCharacter();
		const result = reduce5eSheetEditIntents(
			character,
			[
				{ type: 'create-runtime-action', draft: { name: 'Custom maneuver' } },
				{
					type: 'create-runtime-action',
					draft: {
						name: 'Shield',
						source: { kind: 'spell', id: 'shield' }
					}
				},
				{
					type: 'create-runtime-action',
					draft: {
						name: 'Keen Mind',
						source: { kind: 'feature', id: 'general-feature' }
					}
				},
				{
					type: 'create-runtime-action',
					draft: {
						name: 'Second Wind',
						source: { kind: 'feature', id: 'second-wind' }
					}
				},
				{
					type: 'create-runtime-action',
					draft: {
						name: 'Darkvision',
						source: { kind: 'feature', id: 'darkvision' }
					}
				}
			],
			{
				createId: deterministicIds(
					'custom-action',
					'spell-action',
					'general-action',
					'class-action',
					'trait-action'
				)
			}
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.systemData.runtimeActions.slice(-5)).toEqual([
			{ id: 'custom-action', name: 'Custom maneuver' },
			{ id: 'spell-action', name: 'Shield', source: { kind: 'spell', id: 'shield' } },
			{
				id: 'general-action',
				name: 'Keen Mind',
				source: { kind: 'feature', id: 'general-feature' }
			},
			{
				id: 'class-action',
				name: 'Second Wind',
				source: { kind: 'feature', id: 'second-wind' }
			},
			{
				id: 'trait-action',
				name: 'Darkvision',
				source: { kind: 'feature', id: 'darkvision' }
			}
		]);
	});

	it('rejects an ineligible background feature source without partial mutation', () => {
		const character = createSheetEditCharacter();
		character.systemData.background = {
			name: 'Sage',
			features: [{ featureId: 'researcher', name: 'Researcher' }]
		};
		const original = structuredClone(character);

		expect(
			reduce5eSheetEditIntents(
				character,
				[
					{
						type: 'create-runtime-action',
						draft: {
							name: 'Researcher',
							source: { kind: 'feature', id: 'researcher' }
						}
					}
				],
				{ createId: deterministicIds('must-not-be-used') }
			)
		).toMatchObject({
			ok: false,
			issues: [{ code: 'invalid-intent-target' }]
		});
		expect(character).toEqual(original);
	});

	it('rejects a stale suggestion without mutating the source character', () => {
		const character = createSheetEditCharacter();
		const original = structuredClone(character);
		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'create-runtime-action',
				draft: {
					name: 'Missing Sword',
					source: { kind: 'item', id: 'missing-item' }
				}
			}
		]);

		expect(result).toMatchObject({
			ok: false,
			issues: [{ code: 'invalid-intent-target' }]
		});
		expect(character).toEqual(original);
	});

	it('accepts an unequipped inventory suggestion', () => {
		const character = createSheetEditCharacter();
		character.inventory[0].equipped = false;
		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'create-runtime-action',
				draft: {
					name: 'Unequipped Sword',
					source: { kind: 'item', id: 'weapon-1' }
				}
			}
		]);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('Expected intent to succeed');
		expect(result.character.systemData.runtimeActions).toEqual(
			expect.arrayContaining([expect.objectContaining({ name: 'Unequipped Sword' })])
		);
	});

	it('resyncs only source-owned snapshot fields and clears removed notes', () => {
		const character = createSheetEditCharacter();
		const resynced = reduce5eSheetEditIntents(character, [
			{ type: 'resync-runtime-action', actionId: 'action-1' }
		]);

		expect(resynced.ok).toBe(true);
		if (!resynced.ok) return;
		expect(resynced.character.systemData.runtimeActions[0]).toEqual({
			id: 'action-1',
			name: 'Longsword',
			timing: 'action',
			category: 'attack',
			target: 'One creature',
			notes: 'Fresh item notes.',
			source: { kind: 'item', id: 'weapon-1' },
			annotations: [{ id: 'action-note', origin: 'user', kind: 'note', text: 'Reach 5 ft.' }]
		});

		delete resynced.character.inventory[0].notes;
		const cleared = reduce5eSheetEditIntents(resynced.character, [
			{ type: 'resync-runtime-action', actionId: 'action-1' }
		]);
		expect(cleared.ok).toBe(true);
		if (cleared.ok)
			expect(cleared.character.systemData.runtimeActions[0]).not.toHaveProperty('notes');
	});

	it('resyncs spell and general-feature notes while preserving notes on name-only sources', () => {
		const character = createSheetEditCharacter();
		character.systemData.runtimeActions.push(
			{
				id: 'spell-action',
				name: 'Old spell',
				notes: 'Old spell notes',
				source: { kind: 'spell', id: 'shield' }
			},
			{
				id: 'general-action',
				name: 'Old general',
				notes: 'Old general notes',
				source: { kind: 'feature', id: 'general-feature' }
			},
			{
				id: 'class-action',
				name: 'Old class',
				notes: 'Authored class notes',
				source: { kind: 'feature', id: 'second-wind' }
			},
			{
				id: 'trait-action',
				name: 'Old trait',
				notes: 'Authored trait notes',
				source: { kind: 'feature', id: 'darkvision' }
			}
		);
		character.systemData.spellcasting!.spells![1] = {
			spellId: 'shield',
			name: 'Shield+',
			level: 1,
			prepared: true
		};
		character.features[0].name = 'Keen Mind+';
		character.features[0].summary = '';
		character.features[0].description = 'Replacement description';
		character.systemData.classes[0].features![0].name = 'Second Wind+';
		character.systemData.race!.traits![0].name = 'Darkvision+';

		const result = reduce5eSheetEditIntents(character, [
			{ type: 'resync-runtime-action', actionId: 'spell-action' },
			{ type: 'resync-runtime-action', actionId: 'general-action' },
			{ type: 'resync-runtime-action', actionId: 'class-action' },
			{ type: 'resync-runtime-action', actionId: 'trait-action' }
		]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.systemData.runtimeActions.slice(-4)).toEqual([
			{
				id: 'spell-action',
				name: 'Shield+',
				source: { kind: 'spell', id: 'shield' }
			},
			{
				id: 'general-action',
				name: 'Keen Mind+',
				notes: 'Replacement description',
				source: { kind: 'feature', id: 'general-feature' }
			},
			{
				id: 'class-action',
				name: 'Second Wind+',
				notes: 'Authored class notes',
				source: { kind: 'feature', id: 'second-wind' }
			},
			{
				id: 'trait-action',
				name: 'Darkvision+',
				notes: 'Authored trait notes',
				source: { kind: 'feature', id: 'darkvision' }
			}
		]);
	});

	it('unlinks a spell snapshot after its spell-level edit removes the source', () => {
		const character = createSheetEditCharacter();
		character.systemData.runtimeActions.push({
			id: 'shield-action',
			name: 'Shield snapshot',
			notes: 'Keep the snapshot',
			source: { kind: 'spell', id: 'shield' }
		});

		const result = reduce5eSheetEditIntents(character, [
			{ type: 'replace-spell-level', level: 1, spells: [] }
		]);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.character.systemData.runtimeActions.at(-1)).toEqual({
				id: 'shield-action',
				name: 'Shield snapshot',
				notes: 'Keep the snapshot'
			});
		}
	});

	it('rejects resync when the action source cannot be resolved', () => {
		const character = createSheetEditCharacter();
		character.systemData.runtimeActions[0].source = { kind: 'item', id: 'missing-item' };

		expect(
			reduce5eSheetEditIntents(character, [{ type: 'resync-runtime-action', actionId: 'action-1' }])
		).toMatchObject({ ok: false, issues: [{ code: 'invalid-intent-target' }] });
	});

	it('unlinks every snapshot whose item is removed from an inventory group', () => {
		const character = createSheetEditCharacter();
		character.systemData.runtimeActions.push({
			id: 'action-2',
			name: 'Longsword two-handed',
			notes: '1d10 slashing',
			source: { kind: 'item', id: 'weapon-1' }
		});
		const originalSnapshots = structuredClone(character.systemData.runtimeActions);

		const result = reduce5eSheetEditIntents(character, [
			{ type: 'replace-inventory-group', group: 'weapons', items: [] }
		]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.inventory).toEqual([expect.objectContaining({ id: 'gear-1' })]);
		expect(result.character.systemData.runtimeActions).toEqual(
			originalSnapshots.map(({ source: _source, ...snapshot }) => snapshot)
		);
	});

	it('routes duplicate-named general and class features by explicit owner and unlinks deletions', () => {
		const character = createSheetEditCharacter();
		character.features[0].name = 'Shared Name';
		character.systemData.classes[0].subclass = 'Champion';
		character.systemData.classes[0].features![0].name = 'Shared Name';
		character.systemData.runtimeActions.push(
			{
				id: 'general-action',
				name: 'General snapshot',
				notes: 'Keep me',
				source: { kind: 'feature', id: 'general-feature' }
			},
			{
				id: 'class-action',
				name: 'Class snapshot',
				notes: 'Keep me too',
				source: { kind: 'feature', id: 'second-wind' }
			}
		);

		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'replace-features',
				features: [
					{
						featureId: 'second-wind',
						name: 'Shared Name+',
						owner: 'class',
						classIndex: 0
					}
				]
			}
		]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.features).toEqual([]);
		expect(result.character.systemData.classes[0].features).toEqual([
			expect.objectContaining({
				featureId: 'second-wind',
				name: 'Shared Name+',
				annotations: [expect.objectContaining({ id: 'feature-note' })]
			})
		]);
		expect(
			result.character.systemData.runtimeActions.find((action) => action.id === 'general-action')
		).not.toHaveProperty('source');
		expect(
			result.character.systemData.runtimeActions.find((action) => action.id === 'class-action')
		).toHaveProperty('source', { kind: 'feature', id: 'second-wind' });
	});

	it('edits ancestry Traits independently, preserves hidden data, allocates IDs, and unlinks deletions', () => {
		const character = createSheetEditCharacter();
		character.systemData.runtimeActions.push({
			id: 'trait-action',
			name: 'Darkvision snapshot',
			source: { kind: 'feature', id: 'darkvision' }
		});
		const updated = reduce5eSheetEditIntents(
			character,
			[
				{
					type: 'replace-traits',
					traits: [{ featureId: 'darkvision', name: 'Darkvision+' }, { name: 'Fey Ancestry' }]
				}
			],
			{ createId: deterministicIds('fey-ancestry') }
		);

		expect(updated.ok).toBe(true);
		if (!updated.ok) return;
		expect(updated.character.systemData.race?.traits).toEqual([
			expect.objectContaining({
				featureId: 'darkvision',
				name: 'Darkvision+',
				annotations: [expect.objectContaining({ id: 'trait-note' })]
			}),
			{ featureId: 'fey-ancestry', name: 'Fey Ancestry' }
		]);

		const deleted = reduce5eSheetEditIntents(updated.character, [
			{ type: 'replace-traits', traits: [] }
		]);
		expect(deleted.ok).toBe(true);
		if (deleted.ok) {
			expect(
				deleted.character.systemData.runtimeActions.find((action) => action.id === 'trait-action')
			).not.toHaveProperty('source');
		}
	});

	it('replaces one inventory group and updates currency without disturbing other records', () => {
		const character = createSheetEditCharacter();
		const result = reduce5eSheetEditIntents(
			character,
			[
				{
					type: 'replace-inventory-group',
					group: 'weapons',
					items: [
						{ id: 'weapon-1', name: 'Longsword +1', equipped: true },
						{ name: 'Battleaxe', equipped: true }
					]
				},
				{ type: 'update-currency', amounts: { gp: 9, sp: 3 } }
			],
			{ createId: deterministicIds('new-weapon') }
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.inventory).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: 'weapon-1',
					name: 'Longsword +1',
					annotations: [expect.objectContaining({ id: 'weapon-note' })]
				}),
				expect.objectContaining({ id: 'new-weapon', name: 'Battleaxe' }),
				expect.objectContaining({ id: 'gear-1', name: 'Rope' })
			])
		);
		expect(result.character.systemData.currency).toEqual({
			gp: { amount: 9 },
			sp: { amount: 3 }
		});
	});

	it('coalesces roleplay and scratchpad edits and replaces annotations with stable IDs', () => {
		const character = createSheetEditCharacter();
		const annotationPath = [
			'systemData',
			'annotations',
			'combat',
			'hitPoints',
			'current',
			'_annotations'
		];
		const result = reduce5eSheetEditIntents(
			character,
			[
				{
					type: 'replace-organizational-notes',
					roleplayBodies: { motives: 'New motive' },
					scratchpad: [
						{ id: 'scratch-1', title: 'Scratch', body: 'New scratch', kind: 'quick' },
						{ title: 'Session', body: 'Met a dragon', kind: 'session' }
					]
				},
				{
					type: 'replace-annotations',
					targetPath: annotationPath,
					annotations: [
						{ id: 'annotation-1', origin: 'user', kind: 'note', text: 'Existing ID' },
						{ origin: 'user', kind: 'note', text: 'New ID' }
					]
				}
			],
			{ createId: deterministicIds('new-note', 'annotation-2') }
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.notes).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'scratch-1', body: 'New scratch' }),
				expect.objectContaining({ id: 'new-note', body: 'Met a dragon' })
			])
		);
		expect(result.character.systemData.roleplay.motives).toEqual({
			body: 'New motive',
			annotations: [expect.objectContaining({ id: 'motive-note' })]
		});
		expect(getValueAtGridPath(result.character, annotationPath)).toEqual({
			'annotation-1': expect.objectContaining({ id: 'annotation-1', text: 'Existing ID' }),
			'annotation-2': expect.objectContaining({ id: 'annotation-2', text: 'New ID' })
		});
	});

	it('preserves explicit default and deletion behavior', () => {
		const character = createSheetEditCharacter();
		const result = reduce5eSheetEditIntents(character, [
			{ type: 'replace-runtime-actions', actions: [] },
			{ type: 'update-currency', amounts: { gp: 0 } },
			{
				type: 'replace-organizational-notes',
				roleplayBodies: { motives: '' },
				scratchpad: []
			}
		]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.systemData.runtimeActions).toEqual([]);
		expect(result.character.inventory).toEqual([
			expect.objectContaining({ id: 'weapon-1' }),
			expect.objectContaining({ id: 'gear-1' })
		]);
		expect(result.character.systemData.currency).toEqual({});
		expect(result.character.systemData.roleplay).toEqual({});
		expect(result.character.notes).toEqual([]);
	});

	it('updates proficiency provenance without creating ancestry source records', () => {
		const character = createSheetEditCharacter();
		delete character.systemData.race;
		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'replace-proficiency-languages',
				languages: [{ name: 'Elvish', source: 'ancestry' }]
			}
		]);

		expect(result).toMatchObject({
			ok: true,
			character: {
				systemData: {
					proficiencies: {
						languages: [{ name: 'Elvish', source: { kind: 'ancestry' } }]
					}
				}
			}
		});
		if (result.ok) expect(result.character.systemData.race).toBeUndefined();
	});

	it('fails atomically for an invalid semantic target without mutating the input', () => {
		const character = createSheetEditCharacter();
		const original = structuredClone(character);
		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'replace-runtime-actions',
				actions: [{ id: 'action-1', name: 'Changed first' }]
			},
			{
				type: 'replace-features',
				features: [{ name: 'Impossible', owner: 'class', classIndex: 3 }]
			}
		]);

		expect(result).toMatchObject({
			ok: false,
			issues: [{ code: 'invalid-intent-target' }]
		});
		expect(character).toEqual(original);
		expect(result).not.toHaveProperty('character');
	});

	it('validates the final candidate and returns explicit schema issues', () => {
		const character = createSheetEditCharacter();
		const invalidCharacter = {
			...character,
			identity: { ...character.identity, name: '' }
		};
		const result = reduce5eSheetEditIntents(invalidCharacter, []);

		expect(result).toMatchObject({
			ok: false,
			issues: [{ code: 'invalid-character' }]
		});
	});
});
