import { describe, expect, it } from 'vitest';
import type { Item } from '../../../../schema';
import { suggest5eInventoryRuntimeActions } from '../suggestInventoryRuntimeActions';

describe('suggest5eInventoryRuntimeActions', () => {
	it('returns equipped item snapshots in stable inventory order', async () => {
		const items: Item[] = [
			{ id: 'sword-1', name: 'Longsword', equipped: true, notes: '1d8 slashing' },
			{ id: 'rope-1', name: 'Rope', equipped: false, notes: '50 feet' },
			{ id: 'bow-1', name: 'Longbow', equipped: true, notes: '1d8 piercing' }
		];

		await expect(suggest5eInventoryRuntimeActions(items)).resolves.toEqual([
			{
				name: 'Longsword',
				notes: '1d8 slashing',
				source: { kind: 'item', id: 'sword-1' }
			},
			{
				name: 'Longbow',
				notes: '1d8 piercing',
				source: { kind: 'item', id: 'bow-1' }
			}
		]);
	});

	it('omits absent notes and never preallocates persisted action identity', async () => {
		const [suggestion] = await suggest5eInventoryRuntimeActions([
			{ id: 'shield-1', name: 'Shield', equipped: true }
		]);

		expect(suggestion).toEqual({
			name: 'Shield',
			source: { kind: 'item', id: 'shield-1' }
		});
		expect(suggestion).not.toHaveProperty('id');
		expect(suggestion).not.toHaveProperty('annotations');
	});

	it('returns an empty list for empty or wholly unequipped inventory', async () => {
		await expect(suggest5eInventoryRuntimeActions([])).resolves.toEqual([]);
		await expect(
			suggest5eInventoryRuntimeActions([{ id: 'pack-1', name: 'Backpack' }])
		).resolves.toEqual([]);
	});
});
