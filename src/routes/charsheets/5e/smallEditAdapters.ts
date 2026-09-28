import { applyGridPatches } from '$utils/characterGridHelpers';
import { isGridFieldArray, isGridNestedFields } from '$utils/gridFieldGuards';
import {
	collectLeafInputs,
	getValueAtGridPath,
	normalizeData,
	readGridAnnotationsAtPath,
	toGridJsonPointer
} from '$utils/gridContentHelpers';
import type {
	GridContentData,
	GridAnnotationEditorConfig,
	GridContentBindPath
} from '$utils/gridContentTypes';
import {
	mergeSmallNoteChange,
	sameEditValue,
	type ScalarValue,
	type SmallEditField,
	type SmallEditAction,
	type SmallEditModel,
	type SmallEditNotes,
	type SmallEditResult
} from '$utils/smallEdit';
import type { CharacterDocument5e2014 } from '../../../schema';
import { createId } from '../../../schema/helpers';
import { validateDraftAnnotations } from '$utils/focusedDraft';
import {
	reduce5eSheetEditIntents,
	type SheetEditIntent,
	type SpellSlotsEditorPayload
} from './sheetEditIntents';
import {
	roleplayFieldPathPrefix,
	scratchpadNotesPathPrefix,
	toSystemDataAnnotationPath,
	type SpellListLevel
} from './sheetConstants';
import { project5eSheet } from './sheetProjections';
import { reconcile5e2014CollectionPins } from '$lib/dnd5e2014/collectionPriority';
import { reconcile5eRuntimeActionSourceLinks } from '$lib/dnd5e2014/runtimeActionSources';
import { projectSupportingCollectionRows } from './components/supportingCollectionRows';
import { projectRuntimeActionRows } from './components/runtimeActionRows';

export interface SmallEditOwner {
	read: () => CharacterDocument5e2014;
	write: (character: CharacterDocument5e2014) => void;
	reject?: () => boolean;
	allocateId?: () => string;
}

const containsArray = (data: GridContentData): boolean =>
	Object.values(data).some(
		(field) =>
			isGridFieldArray(field.value) ||
			(isGridNestedFields(field.value) && containsArray(field.value))
	);

export const shouldTarget5eSmallGrid = (data: GridContentData): boolean =>
	Object.values(data).every(
		(field) =>
			field.bindPath?.[0] === scratchpadNotesPathPrefix ||
			(field.bindPath?.[0] === 'systemData' && field.bindPath?.[1] === 'classes') ||
			!containsArray({ field })
	) &&
	Object.entries(normalizeData(data)).every(([key, field]) => {
		// Empty arrays have no leaves, but still require their collection/creation adapter.
		return collectLeafInputs(field, [key]).every(
			({ bindPath }) =>
				bindPath &&
				['identity', 'systemData', roleplayFieldPathPrefix, scratchpadNotesPathPrefix].includes(
					String(bindPath[0])
				) &&
				(!bindPath.some((segment) => typeof segment === 'number') ||
					bindPath[1] === 'classes' ||
					bindPath[0] === scratchpadNotesPathPrefix)
		);
	});
const stale = (): SmallEditResult => ({
	ok: false,
	message: 'This information changed or was removed. Cancel and reopen it to use the current value.'
});
const scalar = (value: unknown): ScalarValue =>
	typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
		? value
		: undefined;

const commitCandidate = (
	owner: SmallEditOwner,
	candidate: CharacterDocument5e2014,
	intents: Array<SheetEditIntent> = []
): SmallEditResult => {
	if (owner.reject?.())
		return {
			ok: false,
			message: 'This proof rejects saves. Your draft is still available; cancel or try again.'
		};
	const result = reduce5eSheetEditIntents(candidate, intents);
	if (!result.ok)
		return { ok: false, message: result.issues.map((issue) => issue.message).join(' ') };
	owner.write(result.character);
	return { ok: true };
};

