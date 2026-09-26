import type { GridContentAnnotation, GridContentData } from '$utils/gridContentTypes';
import type { CharacterDocument5e2014, RuntimeAction } from '../../../schema';
import type { RuntimeActionRow } from './components/runtimeActionRows';
import type { RuntimeActionEditorPayload, SheetEditIntent } from './sheetEditIntents';

const valueAt = (data: GridContentData, key: string): unknown => data[key]?.value;

export const projectRuntimeActionEditData = (
	character: CharacterDocument5e2014,
	row: RuntimeActionRow | undefined
): GridContentData => {
	const action = row
		? character.systemData.runtimeActions.find((candidate) => candidate.id === row.id)
		: undefined;
	if (!action) return {};
	return {
		name: { fieldName: 'Name', value: action.name },
		timing: {
			fieldName: 'Timing',
			value: action.timing ?? 'action',
			options: ['action', 'bonusAction', 'reaction', 'free', 'other']
		},
		category: {
			fieldName: 'Category',
			value: action.category ?? 'effect',
			options: ['attack', 'effect', 'other']
		},
		target: { fieldName: 'Target', value: action.target ?? '' },
		notes: { fieldName: 'Detail', value: action.notes ?? '', multiline: true }
	};
};

const actionPayload = (action: RuntimeAction) => ({
	id: action.id,
	name: action.name,
	timing: action.timing,
	category: action.category,
	target: action.target,
	notes: action.notes,
	annotations: action.annotations
});

export const decodeRuntimeActionSaveIntent = (
	character: CharacterDocument5e2014,
	actionId: string,
	data: GridContentData,
	annotations: ReadonlyArray<GridContentAnnotation>
): SheetEditIntent | undefined => {
	const name = valueAt(data, 'name');
	if (typeof name !== 'string' || !name.trim()) return undefined;
	const actions: RuntimeActionEditorPayload = character.systemData.runtimeActions.map((action) =>
		action.id === actionId
			? {
					...actionPayload(action),
					name: name.trim(),
					timing: String(valueAt(data, 'timing') ?? action.timing ?? 'action') as NonNullable<
						RuntimeAction['timing']
					>,
					category: String(valueAt(data, 'category') ?? action.category ?? 'effect') as NonNullable<
						RuntimeAction['category']
					>,
					target: String(valueAt(data, 'target') ?? ''),
					notes: String(valueAt(data, 'notes') ?? ''),
					annotations: [...annotations]
				}
			: actionPayload(action)
	);
	return { type: 'replace-runtime-actions', actions };
};

export const decodeRuntimeActionRemoveIntent = (
	character: CharacterDocument5e2014,
	actionId: string
): SheetEditIntent => ({
	type: 'replace-runtime-actions',
	actions: character.systemData.runtimeActions
		.filter((action) => action.id !== actionId)
		.map(actionPayload)
});
