import { describe, expect, it } from 'vitest';
import type { Item } from '../../../../schema';
import {
	filterAndSortInventoryItems,
	suggest5eInventoryRuntimeActions,
	toRuntimeActionSuggestion
} from '../suggestInventoryRuntimeActions';

describe('filterAndSortInventoryItems', () => {
	const items: Item[] = [
		{ id: '1', name: 'Longsword', equipped: true, notes: '1d8 slashing' },
		{ id: '2', name: 'Shortsword', equipped: false, notes: '1d6 piercing' },
		{ id: '3', name: 'Health Potion', equipped: false, notes: 'Heals 2d4+2' },
		{ id: '4', name: 'Magic Sword of Healing', equipped: true }
	];

	it('returns items equipped-first, preserving original order within groups', () => {
		const result = filterAndSortInventoryItems(items, '', false);
		expect(result.map((s) => s.name)).toEqual([
			'Longsword',
			'Magic Sword of Healing',
			'Shortsword',
			'Health Potion'
		]);
	});

	it('returns an empty list for empty inventory', () => {
		expect(filterAndSortInventoryItems([], '', false)).toEqual([]);
	});

	it('filters by equipped status', () => {
		const result = filterAndSortInventoryItems(items, '', true);
		expect(result.map((s) => s.name)).toEqual(['Longsword', 'Magic Sword of Healing']);
	});

	it('returns all when query is empty or whitespace', () => {
		expect(filterAndSortInventoryItems(items, '', false)).toEqual(
			filterAndSortInventoryItems(items, '   ', false)
		);
	});

	it('filters by name (case-insensitive)', () => {
		const result = filterAndSortInventoryItems(items, 'SWORD', false);
		expect(result.map((s) => s.name)).toEqual([
			'Longsword',
			'Magic Sword of Healing',
			'Shortsword'
		]);
	});

	it('filters by notes (case-insensitive)', () => {
		const result = filterAndSortInventoryItems(items, 'PIERCING', false);
		expect(result.map((s) => s.name)).toEqual(['Shortsword']);
	});

	it('filters across name and notes using tokenized matching', () => {
		// "sword healing"
		const result = filterAndSortInventoryItems(items, 'sword healing', false);
		expect(result.map((s) => s.name)).toEqual(['Magic Sword of Healing']);

		// "sword slashing"
		const result2 = filterAndSortInventoryItems(items, 'Slashing Sword', false);
		expect(result2.map((s) => s.name)).toEqual(['Longsword']);
	});
});

describe('toRuntimeActionSuggestion', () => {
	it('omits absent notes and never preallocates persisted action identity', () => {
		const suggestion = toRuntimeActionSuggestion({
			id: 'shield-1',
			name: 'Shield',
			equipped: true
		});

		expect(suggestion).toEqual({
			name: 'Shield',
			source: { kind: 'item', id: 'shield-1' }
		});
		expect(suggestion).not.toHaveProperty('id');
		expect(suggestion).not.toHaveProperty('annotations');
	});
});

describe('suggest5eInventoryRuntimeActions', () => {
	it('returns suggestions for both equipped and unequipped items', async () => {
		const items: Item[] = [
			{ id: '1', name: 'Longsword', equipped: true },
			{ id: '2', name: 'Rope', equipped: false }
		];
		const suggestions = await suggest5eInventoryRuntimeActions(items);
		expect(suggestions.length).toBe(2);
		expect(suggestions.map((s) => s.name)).toEqual(['Longsword', 'Rope']);
	});
});
