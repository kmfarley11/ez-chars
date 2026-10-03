import type {
	Annotation,
	CharacterDocument5e2014,
	RuntimeAction,
	RuntimeActionSource
} from '../../schema';
import {
	get5eRuntimeActionSourceCategoryLabel,
	resolve5eRuntimeActionSource,
	type RuntimeActionSourceDestination
} from '$lib/dnd5e2014/runtimeActionSources';

export const timingLabels: Record<NonNullable<RuntimeAction['timing']>, string> = {
	action: 'Action',
	bonusAction: 'Bonus action',
	reaction: 'Reaction',
	free: 'Free',
	other: 'Other'
};

const categoryLabels: Record<NonNullable<RuntimeAction['category']>, string> = {
	attack: 'Attack',
	effect: 'Effect',
	other: 'Other'
};

export type RuntimeActionRow = {
	id: string;
	name: string;
	timingLabel: string;
	categoryLabel?: string;
	timing?: NonNullable<RuntimeAction['timing']>;
	sourceCategoryLabel?: string;
	target?: string;
	notes?: string;
	annotations?: Array<Annotation>;
	source?: {
		reference: RuntimeActionSource;
		label: string;
		context: string;
		destination: RuntimeActionSourceDestination;
	};
};

const normalizeSearchText = (value: string): string => value.trim().toLocaleLowerCase();

const getRuntimeActionSearchText = (row: RuntimeActionRow): string =>
	[
		row.name,
		row.target,
		row.notes,
		row.timingLabel,
		row.categoryLabel,
		row.sourceCategoryLabel,
		row.source?.label,
		row.source?.context
	]
		.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
		.join(' ')
		.toLocaleLowerCase();

export const filterRuntimeActionRows = (
	rows: ReadonlyArray<RuntimeActionRow>,
	query: string
): Array<RuntimeActionRow> => {
	const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return [...rows];
	return rows.filter((row) => {
		const searchText = getRuntimeActionSearchText(row);
		return tokens.every((token) => searchText.includes(token));
	});
};

const nonEmptyText = (value: string | undefined): string | undefined => {
	const normalized = value?.trim();
	return normalized ? normalized : undefined;
};

export const projectRuntimeActionRows = (
	actions: ReadonlyArray<RuntimeAction>,
	character: CharacterDocument5e2014
): Array<RuntimeActionRow> => {
	return actions.map((action) => {
		const resolvedSource = action.source
			? resolve5eRuntimeActionSource(character, action.source)
			: undefined;
		const target = nonEmptyText(action.target);
		const notes = nonEmptyText(action.notes);
		return {
			id: action.id,
			name: action.name,
			timing: action.timing ?? 'action',
			timingLabel: timingLabels[action.timing ?? 'action'],
			...(action.category ? { categoryLabel: categoryLabels[action.category] } : {}),
			...(resolvedSource
				? {
						sourceCategoryLabel: get5eRuntimeActionSourceCategoryLabel(resolvedSource.category)
					}
				: !action.source
					? { sourceCategoryLabel: 'Custom' }
					: {}),
			...(target ? { target } : {}),
			...(notes ? { notes } : {}),
			...(action.annotations ? { annotations: action.annotations } : {}),
			...(resolvedSource
				? {
						source: {
							reference: resolvedSource.source,
							label: resolvedSource.sourceLabel,
							context: resolvedSource.context,
							destination: resolvedSource.destination
						}
					}
				: {})
		};
	});
};
