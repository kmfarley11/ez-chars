import type { GridContentAnnotation } from '$utils/gridContentTypes';

export const GRID_CONTENT_LIST_PREVIEW_LIMIT = 5;

export type GridContentListRow = {
	key: string;
	label: string;
	detail?: string;
	context?: string;
	groupLabel?: string;
	badges?: ReadonlyArray<string>;
	annotations?: Array<GridContentAnnotation>;
	searchText?: string;
};

export type GridContentListRowAction = (row: GridContentListRow, restoreFocus: () => void) => void;

export type GridContentListPreview<TRow extends GridContentListRow = GridContentListRow> = {
	rows: Array<TRow>;
	remainingCount: number;
};

const normalizeSearchText = (value: string): string => value.trim().toLocaleLowerCase();

const getRowSearchText = (row: GridContentListRow): string =>
	[row.label, row.detail, row.context, ...(row.badges ?? []), row.searchText]
		.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
		.join(' ');

export const filterGridContentListRows = <TRow extends GridContentListRow>(
	rows: ReadonlyArray<TRow>,
	query: string
): Array<TRow> => {
	const normalizedQuery = normalizeSearchText(query);
	if (normalizedQuery.length === 0) return [...rows];

	return rows.filter((row) => normalizeSearchText(getRowSearchText(row)).includes(normalizedQuery));
};

export const getGridContentListPreview = <TRow extends GridContentListRow>(
	rows: ReadonlyArray<TRow>,
	limit = GRID_CONTENT_LIST_PREVIEW_LIMIT
): GridContentListPreview<TRow> => {
	const normalizedLimit = Number.isFinite(limit) ? Math.max(0, Math.trunc(limit)) : 0;
	const previewRows = rows.slice(0, normalizedLimit);
	return {
		rows: previewRows,
		remainingCount: Math.max(0, rows.length - previewRows.length)
	};
};

export const getGridContentListCountLabel = (
	visibleCount: number,
	totalCount: number,
	hasQuery: boolean
): string =>
	hasQuery
		? `${visibleCount} of ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`
		: `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;

export const getGridContentListBrowseLabel = (totalCount: number): string =>
	`Browse all ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;
