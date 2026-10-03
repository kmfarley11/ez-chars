import { describe, expect, it } from 'vitest';
import { create5e2014Character } from '../../../schema';
import { projectRuntimeActionRows } from '../../../routes/charsheets/5e/components/runtimeActionRows';
import { projectPrioritizedSpellDenseCollectionRows } from '../denseCollectionRows';
import {
	emptyActionFilters,
	emptySpellFilters,
	retrieveRuntimeActions,
	retrieveSpells
} from '../collectionQuickfilters';

describe('collection quickfilter projection', () => {
	it('combines timing alternatives with tokenized snapshot search and preserves canonical order', () => {
		const character = create5e2014Character();
		const actions = [
			{ id: 'z', name: 'Ward', timing: 'reaction' as const, notes: 'Ice shield' },
			{ id: 'b', name: 'Ward', notes: 'Ice shield' },
			{ id: 'a', name: 'Ward', timing: 'bonusAction' as const },
			{ id: 'c', name: 'Ward', notes: 'Ice shield' }
		];
		const rows = projectRuntimeActionRows(actions, character);
		const before = structuredClone(rows);
		const pins = new Set(['z', 'a']);
		const filters = { query: 'shield ice', timings: ['action', 'reaction'] };
		expect(retrieveRuntimeActions(rows, filters, pins)).toMatchObject({
			total: 4,
			filtered: 3,
			narrowed: true,
			rows: [{ id: 'z' }, { id: 'b' }, { id: 'c' }]
		});
		expect(retrieveRuntimeActions(rows, { ...filters, timings: [] }, pins).filtered).toBe(3);
		expect(retrieveRuntimeActions(rows, { ...filters, query: '' }, pins).filtered).toBe(3);
		expect(
			retrieveRuntimeActions(rows, emptyActionFilters(), pins).rows.map((row) => row.id)
		).toEqual(['a', 'z', 'b', 'c']);
		expect(retrieveRuntimeActions(rows, { query: '', timings: ['free'] }, pins)).toMatchObject({
			filtered: 0,
			total: 4,
			narrowed: true
		});
		expect(rows).toEqual(before);
		expect(pins).toEqual(new Set(['z', 'a']));
		expect(rows[1].categoryLabel).toBeUndefined();
	});

	it('uses recorded preparation and effective levels, preserving pinned/level order', () => {
		const spells = [
			{ spellId: 'z', name: 'Zeta', level: 2 as const, prepared: true },
			{ spellId: 'a', name: 'Alpha', level: 1 as const, prepared: false },
			{ spellId: 'c', name: 'Cantrip' },
			{ spellId: 'b', name: 'Beta', level: 1 as const, prepared: true }
		];
		const rows = projectPrioritizedSpellDenseCollectionRows(spells, new Set(['z']));
		const before = structuredClone(spells);
		const filters = { query: '', levels: ['1', '2'], preparedOnly: true };
		expect(retrieveSpells(rows, spells, filters).rows.map((row) => row.identity)).toEqual([
			'z',
			'b'
		]);
		expect(retrieveSpells(rows, spells, { ...filters, query: 'beta' }).filtered).toBe(1);
		expect(retrieveSpells(rows, spells, { ...filters, preparedOnly: false }).filtered).toBe(3);
		expect(retrieveSpells(rows, spells, { ...filters, levels: ['0'] }).filtered).toBe(0);
		expect(
			retrieveSpells(rows, spells, { ...emptySpellFilters(), levels: ['0'] }).rows[0].identity
		).toBe('c');
		expect(retrieveSpells(rows, spells, emptySpellFilters())).toMatchObject({
			total: 4,
			filtered: 4,
			narrowed: false
		});
		expect(spells).toEqual(before);
	});
});
