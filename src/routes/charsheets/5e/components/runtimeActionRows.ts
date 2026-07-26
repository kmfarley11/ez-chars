import type {
	CharacterDocument5e2014,
	RuntimeAction,
	RuntimeActionSource
} from '../../../../schema';
import {
	get5eRuntimeActionSourceCategoryLabel,
	resolve5eRuntimeActionSource,
	type RuntimeActionSourceDestination
} from '$lib/dnd5e2014/runtimeActionSources';

const timingLabels: Record<NonNullable<RuntimeAction['timing']>, string> = {
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
	categoryLabel: string;
	sourceCategoryLabel?: string;
	target?: string;
	notes?: string;
	source?: {
		reference: RuntimeActionSource;
		label: string;
		context: string;
		destination: RuntimeActionSourceDestination;
	};
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
			timingLabel: timingLabels[action.timing ?? 'action'],
			categoryLabel: categoryLabels[action.category ?? 'attack'],
			...(resolvedSource
				? {
						sourceCategoryLabel: get5eRuntimeActionSourceCategoryLabel(resolvedSource.category)
					}
				: !action.source
					? { sourceCategoryLabel: 'Custom' }
					: {}),
			...(target ? { target } : {}),
			...(notes ? { notes } : {}),
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
