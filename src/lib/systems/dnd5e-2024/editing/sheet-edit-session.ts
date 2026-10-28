import type { Annotation } from '../../../../schema';
import {
	safeParse5e2024CharacterDocument,
	type CharacterDocument5e2024
} from '../../../../schema/system-5e2024';
import {
	defaultCharacterFactoryDependencies,
	type CharacterFactoryDependencies
} from '../../../../schema/helpers';
import { applyGridPatches } from '$lib/utils/characterGridHelpers';
import {
	collectLeafInputs,
	getValueAtGridPath,
	toGridJsonPointer
} from '$lib/utils/gridContentHelpers';
import type {
	GridContentBindPath,
	GridContentData,
	GridContentField
} from '$lib/utils/gridContentTypes';
import {
	mergeSmallNoteChange,
	sameEditValue,
	type ScalarValue,
	type SmallEditField,
	type SmallEditModel,
	type SmallEditResult
} from '$lib/utils/smallEdit';
import type { SmallGridRequest } from '$lib/ui/organisms/small-edit-context';
import type { JSONPatchDocument } from 'immutable-json-patch';
import { resolveActionSource, sourceCollection, type ActionSource } from '../action-sources';
import {
	proficiencyChoices,
	proficiencyFlags,
	proficiencyLevel,
	type ProficiencyLevel
} from '../proficiency-level';
import {
	recordKinds2024,
	featureKinds2024,
	type RecordKind2024
} from '../../../../schema/fields-5e2024';
import {
	sheetFields,
	recordFields,
	inventoryCategories,
	actionTimings,
	type SheetFieldDefinition
} from '../sheet-fields';
export {
	sheetFields,
	inventoryCategories,
	actionTimings,
	type SheetFieldDefinition
} from '../sheet-fields';

export interface SheetEditOwner {
	read: () => CharacterDocument5e2024;
	write: (character: CharacterDocument5e2024) => void;
	reject?: () => boolean;
}
export type RecordKind = RecordKind2024;
const scalar = (value: unknown): ScalarValue =>
	typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
		? value
		: undefined;
const failure = (message: string): SmallEditResult => ({ ok: false, message });