const gridNotes = (
	owner: SmallEditOwner,
	path: GridContentBindPath,
	exists: () => boolean
): SmallEditNotes => ({
	read: () => readGridAnnotationsAtPath(owner.read(), path),
	commit: (change) => {
		const current = owner.read();
		if (!exists()) return stale();
		const next = mergeSmallNoteChange(readGridAnnotationsAtPath(current, path), change);
		if (!next) return stale();
		const error = validateDraftAnnotations(change.after ? [change.after] : []);
		if (error) return { ok: false, message: error };
		// A note on class N must not create a sparse mirrored array: undefined holes
		// are invalid annotation nodes. Preserve existing nodes and fill only gaps.
		let candidate = current;
		if (
			path[0] === 'systemData' &&
			path[1] === 'annotations' &&
			path[2] === 'classes' &&
			typeof path[3] === 'number'
		) {
			const existing = getValueAtGridPath(current, path.slice(0, 3));
			const nodes = Array.isArray(existing) ? existing : [];
			candidate = applyGridPatches(current, [
				{
					path: path.slice(0, 3),
					value: Array.from(
						{ length: Math.max(nodes.length, path[3] + 1) },
						(_, index) => nodes[index] ?? {}
					)
				}
			]);
		}
		return commitCandidate(owner, candidate, [
			{ type: 'replace-annotations', targetPath: path, annotations: next }
		]);
	}
});

const createCanonicalGridModel = (
	owner: SmallEditOwner,
	data: GridContentData,
	title: string,
	annotationEditorConfig?: GridAnnotationEditorConfig,
	guard: () => boolean = () => true,
	allowClassIndices = false
): SmallEditModel | undefined => {
	if (!shouldTarget5eSmallGrid(data)) return undefined;
	const ownerId = owner.read().meta.id;
	const leaves = Object.entries(normalizeData(data))
		.flatMap(([key, field]) => collectLeafInputs(field, [key]))
		.filter(({ field }) => !field.hidden);
	if (
		!leaves.length ||
		leaves.some(
			({ bindPath }) =>
				!bindPath ||
				!['identity', 'systemData'].includes(String(bindPath[0])) ||
				(bindPath.some((segment) => typeof segment === 'number') && !allowClassIndices)
		)
	)
		return undefined;
	const fields = leaves.map(({ field, bindPath }): SmallEditField => {
		const path = field.binding?.valuePatchPath ?? bindPath!;
		const read = () => scalar(getValueAtGridPath(owner.read(), path));
		let parentPath = path.slice(0, -1);
		// Guard the nearest existing owner, including an absent slot within existing spellcasting.
		while (parentPath.length > 1 && getValueAtGridPath(owner.read(), parentPath) === undefined)
			parentPath = parentPath.slice(0, -1);
		const parentExisted = getValueAtGridPath(owner.read(), parentPath) !== undefined;
		const exists = () =>
			guard() &&
			owner.read().meta.id === ownerId &&
			(!parentExisted || getValueAtGridPath(owner.read(), parentPath) !== undefined);
		const canClear =
			path[0] === 'identity' &&
			['alignment', 'appearance', 'background', 'ancestryLineage'].includes(String(path[1]));
		return {
			key: toGridJsonPointer(path),
			label: field.fieldName ?? String(path.at(-1)),
			kind:
				typeof field.value === 'boolean'
					? 'boolean'
					: field.options
						? 'select'
						: field.multiline
							? 'multiline'
							: field.inputKind === 'number' || typeof field.value === 'number'
								? 'number'
								: 'text',
			options: field.options,
			read,
			display: () => read() ?? (typeof field.value === 'boolean' ? false : undefined),
			canClear,
			commit:
				field.capabilities?.isDerived || field.capabilities?.canEditValue === false
					? undefined
					: (before, after) => {
							const current = owner.read();
							if (!guard()) return stale();
							if (
								current.meta.id !== ownerId ||
								(parentExisted && getValueAtGridPath(current, parentPath) === undefined)
							)
								return stale();
							if (!sameEditValue(getValueAtGridPath(current, path), before)) return stale();
							if (after === undefined && !canClear)
								return { ok: false, message: 'This field cannot be cleared.' };
							if (
								path[0] === 'systemData' &&
								path[1] === 'spellcasting' &&
								path[2] === 'slots' &&
								path.length === 5 &&
								(path[4] === 'used' || path[4] === 'max')
							) {
								if (typeof after !== 'number' || !Number.isInteger(after) || after < 0)
									return { ok: false, message: 'Enter a whole number of zero or more.' };
								const level = String(path[3]);
								if (!/^[1-9]$/.test(level)) return stale();
								return commitCandidate(owner, current, [
									{
										type: 'update-spell-slot',
										level: level as keyof SpellSlotsEditorPayload,
										field: path[4],
										value: after
									}
								]);
							}
							return commitCandidate(owner, applyGridPatches(current, [{ path, value: after }]));
						},
			notes:
				field.annotationBindPath && field.capabilities?.canEditAnnotations !== false
					? gridNotes(owner, field.annotationBindPath, exists)
					: undefined
		};
	});
	return { title, fields, annotationEditorConfig };
};

