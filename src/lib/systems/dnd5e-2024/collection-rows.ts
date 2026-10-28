import type { CharacterDocument5e2024 } from '../../../schema/system-5e2024';
import { filterGridContentListRows } from '$lib/ui/molecules/grid-content-list';
import {
	compareCollectionPriorityRows,
	type CollectionPriorityRow
} from '$lib/ui/molecules/collection-priority';
import { actionTimings, inventoryCategories, type RecordKind } from './editing/sheet-edit-session';
import { toGridJsonPointer } from '$lib/utils/gridContentHelpers';

export const timingOptions = [
	...Object.entries(actionTimings).map(([key, label]) => ({ key, label })),
	{ key: 'unspecified', label: 'Unspecified' }
];
export const spellLevelOptions = Array.from({ length: 10 }, (_, level) => ({
	key: String(level),
	label: level ? `Level ${level}` : 'Cantrip'
}));
const labelOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

export const collectionRows = (
	character: CharacterDocument5e2024,
	kind: RecordKind,
	query = '',
	timings: ReadonlyArray<string> = [],
	options: {
		category?: keyof typeof inventoryCategories;
		levels?: readonly string[];
		prepared?: boolean;
		priority?: boolean;
	} = {}
) => {
	const pins = new Set(
		kind === 'notes' || options.priority === false
			? []
			: character.systemData.collectionPins?.[kind]
	);
	const entries: Array<NonNullable<CharacterDocument5e2024['systemData'][RecordKind]>[number]> =
		character.systemData[kind] ?? [];
	const rows: (CollectionPriorityRow & { timing?: string; level?: number; prepared?: boolean })[] =
		entries
			.filter(
				(entry) => !options.category || ('category' in entry && entry.category === options.category)
			)
			.map((entry) => ({
				key: `${kind}:${entry.id}`,
				identity: entry.id,
				pinned: pins.has(entry.id),
				label: 'name' in entry ? entry.name : entry.title || 'Quick note',
				detail: 'body' in entry ? entry.body : entry.detail,
				annotations: [
					...('annotations' in entry ? (entry.annotations ?? []) : []),
					...Object.entries(character.systemData.fieldNotes ?? {})
						.filter(([path]) => path.startsWith(`${toGridJsonPointer([kind, entry.id])}/`))
						.flatMap(([, notes]) => notes)
				],
				level: kind === 'spells' && 'level' in entry ? entry.level : undefined,
				prepared: 'prepared' in entry ? entry.prepared : undefined,
				timing:
					kind === 'runtimeActions'
						? 'timing' in entry
							? (entry.timing ?? 'unspecified')
							: 'unspecified'
						: undefined,
				badges:
					'category' in entry
						? [inventoryCategories[entry.category]]
						: kind === 'runtimeActions'
							? [
									'timing' in entry && entry.timing
										? actionTimings[entry.timing]
										: 'Timing unspecified',
									'source' in entry && entry.source
										? entry.source.kind === 'item'
											? 'Inventory'
											: entry.source.kind === 'spell'
												? 'Spell'
												: 'Feature'
										: 'Custom'
								]
							: kind === 'spells' && 'level' in entry
								? [
										entry.level ? `Level ${entry.level}` : 'Cantrip',
										...('prepared' in entry && entry.prepared ? ['Prepared'] : [])
									]
								: kind === 'classes'
									? [
											...('level' in entry && entry.level !== undefined
												? [`Level ${entry.level}`]
												: []),
											...('subclass' in entry && entry.subclass ? [entry.subclass] : [])
										]
									: 'context' in entry && entry.context
										? [entry.context]
										: undefined
			}));
	const matches = filterGridContentListRows(rows, query).filter(
		(row) =>
			(kind !== 'runtimeActions' ||
				!timings.length ||
				(row.timing && timings.includes(row.timing))) &&
			(kind !== 'spells' ||
				((!options.levels?.length || options.levels.includes(String(row.level))) &&
					(!options.prepared || row.prepared === true)))
	);
	matches.sort((a, b) => {
		if (kind === 'classes') return 0;
		if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
		if (!a.pinned && kind === 'runtimeActions' && a.timing !== b.timing)
			return (
				timingOptions.findIndex((t) => t.key === a.timing) -
				timingOptions.findIndex((t) => t.key === b.timing)
			);
		if (!a.pinned && kind === 'spells' && a.level !== b.level)
			return (a.level ?? 0) - (b.level ?? 0);
		return compareCollectionPriorityRows(a, b, labelOrder.compare);
	});
	return {
		rows: matches,
		total: rows.length,
		narrowed:
			!!query.trim() ||
			(kind === 'runtimeActions' && timings.length > 0) ||
			(kind === 'spells' && (!!options.levels?.length || !!options.prepared))
	};
};

// Presentation can combine collections without merging their stable identities or ownership.
export const collectionGroupRows = (
	character: CharacterDocument5e2024,
	kinds: readonly RecordKind[],
	query = ''
) => {
	const groups = kinds.map((kind) => ({ kind, result: collectionRows(character, kind) }));
	const combined = groups.flatMap(({ kind, result }) =>
		result.rows.map((row) => ({
			...row,
			badges: [
				kind === 'feats' ? 'Feat' : kind === 'features' ? 'Feature' : kind,
				...(row.badges ?? [])
			]
		}))
	);
	const rows = filterGridContentListRows(combined, query);
	rows.sort((a, b) => compareCollectionPriorityRows(a, b, labelOrder.compare));
	return {
		rows,
		total: groups.reduce((sum, group) => sum + group.result.total, 0),
		narrowed: !!query.trim()
	};
};