// This edition owns paths and candidate validation. The host supplies reactive state
// and persistence; shared Tier 1/2/3 controls never select a game schema.
export const createSheetEditSession = (
	owner: SheetEditOwner,
	dependencies: CharacterFactoryDependencies = defaultCharacterFactoryDependencies
) => {
	const commit = (candidate: CharacterDocument5e2024): SmallEditResult => {
		if (owner.reject?.())
			return failure(
				'This proof rejects saves. Your draft is still available; cancel or try again.'
			);
		const current = owner.read();
		if (candidate.meta.id !== current.meta.id)
			return failure('The character changed. Reopen this edit.');
		const parsed = safeParse5e2024CharacterDocument(candidate);
		if (!parsed.success)
			return failure(parsed.error.issues.map((issue) => issue.message).join(' '));
		if (sameEditValue(current, parsed.data)) return { ok: true };
		owner.write({
			...parsed.data,
			meta: { ...parsed.data.meta, updatedAt: dependencies.nowIso() }
		});
		return { ok: true };
	};
	const refreshAction = (id: string): SmallEditResult => {
		const current = owner.read();
		const action = current.systemData.runtimeActions.find((entry) => entry.id === id);
		const source = action?.source && resolveActionSource(current, action.source);
		if (!action || !source) return failure('This action or source is no longer available.');
		return commit({
			...current,
			systemData: {
				...current.systemData,
				runtimeActions: current.systemData.runtimeActions.map((entry) =>
					entry.id === id
						? { ...entry, name: source.name, detail: source.detail || undefined }
						: entry
				)
			}
		});
	};
	const valueField = (
		key: string,
		label: string,
		kind: SmallEditField['kind'],
		resolvePath: () => GridContentBindPath | undefined,
		{
			required = false,
			choices,
			notePath
		}: {
			required?: boolean;
			choices?: Record<string, string>;
			notePath?: () => GridContentBindPath | undefined;
		} = {}
	): SmallEditField => {
		const ownerId = owner.read().meta.id;
		const currentPath = () => (owner.read().meta.id === ownerId ? resolvePath() : undefined);
		const read = () => {
			const path = currentPath();
			const raw = path ? scalar(getValueAtGridPath(owner.read(), path)) : undefined;
			return choices && typeof raw === 'string' ? choices[raw] : raw;
		};
		const notesPath = () => (notePath ? notePath() : ['systemData', 'fieldNotes', key]);
		const readNotes = (): Annotation[] => {
			if (!currentPath()) return [];
			const path = notesPath();
			return path
				? ((getValueAtGridPath(owner.read(), path) as Annotation[] | undefined) ?? [])
				: [];
		};
		return {
			key,
			entryKey: resolvePath() ? toGridJsonPointer(resolvePath()!) : undefined,
			label,
			kind,
			read,
			canClear: !required,
			options: choices ? Object.values(choices) : undefined,
			commit(before, after) {
				const path = currentPath();
				if (!path) return failure('This record is no longer available.');
				if (!sameEditValue(before, read()))
					return failure('This value changed. Cancel and reopen this field.');
				if (required && (after === undefined || (typeof after === 'string' && !after.trim())))
					return failure(`Enter ${label.toLowerCase()}.`);
				const value =
					choices && after !== undefined
						? Object.entries(choices).find(([, label]) => label === after)?.[0]
						: after;
				if (choices && after !== undefined && value === undefined)
					return failure('Choose an available option.');
				return commit(applyGridPatches(owner.read(), [{ path, value }]));
			},
			notes:
				kind === 'multiline' && key.startsWith('/notes/')
					? undefined
					: {
							read: readNotes,
							commit(change) {
								const path = notesPath();
								if (!currentPath() || !path) return failure('This record is no longer available.');
								const notes = mergeSmallNoteChange(readNotes(), change);
								return notes
									? commit(
											applyGridPatches(owner.read(), [
												{ path, value: notes.length ? notes : undefined }
											])
										)
									: failure('This note changed. Reopen it before saving.');
							}
						}
		};
	};
	const field = (definition: SheetFieldDefinition): SmallEditField => ({
		...valueField(
			toGridJsonPointer(definition.path),
			definition.detailLabel ?? definition.label,
			definition.kind,
			() => definition.path,
			{ choices: definition.choices, required: definition.required }
		),
		hint: /^(skills|saves)\.[^.]+\.bonus$/.test(definition.key)
			? 'Entered manually; changing proficiency won’t recalculate it.'
			: undefined
	});
	const definitionFor = (leaf: GridContentField) =>
		sheetFields.find((definition) =>
			sameEditValue(definition.path, leaf.binding?.valuePatchPath ?? leaf.bindPath)
		);
	const proficiencyField = (definition: SheetFieldDefinition): SmallEditField => {
		const skill = definition.key.startsWith('skills.');
		const ownerId = owner.read().meta.id;
		const path = definition.path.slice(0, -1);
		const readFlags = () => ({
			proficient: scalar(getValueAtGridPath(owner.read(), [...path, 'proficient'])) as
				boolean | undefined,
			expertise: scalar(getValueAtGridPath(owner.read(), [...path, 'expertise'])) as
				boolean | undefined
		});
		// Guard the complete pair, including absent vs false, not merely the collapsed display value.
		let baseline = readFlags();
		const read = () => proficiencyLevel(readFlags(), skill);
		const base = field(definition);
		return {
			...base,
			label: (definition.detailLabel ?? definition.label).replace(/Proficient$/, 'Proficiency'),
			kind: 'select',
			canClear: false,
			read,
			display: () => {
				const level = read();
				const flags = readFlags();
				const describe = (value: boolean | undefined) =>
					value === undefined ? 'not recorded' : value ? 'yes' : 'no';
				return level === 'Custom (preserved)'
					? `Custom — Proficient: ${describe(flags.proficient)}; Expertise: ${describe(flags.expertise)}`
					: level;
			},
			options: [
				...proficiencyChoices(skill),
				...(read() === 'Custom (preserved)' ? ['Custom (preserved)'] : [])
			],
			commit(before, after) {
				if (owner.read().meta.id !== ownerId)
					return failure('The character changed. Reopen this detail.');
				if (!sameEditValue(baseline, readFlags()) || before !== read())
					return failure('Proficiency changed. Close and reopen this detail before saving.');
				if (after === before) return { ok: true };
				if (!proficiencyChoices(skill).includes(after as ProficiencyLevel))
					return failure('Choose an available proficiency level.');
				const next = proficiencyFlags(after as ProficiencyLevel);
				const result = commit(
					applyGridPatches(owner.read(), [
						{ path: [...path, 'proficient'], value: next.proficient },
						{ path: [...path, 'expertise'], value: next.expertise }
					])
				);
				if (result.ok) baseline = readFlags();
				return result;
			}
		};
	};
	const buildGrid = (request: SmallGridRequest): SmallEditModel | undefined => {
		const definitions = Object.entries(request.data)
			.flatMap(([key, field]) => collectLeafInputs(field, [key]))
			.map(({ field }) => definitionFor(field));
		if (!definitions.length || definitions.some((definition) => !definition)) return undefined;
		return {
			title: request.title,
			annotationEditorConfig: request.annotationEditorConfig,
			fields: definitions.flatMap((definition) => {
				if (!definition) return [];
				const isCheck = /^(skills|saves)\./.test(definition.key);
				if (isCheck && definition.key.endsWith('.proficient'))
					return [proficiencyField(definition)];
				if (isCheck && definition.key.endsWith('.expertise')) {
					const notes = field(definition);
					// Preserve the earlier leaf's note ownership without a second competing value editor.
					return notes.notes?.read().length
						? [
								{
									...notes,
									label: `${notes.label} notes`,
									commit: undefined,
									display: () => 'Notes retained from the earlier Expertise field.'
								}
							]
						: [];
				}
				return [field(definition)];
			})
		};
	};
	const buildRecord = (
		key: string,
		annotationEditorConfig?: SmallEditModel['annotationEditorConfig']
	): SmallEditModel | undefined => {
		const kind = recordKinds2024.find((kind) => key.startsWith(`${kind}:`));
		if (!kind) return;
		const id = key.slice(kind.length + 1);
		const ownerId = owner.read().meta.id;
		const record = owner.read().systemData[kind]?.find((entry) => entry.id === id);
		if (!record) return;
		const path = (property: string): GridContentBindPath | undefined => {
			if (owner.read().meta.id !== ownerId) return undefined;
			const index = owner.read().systemData[kind]?.findIndex((entry) => entry.id === id) ?? -1;
			return index < 0 ? undefined : ['systemData', kind, index, property];
		};
		const leaf = (
			property: string,
			label: string,
			type: SmallEditField['kind'],
			required = false,
			choices?: Record<string, string>
		) =>
			valueField(toGridJsonPointer([kind, id, property]), label, type, () => path(property), {
				required,
				choices,
				...(property === 'name' ? { notePath: () => path('annotations') } : {})
			});
		const fields = recordFields(kind).map((definition) =>
			leaf(
				definition.key,
				definition.label,
				definition.kind,
				definition.required,
				definition.choices
			)
		);
		const source = kind === 'runtimeActions' && 'source' in record ? record.source : undefined;
		const resolveSource = () => {
			if (owner.read().meta.id !== ownerId || !path('name')) return undefined;
			const current = owner.read();
			const link = current.systemData.runtimeActions.find((entry) => entry.id === id)?.source;
			return link ? resolveActionSource(current, link) : undefined;
		};
		return {
			get title() {
				const current = owner.read().systemData[kind]?.find((entry) => entry.id === id) ?? record;
				return 'name' in current ? current.name : current.title || 'Quick note';
			},
			fields,
			annotationEditorConfig,
			...(source
				? {
						source: {
							label: () => resolveSource()?.name,
							description: 'Editable snapshot. Source edits are applied only when you refresh.',
							open: () => {
								const resolved = resolveSource();
								const link = owner
									.read()
									.systemData.runtimeActions.find((entry) => entry.id === id)?.source;
								const collection = link && sourceCollection(owner.read(), link);
								return resolved && collection
									? buildRecord(`${collection}:${resolved.id}`, annotationEditorConfig)
									: undefined;
							},
							refresh: {
								key: 'refresh-source',
								label: 'Refresh from source',
								confirmLabel: 'Confirm refresh',
								confirmation:
									'Replace this action’s Name and Description with the current source text? This overwrites direct edits and clears Description if the source has none. Timing, notes and pins are kept.',
								commit: () =>
									resolveSource()
										? refreshAction(id)
										: failure('This source is no longer available.')
							}
						}
					}
				: {})
		};
	};
	return {
		buildGrid,
		buildRecord,
		canTarget: (data: GridContentData) => !!buildGrid({ data, title: '' }),
		project(keys: ReadonlyArray<string>): GridContentData {
			return Object.fromEntries(
				sheetFields
					.filter((definition) => keys.includes(definition.key))
					.sort((a, b) => keys.indexOf(a.key) - keys.indexOf(b.key))
					.map((definition) => {
						const model = field(definition);
						return [
							definition.key,
							{
								fieldName: definition.label,
								value: model.read() ?? '',
								inputKind: definition.kind === 'number' ? 'number' : 'text',
								displayAs: definition.kind === 'boolean' ? 'checkbox' : undefined,
								multiline: definition.kind === 'multiline',
								options: definition.choices ? Object.values(definition.choices) : undefined,
								bindPath: definition.path,
								annotationBindPath: ['systemData', 'fieldNotes', model.key],
								annotations: model.notes?.read(),
								binding: {
									valuePatchPath: definition.path,
									valuePatchOperation: model.read() === undefined ? 'add' : 'replace'
								},
								capabilities: { canEditValue: true, canEditAnnotations: true },
								interaction: { tier: definition.runtime ? 'runtime' : 'read-first' }
							} satisfies GridContentField
						];
					})
			);
		},
		patch(patch: JSONPatchDocument): SmallEditResult {
			const writes = patch.filter((operation) => operation.op !== 'test');
			if (writes.length !== 1) return failure('Edit one runtime field at a time.');
			const write = writes[0];
			const definition = sheetFields.find(
				(definition) => definition.runtime && toGridJsonPointer(definition.path) === write.path
			);
			if (!definition || (write.op !== 'add' && write.op !== 'replace'))
				return failure('This runtime field is not editable.');
			for (const operation of patch) {
				if (
					operation.op === 'test' &&
					(operation.path !== write.path ||
						!sameEditValue(getValueAtGridPath(owner.read(), definition.path), operation.value))
				)
					return failure('This value changed. Cancel and reopen it.');
			}
			return commit(
				applyGridPatches(owner.read(), [{ path: definition.path, value: write.value }])
			);
		},
		add(kind: RecordKind, data: GridContentData, source?: ActionSource): SmallEditResult {
			if (source && (kind !== 'runtimeActions' || !resolveActionSource(owner.read(), source)))
				return failure(
					'This source is no longer available. Go back and choose another source or a custom action.'
				);
			const value = (key: string) => scalar(data[key]?.value);
			const id = dependencies.createId();
			const record: Record<string, unknown> = { id, ...(source ? { source } : {}) };
			for (const definition of recordFields(kind)) {
				const raw = value(definition.key);
				if (raw === '' || raw === undefined) continue;
				const selected = definition.choices
					? Object.entries(definition.choices).find(([, label]) => label === raw)?.[0]
					: raw;
				if (selected === undefined)
					return failure(`Choose an available ${definition.label.toLowerCase()}.`);
				record[definition.key] = selected;
			}
			if (
				typeof (kind === 'notes' ? record.body : record.name) !== 'string' ||
				!String(kind === 'notes' ? record.body : record.name).trim()
			)
				return failure(kind === 'notes' ? 'Enter a note.' : 'Enter a name.');
			return commit(
				applyGridPatches(owner.read(), [
					{ path: ['systemData', kind], value: [...(owner.read().systemData[kind] ?? []), record] }
				])
			);
		},
		remove(kind: RecordKind, id: string): SmallEditResult {
			const current = owner.read();
			if (!current.systemData[kind]?.some((entry) => entry.id === id))
				return failure('This record is no longer available.');
			const prefix = `${toGridJsonPointer([kind, id])}/`;
			const fieldNotes = Object.fromEntries(
				Object.entries(current.systemData.fieldNotes ?? {}).filter(
					([key]) => !key.startsWith(prefix)
				)
			);
			return commit(
				applyGridPatches(current, [
					...(kind === 'inventory' ||
					kind === 'spells' ||
					featureKinds2024.some((entry) => entry === kind)
						? [
								{
									path: ['systemData', 'runtimeActions'],
									value: current.systemData.runtimeActions.map((action) => {
										if (
											!action.source ||
											action.source.id !== id ||
											sourceCollection(current, action.source) !== kind
										)
											return action;
										const { source: _source, ...snapshot } = action;
										return snapshot;
									})
								}
							]
						: []),
					{
						path: ['systemData', kind],
						value: current.systemData[kind]?.filter((entry) => entry.id !== id)
					},
					{
						path: ['systemData', 'fieldNotes'],
						value: Object.keys(fieldNotes).length ? fieldNotes : undefined
					},
					...(kind === 'notes'
						? []
						: [
								{
									path: ['systemData', 'collectionPins', kind],
									value: current.systemData.collectionPins?.[kind]?.filter((pin) => pin !== id)
								}
							])
				])
			);
		},
		togglePin(kind: Exclude<RecordKind, 'notes'>, id: string): SmallEditResult {
			const current = owner.read();
			const pins = current.systemData.collectionPins?.[kind] ?? [];
			return commit(
				applyGridPatches(current, [
					{
						path: ['systemData', 'collectionPins', kind],
						value: pins.includes(id) ? pins.filter((pin) => pin !== id) : [...pins, id]
					}
				])
			);
		}
	};
};
export type SheetEditSession = ReturnType<typeof createSheetEditSession>;

export const newRecordData = (kind: RecordKind): GridContentData =>
	Object.fromEntries(
		recordFields(kind).map((definition) => [
			definition.key,
			{
				fieldName: definition.label,
				value:
					definition.key === 'category'
						? inventoryCategories.other
						: definition.key === 'timing'
							? actionTimings.action
							: kind === 'spells' && definition.key === 'level'
								? 0
								: definition.kind === 'boolean'
									? false
									: '',
				inputKind: definition.kind === 'number' ? 'number' : 'text',
				multiline: definition.kind === 'multiline',
				options: definition.choices ? Object.values(definition.choices) : undefined
			}
		])
	);