export const create5eSmallGridModel = (
	owner: SmallEditOwner,
	data: GridContentData,
	title: string,
	annotationEditorConfig?: GridAnnotationEditorConfig
): SmallEditModel | undefined => {
	if (!shouldTarget5eSmallGrid(data)) return undefined;
	if (Object.values(data).some((field) => field.bindPath?.[0] === scratchpadNotesPathPrefix))
		return createScratchpadModel(owner, title, annotationEditorConfig);
	if (
		Object.values(data).some(
			(field) =>
				field.bindPath?.[0] === 'systemData' &&
				field.bindPath?.[1] === 'classes' &&
				isGridFieldArray(field.value)
		)
	) {
		const ownerId = owner.read().meta.id;
		// Classes have no durable IDs in v0. Conservatively reject any external array
		// change rather than redirect a draft by index/name; own commits refresh this guard.
		let snapshot = structuredClone(owner.read().systemData.classes);
		let structureRevision = 0;
		const valid = () =>
			owner.read().meta.id === ownerId && sameEditValue(snapshot, owner.read().systemData.classes);
		const guardedOwner: SmallEditOwner = {
			...owner,
			write: (next) => {
				// Pending navigation can hold an old field/action while Save and continue
				// commits an Add/Remove. Never let that old index target a new occupant.
				if (next.systemData.classes.length !== snapshot.length) structureRevision += 1;
				owner.write(next);
				snapshot = structuredClone(next.systemData.classes);
			}
		};
		const includeName = !!data.name;
		return {
			title,
			annotationEditorConfig,
			get fields() {
				const revision = structureRevision;
				const current = project5eSheet(owner.read()).metaPrimaryData;
				const model = createCanonicalGridModel(
					guardedOwner,
					includeName ? current : { classLevels: current.classLevels },
					title,
					annotationEditorConfig,
					() => revision === structureRevision && valid(),
					true
				);
				return model?.fields ?? [];
			},
			get actions(): SmallEditAction[] {
				const revision = structureRevision;
				const validOperation = () => revision === structureRevision && valid();
				return [
					{
						key: 'add-class',
						label: 'Add Class',
						fields: [
							{ key: 'name', label: 'Name', kind: 'text', read: () => 'Class' },
							{ key: 'level', label: 'Level', kind: 'number', read: () => 1 }
						],
						commit: (values) => {
							if (!validOperation()) return stale();
							return commitCandidate(
								guardedOwner,
								applyGridPatches(owner.read(), [
									{
										path: ['systemData', 'classes'],
										value: [...owner.read().systemData.classes, values]
									}
								])
							);
						}
					},
					...owner.read().systemData.classes.map((entry, index): SmallEditAction => ({
						key: `remove-class-${index}`,
						label: `Remove Class ${index + 1}: ${entry.name}`,
						confirmation:
							'Remove this class, including its class-owned features? This cannot be undone.',
						commit: () => {
							if (!validOperation()) return stale();
							const current = owner.read();
							let candidate = applyGridPatches(current, [
								{
									path: ['systemData', 'classes'],
									value: current.systemData.classes.filter((_, itemIndex) => itemIndex !== index)
								}
							]);
							const annotations = getValueAtGridPath(current, [
								'systemData',
								'annotations',
								'classes'
							]);
							if (Array.isArray(annotations))
								candidate = applyGridPatches(candidate, [
									{
										path: ['systemData', 'annotations', 'classes'],
										value: annotations.filter((_, itemIndex) => itemIndex !== index)
									}
								]);
							return commitCandidate(
								guardedOwner,
								reconcile5eRuntimeActionSourceLinks(
									reconcile5e2014CollectionPins(candidate, 'features')
								)
							);
						}
					}))
				];
			}
		};
	}
	const roleplay = Object.values(data).some(
		(field) => field.bindPath?.[0] === roleplayFieldPathPrefix
	);
	if (roleplay) {
		const ownerId = owner.read().meta.id;
		const mapped = Object.fromEntries(
			Object.entries(data).map(([key, field]) => {
				const path = ['systemData', 'roleplay', String(field.bindPath?.[1] ?? key), 'body'];
				return [
					key,
					{
						...field,
						bindPath: path,
						binding: undefined,
						annotationBindPath: toSystemDataAnnotationPath(path)
					}
				];
			})
		);
		const model = createCanonicalGridModel(owner, mapped, title, annotationEditorConfig);
		if (model)
			model.fields.forEach((field, index) => {
				field.key = toGridJsonPointer(Object.values(data)[index].bindPath!);
				const path = ['systemData', 'roleplay', String(Object.values(data)[index].bindPath![1])];
				const existed = getValueAtGridPath(owner.read(), path) !== undefined;
				const readNotes = () => readGridAnnotationsAtPath(owner.read(), [...path, 'annotations']);
				field.notes = {
					read: readNotes,
					commit: (change) => {
						if (
							owner.read().meta.id !== ownerId ||
							(existed && getValueAtGridPath(owner.read(), path) === undefined)
						)
							return stale();
						const next = mergeSmallNoteChange(readNotes(), change);
						if (!next) return stale();
						const error = validateDraftAnnotations(change.after ? [change.after] : []);
						if (error) return { ok: false, message: error };
						return commitCandidate(
							owner,
							applyGridPatches(owner.read(), [
								{
									path: [...path, 'body'],
									value: getValueAtGridPath(owner.read(), [...path, 'body']) ?? ''
								},
								{ path: [...path, 'annotations'], value: next }
							])
						);
					}
				};
			});
		return model;
	}
	return createCanonicalGridModel(owner, data, title, annotationEditorConfig);
};

