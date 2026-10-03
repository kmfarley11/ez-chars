import { compareCollectionPriorityRows } from '$components/collectionPriority';
import { filterGridContentListRows } from '$components/gridContentList';
import { compare5e2014PriorityLabels } from './collectionPriority';
import { filterRuntimeActionRows, timingLabels, type RuntimeActionRow } from './runtimeActionRows';
import type { Dnd5e2014DenseCollectionRow } from './denseCollectionRows';
import type { RuntimeAction, SpellLevel, SpellRef } from '../../schema';

export type ActionTiming = NonNullable<RuntimeAction['timing']>;
export const actionTimingOptions = (Object.keys(timingLabels) as ActionTiming[]).map((key) => ({
	key,
	label: timingLabels[key]
}));
export const spellLevelOptions = ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((level) => ({
	key: String(level),
	label: level === 0 ? 'Cantrip' : String(level)
}));

export type ActionFilters = { query: string; timings: ReadonlyArray<string> };
export type SpellFilters = { query: string; levels: ReadonlyArray<string>; preparedOnly: boolean };
export const emptyActionFilters = (): ActionFilters => ({ query: '', timings: [] });
export const emptySpellFilters = (): SpellFilters => ({
	query: '',
	levels: [],
	preparedOnly: false
});

export type PrioritizedActionRow = RuntimeActionRow & { pinned: boolean; groupLabel?: string };

export const retrieveRuntimeActions = (
	rows: ReadonlyArray<RuntimeActionRow>,
	filters: ActionFilters,
	pins: ReadonlySet<string> = new Set(),
	showTimingHeadings = true
) => {
	const timing = (row: RuntimeActionRow): ActionTiming => row.timing ?? 'action';
	const rank = (row: RuntimeActionRow) =>
		actionTimingOptions.findIndex(({ key }) => key === timing(row));
	const matches = filterRuntimeActionRows(rows, filters.query)
		.filter((row) => filters.timings.length === 0 || filters.timings.includes(timing(row)))
		.map((row) => ({ ...row, pinned: pins.has(row.id) }));
	matches.sort((left, right) => {
		if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
		if (!left.pinned && rank(left) !== rank(right)) return rank(left) - rank(right);
		return compareCollectionPriorityRows(
			{ ...left, key: left.id, identity: left.id, label: left.name },
			{ ...right, key: right.id, identity: right.id, label: right.name },
			compare5e2014PriorityLabels
		);
	});
	const multipleTimings = new Set(matches.filter((row) => !row.pinned).map(timing)).size > 1;
	const result: PrioritizedActionRow[] = matches.map((row) => ({
		...row,
		groupLabel: row.pinned
			? 'Pinned actions'
			: showTimingHeadings && multipleTimings
				? row.timingLabel
				: undefined
	}));
	return {
		rows: result,
		total: rows.length,
		filtered: result.length,
		narrowed: !!filters.query.trim() || filters.timings.length > 0
	};
};

// Rows already carry the domain's global pinned tier and level/name ordering.
// Preparation is read from records, never inferred from the "Not prepared" search text.
export const retrieveSpells = (
	rows: ReadonlyArray<Dnd5e2014DenseCollectionRow>,
	spells: ReadonlyArray<SpellRef>,
	filters: SpellFilters
) => {
	const prepared = new Set(
		spells.filter((spell) => spell.prepared === true).map((spell) => spell.spellId)
	);
	const matches = filterGridContentListRows(rows, filters.query).filter(
		(row) =>
			row.source.kind === 'spell' &&
			(filters.levels.length === 0 ||
				filters.levels.includes(String(row.source.level satisfies SpellLevel))) &&
			(!filters.preparedOnly || prepared.has(row.source.id))
	);
	return {
		rows: matches,
		total: rows.length,
		filtered: matches.length,
		narrowed: !!filters.query.trim() || filters.levels.length > 0 || filters.preparedOnly
	};
};
