import { describe, expect, it } from 'vitest';
import { getCollectionPriorityPreview } from '$components/collectionPriority';
import { filterGridContentListRows } from '$components/gridContentList';
import { create5e2014Character, type Item, type SpellRef } from '../../../schema';
import { merge5e2014InventoryGroupPins, set5e2014CollectionPins } from '../collectionPriority';
import {
	projectPrioritizedInventoryDenseCollectionRows,
	projectPrioritizedSpellDenseCollectionRows
} from '../denseCollectionRows';

const inventory: Array<Item> = [
	{ id: 'weapon-z', name: 'Zweihander', tags: ['inventory:weapon'] },
	{ id: 'weapon-a', name: 'Arbalest', tags: ['inventory:weapon'] },
	{ id: 'armor-z', name: 'Scale mail', tags: ['inventory:armor-shield'] },
	{ id: 'armor-a', name: 'Breastplate', tags: ['inventory:armor-shield'] },
	{ id: 'gear-z', name: 'Waterskin' },
	{ id: 'gear-a', name: 'Bedroll' }
];

describe('prioritized 5e inventory projection', () => {
	it('projects each inventory group as a local pinned tier followed by alphabetical rows', () => {
		const pins = new Set(['weapon-z', 'armor-z', 'gear-z']);

		expect(
			projectPrioritizedInventoryDenseCollectionRows(inventory, 'weapons', pins).map(
				({ identity, pinned }) => [identity, pinned]
			)
		).toEqual([
			['weapon-z', true],
			['weapon-a', false]
		]);
		expect(
			projectPrioritizedInventoryDenseCollectionRows(inventory, 'armorShields', pins).map(
				({ identity, pinned }) => [identity, pinned]
			)
		).toEqual([
			['armor-z', true],
			['armor-a', false]
		]);
		expect(
			projectPrioritizedInventoryDenseCollectionRows(inventory, 'other', pins).map(
				({ identity, pinned }) => [identity, pinned]
			)
		).toEqual([
			['gear-z', true],
			['gear-a', false]
		]);
	});

	it('uses stable identity to order duplicate names and leaves every unlimited Pin reachable', () => {
		const duplicateRopes = Array.from({ length: 8 }, (_, index) => ({
			id: `rope-${String.fromCharCode(104 - index)}`,
			name: 'Rope'
		}));
		const rows = projectPrioritizedInventoryDenseCollectionRows(
			duplicateRopes,
			'other',
			new Set(duplicateRopes.map(({ id }) => id))
		);
		const preview = getCollectionPriorityPreview(rows, 5);

		expect(rows.map(({ identity }) => identity)).toEqual([
			'rope-a',
			'rope-b',
			'rope-c',
			'rope-d',
			'rope-e',
			'rope-f',
			'rope-g',
			'rope-h'
		]);
		expect(preview.rows).toHaveLength(5);
		expect(preview.remainingCount).toBe(3);
		expect(rows.every(({ pinned }) => pinned)).toBe(true);
	});

	it('replaces only the managed group draft while preserving other inventory-group Pins', () => {
		const character = set5e2014CollectionPins(create5e2014Character({ inventory }), 'inventory', [
			'weapon-z',
			'armor-z',
			'gear-z'
		]);

		expect(merge5e2014InventoryGroupPins(character, 'other', ['gear-a'])).toEqual([
			'armor-z',
			'weapon-z',
			'gear-a'
		]);
	});
});

const spells: Array<SpellRef> = [
	{ spellId: 'cantrip-acid', name: 'Acid Splash', level: 0 },
	{ spellId: 'cantrip-shield', name: 'Shield', level: 0, prepared: true },
	{ spellId: 'level-one-magic', name: 'Magic Missile', level: 1, prepared: true },
	{ spellId: 'level-one-shield', name: 'Shield', level: 1, prepared: false },
	{ spellId: 'level-three-fireball', name: 'Fireball', level: 3, prepared: true },
	{ spellId: 'level-seven-teleport', name: 'Teleport', level: 7, prepared: false }
];

describe('prioritized 5e spell projection', () => {
	it('projects one alphabetical pinned tier followed by alphabetical level groups without duplication', () => {
		const rows = projectPrioritizedSpellDenseCollectionRows(
			spells,
			new Set(['level-seven-teleport', 'level-three-fireball'])
		);

		expect(rows.map(({ identity, groupLabel }) => [identity, groupLabel])).toEqual([
			['level-three-fireball', 'Pinned spells'],
			['level-seven-teleport', 'Pinned spells'],
			['cantrip-acid', 'Cantrips'],
			['cantrip-shield', 'Cantrips'],
			['level-one-magic', '1st-level spells'],
			['level-one-shield', '1st-level spells']
		]);
		expect(new Set(rows.map(({ identity }) => identity)).size).toBe(spells.length);
		expect(rows.find(({ identity }) => identity === 'level-seven-teleport')?.context).toBe(
			'Spell level 7 · Not prepared'
		);
	});

	it('returns an unpinned spell to its level group and keeps duplicate-name search priority-first', () => {
		const rows = projectPrioritizedSpellDenseCollectionRows(spells, new Set(['level-one-shield']));
		const matchingShields = filterGridContentListRows(rows, 'shield');

		expect(
			matchingShields.map(({ identity, pinned, groupLabel }) => [identity, pinned, groupLabel])
		).toEqual([
			['level-one-shield', true, 'Pinned spells'],
			['cantrip-shield', false, 'Cantrips']
		]);

		const unpinnedRows = projectPrioritizedSpellDenseCollectionRows(spells);
		expect(unpinnedRows.find(({ identity }) => identity === 'level-one-shield')?.groupLabel).toBe(
			'1st-level spells'
		);
		expect(unpinnedRows.filter(({ identity }) => identity === 'level-one-shield')).toHaveLength(1);
	});

	it('keeps every unlimited cross-level Pin reachable beyond the phone preview', () => {
		const unlimitedSpells = Array.from({ length: 8 }, (_, index) => ({
			spellId: `spell-${8 - index}`,
			name: `Prepared option ${8 - index}`,
			level: (index % 5) as 0 | 1 | 2 | 3 | 4
		}));
		const rows = projectPrioritizedSpellDenseCollectionRows(
			unlimitedSpells,
			new Set(unlimitedSpells.map(({ spellId }) => spellId))
		);
		const preview = getCollectionPriorityPreview(rows, 5);

		expect(rows.every(({ pinned, groupLabel }) => pinned && groupLabel === 'Pinned spells')).toBe(
			true
		);
		expect(preview.rows.map(({ label }) => label)).toEqual([
			'Prepared option 1',
			'Prepared option 2',
			'Prepared option 3',
			'Prepared option 4',
			'Prepared option 5'
		]);
		expect(preview.remainingCount).toBe(3);
	});
});