export const create5eSmallSpellModel = (
	owner: SmallEditOwner,
	key: string,
	annotationEditorConfig?: GridAnnotationEditorConfig
): SmallEditModel | undefined => {
	if (!key.startsWith('spell:')) return undefined;
	const id = key.slice('spell:'.length);
	const ownerId = owner.read().meta.id;
	const find = () => {
		const current = owner.read();
		return current.meta.id === ownerId
			? current.systemData.spellcasting?.spells?.find((spell) => spell.spellId === id)
			: undefined;
	};
	const initial = find();
	if (!initial) return undefined;
	const notes: SmallEditNotes = {
		read: () => find()?.annotations ?? [],
		commit: (change) => {
			const record = find();
			if (!record) return stale();
			const next = mergeSmallNoteChange(record.annotations ?? [], change);
			if (!next) return stale();
			const error = validateDraftAnnotations(change.after ? [change.after] : []);
			if (error) return { ok: false, message: error };
			return commitCandidate(owner, owner.read(), [
				{
					type: 'replace-spell-annotations',
					level: record.level ?? 0,
					spellId: id,
					annotations: next
				}
			]);
		}
	};
	const fields: Array<SmallEditField> = (['name', 'prepared', 'notes'] as const).map(
		(property) => ({
			key: property,
			label:
				property === 'notes' ? 'Authored detail' : property === 'prepared' ? 'Prepared' : 'Name',
			kind: property === 'prepared' ? 'boolean' : property === 'notes' ? 'multiline' : 'text',
			read: () => find()?.[property],
			display: () => find()?.[property] ?? (property === 'prepared' ? false : undefined),
			commit: (before, after) => {
				const record = find();
				if (!record || !sameEditValue(record[property], before)) return stale();
				if (property === 'prepared' ? typeof after !== 'boolean' : typeof after !== 'string')
					return { ok: false, message: 'Enter an appropriate value.' };
				if (property === 'name' && !String(after).trim())
					return { ok: false, message: 'Name cannot be empty.' };
				return commitCandidate(owner, owner.read(), [
					{
						type: 'update-spell',
						spellId: id,
						level: record.level ?? 0,
						spell: {
							name: record.name,
							prepared: record.prepared,
							notes: record.notes,
							[property]: after
						}
					}
				]);
			},
			// Notes belong to the record, not each property of it.
			notes: property === 'name' ? notes : undefined
		})
	);
	fields.splice(1, 0, {
		key: 'level',
		label: 'Level',
		kind: 'number',
		read: () => find()?.level,
		display: () => find()?.level ?? 0,
		explanation:
			'0 means cantrip; 1–9 are spell levels. This is the recorded spell level, not the slot used to upcast it.',
		commit: (before, after) => {
			const record = find();
			if (!record || !sameEditValue(record.level, before)) return stale();
			if (typeof after !== 'number' || !Number.isInteger(after) || after < 0 || after > 9)
				return { ok: false, message: 'Enter a whole spell level from 0 (cantrip) to 9.' };
			return commitCandidate(owner, owner.read(), [
				{
					type: 'update-spell',
					spellId: id,
					level: record.level ?? 0,
					nextLevel: after as SpellListLevel,
					spell: { name: record.name, prepared: record.prepared, notes: record.notes }
				}
			]);
		}
	});
	return {
		get title() {
			return find()?.name ?? initial.name ?? 'Spell';
		},
		fields,
		annotationEditorConfig,
		badges: () => [
			(find()?.level ?? 0) === 0 ? 'Cantrip' : `Spell level ${find()?.level}`,
			...(find()?.prepared ? ['Prepared'] : [])
		]
	};
};

