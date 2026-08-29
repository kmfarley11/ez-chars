import { describe, expect, it } from 'vitest';
import { compare5e2014PriorityLabels } from '$lib/dnd5e2014/collectionPriority';
import {
	filterCollectionPriorityRows,
	getCollectionPriorityPreview,
	projectCollectionPriorityRows,
	type CollectionPriorityRow
} from '../collectionPriority';

const row = (
	identity: string,
	label: string,
	pinned = false,
	detail?: string
): CollectionPriorityRow => ({
	key: identity,
	identity,
	label,
	pinned,
	...(detail ? { detail } : {})
});

describe('collection priority projection', () => {
	it('partitions unlimited pins before unpinned rows and sorts each tier deterministically', () => {
		const source = [
			row('zeta', 'zeta'),
			row('pinned-2', 'Tool 2', true),
			row('accent', 'Éclair'),
			row('pinned-10', 'Tool 10', true),
			row('punctuation', "Thieves' tools")
		];

		const projected = projectCollectionPriorityRows(source, compare5e2014PriorityLabels);

		expect(projected.map(({ identity }) => identity)).toEqual([
			'pinned-10',
			'pinned-2',
			'accent',
			'punctuation',
			'zeta'
		]);
		expect(source.map(({ identity }) => identity)).toEqual([
			'zeta',
			'pinned-2',
			'accent',
			'pinned-10',
			'punctuation'
		]);
	});

	it('uses exact labels and stable identities to break normalized duplicate-label ties', () => {
		const projected = projectCollectionPriorityRows(
			[
				row('duplicate-b', 'éclair'),
				row('duplicate-a', 'éclair'),
				row('capitalized', 'Éclair'),
				row('case-variant', 'ECLAIR')
			],
			compare5e2014PriorityLabels
		);

		expect(projected.map(({ identity }) => identity)).toEqual([
			'case-variant',
			'capitalized',
			'duplicate-a',
			'duplicate-b'
		]);
	});

	it('filters canonical rows without changing relative priority order', () => {
		const projected = projectCollectionPriorityRows(
			[
				row('unpinned-arcane', 'Arcane Recovery', false, 'Wizard feature'),
				row('pinned-arcane', 'Arcane Ward', true, 'Wizard feature'),
				row('other', 'Darkvision', true, 'Ancestry trait')
			],
			compare5e2014PriorityLabels
		);

		expect(
			filterCollectionPriorityRows(projected, 'wizard').map(({ identity }) => identity)
		).toEqual(['pinned-arcane', 'unpinned-arcane']);
	});

	it('applies preview limits after priority projection without limiting Pin membership', () => {
		const projected = projectCollectionPriorityRows(
			Array.from({ length: 9 }, (_, index) => row(`pin-${index}`, `Pinned ${index}`, true)),
			compare5e2014PriorityLabels
		);
		const preview = getCollectionPriorityPreview(projected, 7);

		expect(projected).toHaveLength(9);
		expect(preview.rows).toHaveLength(7);
		expect(preview.remainingCount).toBe(2);
		expect(preview.rows.every(({ pinned }) => pinned)).toBe(true);
	});
});
