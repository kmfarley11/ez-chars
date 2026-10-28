import { describe, expect, it, vi } from 'vitest';
import { create5e2014Character } from '../system.5e2014';
import { create5e2024Character } from '../system-5e2024';
import {
	safeParseStoredCharacterDocument,
	safeParseStoredCharacterDocuments,
	serializeStoredCharacterDocuments
} from '../storedCharacters';
import { itemIdentitySchema } from '../zod/core';

const clock = '2026-10-16T00:00:00.000Z';
const dependencies = () => ({ createId: vi.fn(() => 'fixed-id'), nowIso: vi.fn(() => clock) });

describe('explicit supported-system envelope', () => {
	it.each([create5e2014Character, create5e2024Character])(
		'injects identity/time once and returns detached documents',
		(create) => {
			const deps = dependencies();
			const first = create({}, deps);
			const second = create({}, dependencies());
			expect(first).toEqual(second);
			expect(first).not.toBe(second);
			expect(deps.createId).toHaveBeenCalledTimes(1);
			expect(deps.nowIso).toHaveBeenCalledTimes(1);
			expect(first.meta).toMatchObject({ id: 'fixed-id', createdAt: clock, updatedAt: clock });
			expect(Object.keys(first).sort()).toEqual(['meta', 'system', 'systemData']);
			expect(Object.keys(first.system).sort()).toEqual(['id', 'version']);
		}
	);

	it('retains sparse absence rather than fabricating class, ability, combat or casting values', () => {
		const character = create5e2024Character({}, dependencies());
		expect(character.systemData).toEqual({
			identity: {},
			inventory: [],
			runtimeActions: [],
			notes: []
		});
		expect(character.system.version).toBe('SRD-5.2.1');
		expect(character.meta.schemaVersion).toBe('dnd5e-2024.schema.v0');
		expect(itemIdentitySchema.parse({ id: 'record', name: 'Any game item' })).toEqual({
			id: 'record',
			name: 'Any game item'
		});
	});

	it('preserves both systems, note owners, priority, sources and absence over repeated mixed round trips', () => {
		const original = [
			create5e2014Character(
				{
					annotations: [{ id: 'root-note', origin: 'user', kind: 'note', text: 'Whole character' }],
					inventory: [
						{
							id: 'sword',
							name: 'Sword',
							category: 'weapons',
							annotations: [{ origin: 'user', kind: 'note', text: 'Keep item note' }]
						}
					],
					systemData: {
						annotations: {
							identity: {
								name: {
									_annotations: { named: { origin: 'user', kind: 'note', text: 'Only name' } }
								}
							}
						},
						collectionPins: { inventory: ['sword'] },
						runtimeActions: [
							{ id: 'strike', name: 'Strike', source: { kind: 'item', id: 'sword' } }
						]
					}
				},
				dependencies()
			),
			create5e2024Character(
				{
					systemData: {
						combat: { hitPoints: { current: 0 } },
						fieldNotes: {
							'/systemData/identity/species': [
								{ origin: 'user', kind: 'note', text: 'Unknown origin' }
							]
						}
					}
				},
				{ ...dependencies(), createId: () => 'second-id' }
			)
		];
		const serialized = JSON.parse(JSON.stringify(serializeStoredCharacterDocuments(original)));
		const parsed = safeParseStoredCharacterDocuments(serialized);
		expect(parsed).toEqual({ success: true, data: original });
		if (!parsed.success) throw new Error('Expected valid mixed documents');
		expect(
			safeParseStoredCharacterDocuments(serializeStoredCharacterDocuments(parsed.data))
		).toEqual(parsed);
	});

	it('rejects unknown systems, future versions, mismatched identities and unapproved payload fields atomically', () => {
		const current = create5e2024Character({}, dependencies());
		const invalid = [
			{ ...current, system: { ...current.system, id: 'unknown' } },
			{ ...current, meta: { ...current.meta, schemaVersion: 'dnd5e-2024.schema.v1' } },
			{ ...current, meta: { ...current.meta, schemaVersion: 'dnd5e-2014.schema.v0' } },
			{ ...current, system: { ...current.system, id: 'dnd5e-2014' } },
			{ ...current, system: { ...current.system, version: 'SRD-unknown' } },
			{ ...current, systemData: { ...current.systemData, inventedRule: true } }
		];
		for (const value of invalid) {
			const before = structuredClone(value);
			expect(safeParseStoredCharacterDocument(value).success).toBe(false);
			expect(safeParseStoredCharacterDocuments([current, value]).success).toBe(false);
			expect(value).toEqual(before);
		}
	});

	it('rejects the earlier 2014 v0 envelope instead of silently rebasing user storage', () => {
		const current = create5e2014Character({}, dependencies());
		const { identity, inventory, features, notes, provenance, ...systemData } = current.systemData;
		const previous = {
			...current,
			system: { ...current.system, ...provenance },
			identity,
			inventory,
			features,
			notes,
			systemData
		};
		expect(safeParseStoredCharacterDocument(previous)).toEqual({ success: false });
	});

	it('rejects missing category, duplicate records, stale pins and invalid authored numbers', () => {
		const character = create5e2024Character({}, dependencies());
		for (const payload of [
			{ inventory: [{ id: 'item', name: 'Item' }] },
			{
				runtimeActions: [
					{ id: 'same', name: 'First' },
					{ id: 'same', name: 'Second' }
				]
			},
			{ collectionPins: { inventory: ['missing'] } },
			{
				inventory: [{ id: 'item', name: 'Item', category: 'other' }],
				collectionPins: { inventory: ['item', 'item'] }
			},
			{ combat: { hitPoints: { current: -1 } } }
		])
			expect(
				safeParseStoredCharacterDocument({
					...character,
					systemData: { ...character.systemData, ...payload }
				}).success
			).toBe(false);
	});

	it('rejects dangling, partial and unsupported 2024 source references without mutation', () => {
		const character = create5e2024Character(
			{
				systemData: {
					inventory: [{ id: 'item', name: 'Same name', category: 'other' }],
					runtimeActions: [{ id: 'action', name: 'Snapshot', source: { kind: 'item', id: 'item' } }]
				}
			},
			dependencies()
		);
		for (const source of [
			{ kind: 'item', id: 'missing' },
			{ kind: 'item', id: '' },
			{ kind: 'item' },
			{ id: 'item' },
			{ kind: 'spell', id: 'item' },
			{ kind: 'item', id: 'item', extra: true }
		]) {
			const invalid = {
				...character,
				systemData: {
					...character.systemData,
					runtimeActions: [{ id: 'action', name: 'Snapshot', source }]
				}
			};
			const before = structuredClone(invalid);
			expect(safeParseStoredCharacterDocument(invalid).success).toBe(false);
			expect(safeParseStoredCharacterDocuments([character, invalid]).success).toBe(false);
			expect(invalid).toEqual(before);
		}
	});
});
