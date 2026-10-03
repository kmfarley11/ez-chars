import { describe, expect, it } from 'vitest';
import { create5e2014Character, characterDocument5e2014Schema } from '../../../../schema';
import { reduce5eSheetEditIntents, type SheetEditIntent } from '../sheetEditIntents';
import { createSheetEditCharacter } from './sheetEditFixtures';

const fixture = () =>
	create5e2014Character({
		inventory: [{ id: 'sword', name: 'Sword' }],
		systemData: {
			runtimeActions: [
				{ id: 'strike', name: 'Strike', source: { kind: 'item', id: 'sword' } },
				{ id: 'ward', name: 'Ward', timing: 'reaction' }
			]
		}
	});

describe('runtime action priority membership', () => {
	it.each([
		['item', 'weapon-1', { type: 'replace-inventory-group', group: 'weapons', items: [] }],
		['spell', 'shield', { type: 'replace-spell-level', level: 1, spells: [] }],
		['feature', 'general-feature', { type: 'replace-features', features: [] }],
		['feature', 'second-wind', { type: 'replace-features', features: [] }],
		['feature', 'darkvision', { type: 'replace-traits', traits: [] }]
	] satisfies Array<['item' | 'spell' | 'feature', string, SheetEditIntent]>)(
		'preserves an action pin when deleting %s source %s',
		(kind, id, intent) => {
			const character = createSheetEditCharacter();
			character.systemData.runtimeActions = [
				{ id: 'pinned', name: 'Snapshot', source: { kind, id } }
			];
			character.systemData.collectionPins = { runtimeActions: ['pinned'] };
			const before = structuredClone(character);
			const result = reduce5eSheetEditIntents(character, [intent]);
			expect(result.ok).toBe(true);
			if (!result.ok) return;
			expect(result.character.systemData.runtimeActions).toEqual([
				{ id: 'pinned', name: 'Snapshot' }
			]);
			expect(result.character.systemData.collectionPins?.runtimeActions).toEqual(['pinned']);
			expect(character).toEqual(before);
		}
	);

	it('accepts absent pins, round trips valid pins, and rejects duplicate/dangling/wrong-collection membership', () => {
		const character = fixture();
		expect(characterDocument5e2014Schema.safeParse(character).success).toBe(true);
		for (const identities of [['missing'], ['sword'], ['strike', 'strike']]) {
			const invalid = {
				...character,
				systemData: { ...character.systemData, collectionPins: { runtimeActions: identities } }
			};
			expect(characterDocument5e2014Schema.safeParse(invalid).success).toBe(false);
		}
		const pinned = reduce5eSheetEditIntents(character, [
			{ type: 'replace-collection-pins', collection: 'runtimeActions', identities: ['strike'] }
		]);
		expect(pinned.ok).toBe(true);
		if (!pinned.ok) return;
		expect(
			characterDocument5e2014Schema.parse(JSON.parse(JSON.stringify(pinned.character)))
		).toEqual(pinned.character);
		expect(character.systemData.collectionPins).toBeUndefined();
		const unpinned = reduce5eSheetEditIntents(pinned.character, [
			{ type: 'replace-collection-pins', collection: 'runtimeActions', identities: [] }
		]);
		expect(unpinned.ok && unpinned.character.systemData.collectionPins).toBeUndefined();
	});

	it('preserves membership on resync and detach, cleans removal atomically and rejects stale Pin', () => {
		const character = fixture();
		character.systemData.collectionPins = { runtimeActions: ['strike'], inventory: ['sword'] };
		const refreshed = reduce5eSheetEditIntents(character, [
			{ type: 'resync-runtime-action', actionId: 'strike' }
		]);
		expect(refreshed).toMatchObject({
			ok: true,
			character: { systemData: { collectionPins: { runtimeActions: ['strike'] } } }
		});
		const detached = reduce5eSheetEditIntents(character, [
			{ type: 'replace-inventory-group', group: 'weapons', items: [] }
		]);
		expect(detached.ok).toBe(true);
		if (!detached.ok) return;
		expect(detached.character.systemData.runtimeActions[0].source).toBeUndefined();
		expect(detached.character.systemData.runtimeActions.map((action) => action.id)).toEqual([
			'strike',
			'ward'
		]);
		expect(detached.character.systemData.collectionPins?.runtimeActions).toEqual(['strike']);
		const removal = reduce5eSheetEditIntents(character, [
			{ type: 'replace-runtime-actions', actions: [character.systemData.runtimeActions[1]] }
		]);
		expect(removal.ok).toBe(true);
		if (!removal.ok) return;
		expect(removal.character.systemData.collectionPins).toEqual({ inventory: ['sword'] });
		expect(
			reduce5eSheetEditIntents(removal.character, [
				{ type: 'replace-collection-pins', collection: 'runtimeActions', identities: ['strike'] }
			]).ok
		).toBe(false);
	});
});