// Only explicitly exposed authored properties are writable. Resolve the owning record
// afresh on every read/save; collection order and display names are not identities.
export const create5eSmallRecordModel = (
	owner: SmallEditOwner,
	key: string,
	annotationEditorConfig?: GridAnnotationEditorConfig
): SmallEditModel | undefined => {
	if (key.startsWith('spell:')) return create5eSmallSpellModel(owner, key, annotationEditorConfig);
	const separator = key.indexOf(':');
	const kind = key.slice(0, separator);
	const id = key.slice(separator + 1);
	const ownerId = owner.read().meta.id;
	type Property = {
		path: GridContentBindPath;
		label: string;
		kind?: SmallEditField['kind'];
		options?: string[];
		fallback?: ScalarValue;
	};
	const name: Property = { path: ['name'], label: 'Name' };
	let properties: Property[];
	let locate: () => GridContentBindPath | undefined;
	const uniqueIndex = (values: readonly { id: string }[]) => {
		const indices = values.flatMap((value, index) => (value.id === id ? [index] : []));
		return indices.length === 1 ? indices[0] : undefined;
	};
	const indexedPath = (root: GridContentBindPath, index: number | undefined) =>
		index === undefined ? undefined : [...root, index];
	if (kind === 'item') {
		locate = () => indexedPath(['inventory'], uniqueIndex(owner.read().inventory));
		properties = [
			name,
			{ path: ['notes'], label: 'Detail', kind: 'multiline' },
			{ path: ['quantity'], label: 'Quantity', kind: 'number', fallback: 1 },
			{ path: ['weight'], label: 'Weight', kind: 'number', fallback: 0 },
			{ path: ['value'], label: 'Value' },
			{ path: ['equipped'], label: 'Equipped', kind: 'boolean', fallback: false }
		];
	} else if (kind === 'general-feature') {
		locate = () => indexedPath(['features'], uniqueIndex(owner.read().features));
		const initial = owner.read().features.find((feature) => feature.id === id);
		// Edit the authored detail that is actually displayed, without copying a
		// description into summary during an unrelated name/note save.
		properties = [
			name,
			{
				path: [initial?.summary !== undefined ? 'summary' : 'description'],
				label: 'Detail',
				kind: 'multiline'
			}
		];
	} else if (kind === 'class-feature') {
		const featureId = id.slice(id.indexOf(':') + 1);
		locate = () => {
			const matches = owner
				.read()
				.systemData.classes.flatMap((entry, classIndex) =>
					(entry.features ?? []).flatMap((feature, index) =>
						feature.featureId === featureId
							? [['systemData', 'classes', classIndex, 'features', index]]
							: []
					)
				);
			return matches.length === 1 ? matches[0] : undefined;
		};
		properties = [name];
	} else if (kind === 'trait') {
		locate = () => {
			const traits = owner.read().systemData.race?.traits ?? [];
			return indexedPath(
				['systemData', 'race', 'traits'],
				uniqueIndex(traits.map((trait) => ({ id: trait.featureId })))
			);
		};
		properties = [name];
	} else if (kind === 'languages' || kind === 'tools') {
		locate = () =>
			indexedPath(
				['systemData', 'proficiencies', kind],
				uniqueIndex(owner.read().systemData.proficiencies[kind])
			);
		properties = [
			name,
			{
				path: ['source', 'kind'],
				label: 'Source',
				kind: 'select',
				fallback: 'other',
				options: ['ancestry', 'background', 'class', 'feature', 'other']
			}
		];
	} else if (kind === 'runtime-action') {
		locate = () =>
			indexedPath(
				['systemData', 'runtimeActions'],
				uniqueIndex(owner.read().systemData.runtimeActions)
			);
		properties = [
			name,
			{
				path: ['timing'],
				label: 'Timing',
				kind: 'select',
				fallback: 'action',
				options: ['action', 'bonusAction', 'reaction', 'free', 'other']
			},
			{
				path: ['category'],
				label: 'Category',
				kind: 'select',
				fallback: 'effect',
				options: ['attack', 'effect', 'other']
			},
			{ path: ['target'], label: 'Target' },
			{ path: ['notes'], label: 'Detail', kind: 'multiline' }
		];
	} else return undefined;
	const resolve = () => (owner.read().meta.id === ownerId ? locate() : undefined);
	const initialPath = resolve();
	if (!initialPath) return undefined;
	const initialName = String(
		getValueAtGridPath(owner.read(), [...initialPath, 'name']) ?? 'Record'
	);
	const readNotes = () => {
		const path = resolve();
		return path ? readGridAnnotationsAtPath(owner.read(), [...path, 'annotations']) : [];
	};
	const notes: SmallEditNotes = {
		read: readNotes,
		commit: (change) => {
			const path = resolve();
			if (!path) return stale();
			const next = mergeSmallNoteChange(readNotes(), change);
			if (!next) return stale();
			const error = validateDraftAnnotations(change.after ? [change.after] : []);
			if (error) return { ok: false, message: error };
			return commitCandidate(
				owner,
				applyGridPatches(owner.read(), [{ path: [...path, 'annotations'], value: next }])
			);
		}
	};
	return {
		get title() {
			const path = resolve();
			return path ? String(getValueAtGridPath(owner.read(), [...path, 'name'])) : initialName;
		},
		badges: () => {
			if (kind === 'runtime-action') {
				const row = projectRuntimeActionRows(
					owner.read().systemData.runtimeActions,
					owner.read()
				).find((entry) => entry.id === id);
				return row
					? [
							row.timingLabel,
							row.categoryLabel,
							row.source ? `Source: ${row.source.label}` : (row.sourceCategoryLabel ?? 'Custom')
						]
					: [];
			}
			const collection =
				kind === 'general-feature' || kind === 'class-feature'
					? 'features'
					: kind === 'trait'
						? 'traits'
						: kind === 'languages' || kind === 'tools'
							? kind
							: undefined;
			if (!collection) return [];
			const identity = kind === 'class-feature' ? id.slice(id.indexOf(':') + 1) : id;
			const row = projectSupportingCollectionRows(owner.read(), collection).find(
				(entry) => entry.identity === identity
			);
			return row?.context ? [row.context] : [];
		},
		annotationEditorConfig,
		fields: properties.map((property): SmallEditField => {
			const read = () => {
				const path = resolve();
				return path
					? scalar(getValueAtGridPath(owner.read(), [...path, ...property.path]))
					: undefined;
			};
			return {
				key: toGridJsonPointer(property.path),
				label: property.label,
				kind: property.kind ?? 'text',
				options: property.options,
				read,
				display: () => read() ?? property.fallback,
				notes: property === name ? notes : undefined,
				commit: (before, after) => {
					const path = resolve();
					if (!path || !sameEditValue(read(), before)) return stale();
					if (after === undefined) return { ok: false, message: 'This field cannot be cleared.' };
					if (property === name && (typeof after !== 'string' || !after.trim()))
						return { ok: false, message: 'Name cannot be empty.' };
					return commitCandidate(
						owner,
						applyGridPatches(owner.read(), [{ path: [...path, ...property.path], value: after }])
					);
				}
			};
		})
	};
};

