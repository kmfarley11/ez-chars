import {
	filterGridContentListRows,
	getGridContentListPreview,
	type GridContentListPreview,
	type GridContentListRow
} from './gridContentList';

export type CollectionPriorityRow = GridContentListRow & {
	identity: string;
	pinned: boolean;
};

export type CollectionPriorityLabelComparator = (left: string, right: string) => number;

export type CollectionPrioritySaveResult = { ok: true } | { ok: false; message: string };
export type CollectionPrioritySave = (
	identities: ReadonlyArray<string>
) => CollectionPrioritySaveResult | Promise<CollectionPrioritySaveResult>;

const compareCodePoints = (left: string, right: string): number =>
	left < right ? -1 : left > right ? 1 : 0;

export const compareCollectionPriorityRows = <TRow extends CollectionPriorityRow>(
	left: TRow,
	right: TRow,
	compareLabels: CollectionPriorityLabelComparator
): number => {
	if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
	return (
		compareLabels(left.label, right.label) ||
		compareCodePoints(left.label, right.label) ||
		compareCodePoints(left.identity, right.identity)
	);
};

export const projectCollectionPriorityRows = <TRow extends CollectionPriorityRow>(
	rows: ReadonlyArray<TRow>,
	compareLabels: CollectionPriorityLabelComparator
): Array<TRow> =>
	[...rows].sort((left, right) => compareCollectionPriorityRows(left, right, compareLabels));

export const filterCollectionPriorityRows = <TRow extends CollectionPriorityRow>(
	canonicalRows: ReadonlyArray<TRow>,
	query: string
): Array<TRow> => filterGridContentListRows(canonicalRows, query);

export const getCollectionPriorityPreview = <TRow extends CollectionPriorityRow>(
	canonicalRows: ReadonlyArray<TRow>,
	limit: number
): GridContentListPreview<TRow> => getGridContentListPreview(canonicalRows, limit);
