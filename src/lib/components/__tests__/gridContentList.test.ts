import { describe, expect, it } from 'vitest';
import {
	filterGridContentListRows,
	getGridContentListBrowseLabel,
	getGridContentListCountLabel,
	getGridContentListPreview,
	type GridContentListRow
} from '../gridContentList';

const rows: Array<GridContentListRow> = [
	{
		key: 'gear:rope-a',
		label: 'Rope',
		detail: '50 feet of silk rope',
		context: 'Quantity 2',
		badges: ['Inventory']
	},
	{
		key: 'gear:rock',
		label: 'Random rock',
		detail: 'Found in the XYZ dungeon and kept for sentimental reasons',
		annotations: [{ id: 'rock-note', origin: 'user', kind: 'note', text: 'Probably magical' }]
	},
	{
		key: 'gear:rope-b',
		label: 'Rope',
		detail: 'Hemp rope',
		searchText: 'climbing kit'
	},
	{ key: 'gear:bucket', label: 'Bucket' },
	{ key: 'gear:chalk', label: 'Chalk', detail: 'Ten white sticks' },
	{ key: 'gear:rations', label: 'Rations', detail: 'Seven days' }
];

describe('grid content list helpers', () => {
	it('preserves authored order while filtering labels, details, context, badges, and explicit text', () => {
		expect(filterGridContentListRows(rows, 'ROPE').map((row) => row.key)).toEqual([
			'gear:rope-a',
			'gear:rope-b'
		]);
		expect(filterGridContentListRows(rows, 'xyz dungeon').map((row) => row.key)).toEqual([
			'gear:rock'
		]);
		expect(filterGridContentListRows(rows, 'quantity 2').map((row) => row.key)).toEqual([
			'gear:rope-a'
		]);
		expect(filterGridContentListRows(rows, 'inventory').map((row) => row.key)).toEqual([
			'gear:rope-a'
		]);
		expect(filterGridContentListRows(rows, 'climbing kit').map((row) => row.key)).toEqual([
			'gear:rope-b'
		]);
	});

	it('returns every row for blank search and an empty list for no matches', () => {
		expect(filterGridContentListRows(rows, '   ')).toEqual(rows);
		expect(filterGridContentListRows(rows, 'portable hole')).toEqual([]);
		expect(filterGridContentListRows([], 'rope')).toEqual([]);
	});

	it('caps the preview at five rows and reports the exact remaining count', () => {
		expect(getGridContentListPreview(rows)).toEqual({
			rows: rows.slice(0, 5),
			remainingCount: 1
		});
		expect(getGridContentListPreview(rows.slice(0, 5))).toEqual({
			rows: rows.slice(0, 5),
			remainingCount: 0
		});
		expect(getGridContentListPreview([])).toEqual({ rows: [], remainingCount: 0 });
	});

	it('provides deterministic total, filtered, and focused-browse labels', () => {
		expect(getGridContentListCountLabel(6, 6, false)).toBe('6 items');
		expect(getGridContentListCountLabel(2, 6, true)).toBe('2 of 6 items');
		expect(getGridContentListCountLabel(1, 1, false)).toBe('1 item');
		expect(getGridContentListBrowseLabel(1)).toBe('Browse all 1 item');
		expect(getGridContentListBrowseLabel(12)).toBe('Browse all 12 items');
	});
});