const createScratchpadModel = (
	owner: SmallEditOwner,
	title: string,
	annotationEditorConfig?: GridAnnotationEditorConfig
): SmallEditModel => {
	const ownerId = owner.read().meta.id;
	const validOwner = () => owner.read().meta.id === ownerId;
	const find = (id: string) =>
		validOwner() ? owner.read().notes.findIndex((note) => note.id === id) : -1;
	const kinds = ['quick', 'session', 'lore', 'rules', 'other'];
	return {
		title,
		annotationEditorConfig,
		get fields() {
			return owner.read().notes.flatMap((note, index) =>
				(['title', 'body', 'kind'] as const).map((property): SmallEditField => ({
					key: `scratch:${note.id}:${property}`,
					entryKey: toGridJsonPointer([scratchpadNotesPathPrefix, index, property]),
					label: `Note ${index + 1} ${property === 'title' ? 'Title' : property === 'body' ? 'Body' : 'Kind'}`,
					kind: property === 'body' ? 'multiline' : property === 'kind' ? 'select' : 'text',
					options: property === 'kind' ? kinds : undefined,
					read: () => owner.read().notes[find(note.id)]?.[property],
					display: () =>
						owner.read().notes[find(note.id)]?.[property] ??
						(property === 'kind' ? 'other' : undefined),
					commit: (before, after) => {
						const currentIndex = find(note.id);
						if (
							currentIndex < 0 ||
							!sameEditValue(owner.read().notes[currentIndex][property], before)
						)
							return stale();
						if (typeof after !== 'string')
							return { ok: false, message: 'Enter text for this field.' };
						return commitCandidate(
							owner,
							applyGridPatches(owner.read(), [
								{ path: ['notes', currentIndex, property], value: after }
							])
						);
					}
				}))
			);
		},
		get actions(): SmallEditAction[] {
			return [
				{
					key: 'add-scratch-note',
					label: 'Add Note',
					fields: [
						{ key: 'title', label: 'Title', kind: 'text', read: () => 'Note' },
						{ key: 'body', label: 'Body', kind: 'multiline', read: () => '' },
						{ key: 'kind', label: 'Kind', kind: 'select', options: kinds, read: () => 'other' }
					],
					commit: (values) => {
						if (!validOwner()) return stale();
						return commitCandidate(
							owner,
							applyGridPatches(owner.read(), [
								{
									path: ['notes'],
									value: [
										...owner.read().notes,
										{ ...values, id: (owner.allocateId ?? createId)() }
									]
								}
							])
						);
					}
				},
				...owner.read().notes.map((note, index): SmallEditAction => ({
					key: `remove-scratch-${note.id}`,
					label: `Remove Note ${index + 1}: ${note.title ?? 'Untitled'}`,
					confirmation: 'Remove this scratchpad note? This cannot be undone.',
					commit: () => {
						if (find(note.id) < 0 || !sameEditValue(owner.read().notes[find(note.id)], note))
							return stale();
						return commitCandidate(
							owner,
							applyGridPatches(owner.read(), [
								{
									path: ['notes'],
									value: owner.read().notes.filter((entry) => entry.id !== note.id)
								}
							])
						);
					}
				}))
			];
		}
	};
};
