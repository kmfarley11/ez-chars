import { getValueAtGridPath } from '$lib/gridContentHelpers';
import type {
	GridContentAnnotation,
	GridContentBindPath,
	GridContentPatch
} from '$lib/gridContentTypes';
import { createId as createProductionId } from '../../../schema/helpers';
import {
	annotationSchema,
	type AbilityKey,
	type Annotation,
	type CharacterDocument5e2014,
	type FeatureRef,
	type Item,
	type NoteBlock,
	type RuntimeAction,
	type SpellRef
} from '../../../schema';
import {
	classFeatureListPathPrefix,
	currencyTagForDenomination,
	getCurrencyDenominationForItem,
	getInventoryGroupForItem,
	inventoryCurrencyMetadata,
	inventoryCurrencyPathPrefix,
	inventoryListPathPrefix,
	isCurrencyDenomination,
	isCurrencyInventoryItem,
	proficiencyLanguagesPathPrefix,
	roleplayNoteMetadata,
	roleplayNotePathPrefix,
	runtimeActionListPathPrefix,
	scratchpadNotesPathPrefix,
	spellListLevelPathPrefix,
	spellSlotLevelMetadata,
	withInventoryGroupTags,
	type CurrencyDenomination,
	type InventoryGroup,
	type ProficiencyLanguageSource,
	type RoleplayNoteKey,
	type SpellListLevel
} from './sheetConstants';

type AnnotationEntries = Record<string, Annotation>;
type IdFactory = () => string;

export type Normalize5eGridPatchesOptions = {
	createId?: IdFactory;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const pathsEqual = (left: GridContentBindPath, right: GridContentBindPath): boolean =>
	left.length === right.length && left.every((segment, idx) => segment === right[idx]);

const pathStartsWith = (path: GridContentBindPath, prefix: GridContentBindPath): boolean =>
	prefix.every((segment, idx) => path[idx] === segment);

const isSystemDataAnnotationPath = (path: GridContentBindPath): boolean =>
	path.length >= 3 &&
	path[0] === 'systemData' &&
	path[1] === 'annotations' &&
	path[path.length - 1] === '_annotations';

const isSpellLevelListPath = (
	path: GridContentBindPath
): path is [typeof spellListLevelPathPrefix, SpellListLevel] =>
	path.length === 2 && path[0] === spellListLevelPathPrefix && typeof path[1] === 'number';

const isRuntimeActionListPath = (
	path: GridContentBindPath
): path is [typeof runtimeActionListPathPrefix] =>
	path.length === 1 && path[0] === runtimeActionListPathPrefix;

const isProficiencyLanguagesPath = (
	path: GridContentBindPath
): path is [typeof proficiencyLanguagesPathPrefix] =>
	path.length === 1 && path[0] === proficiencyLanguagesPathPrefix;

const isClassFeatureListPath = (
	path: GridContentBindPath
): path is [typeof classFeatureListPathPrefix] =>
	path.length === 1 && path[0] === classFeatureListPathPrefix;

const isInventoryListPath = (
	path: GridContentBindPath
): path is [typeof inventoryListPathPrefix, InventoryGroup] =>
	path.length === 2 &&
	path[0] === inventoryListPathPrefix &&
	(path[1] === 'weapons' || path[1] === 'armorShields' || path[1] === 'other');

const isInventoryCurrencyFieldPath = (
	path: GridContentBindPath
): path is [typeof inventoryCurrencyPathPrefix, CurrencyDenomination] =>
	path.length === 2 &&
	path[0] === inventoryCurrencyPathPrefix &&
	typeof path[1] === 'string' &&
	isCurrencyDenomination(path[1]);

const isInventoryCurrencyPatchPath = (
	path: GridContentBindPath
): path is [typeof inventoryCurrencyPathPrefix] =>
	path.length === 1 && path[0] === inventoryCurrencyPathPrefix;

const isRoleplayNotePath = (
	path: GridContentBindPath
): path is [typeof roleplayNotePathPrefix, RoleplayNoteKey] =>
	path.length === 2 &&
	path[0] === roleplayNotePathPrefix &&
	typeof path[1] === 'string' &&
	roleplayNoteMetadata.some((entry) => entry.key === path[1]);

const isScratchpadNotesPath = (
	path: GridContentBindPath
): path is [typeof scratchpadNotesPathPrefix] =>
	path.length === 1 && path[0] === scratchpadNotesPathPrefix;

const isValidAnnotationArray = (value: unknown): value is Array<GridContentAnnotation> =>
	Array.isArray(value) && value.every((entry) => annotationSchema.safeParse(entry).success);

const annotationEntriesFromArray = (
	annotations: Array<GridContentAnnotation>,
	createId: IdFactory
): Record<string, Annotation> => {
	const entries: Record<string, Annotation> = {};
	for (const candidate of annotations) {
		const parsed = annotationSchema.safeParse(candidate);
		if (!parsed.success) continue;
		const id =
			typeof parsed.data.id === 'string' && parsed.data.id.trim().length > 0
				? parsed.data.id
				: createId();
		if (id in entries) continue;
		entries[id] = { ...parsed.data, id };
	}
	return entries;
};

const roleplayNoteTitleForKey = (key: RoleplayNoteKey): string =>
	roleplayNoteMetadata.find((entry) => entry.key === key)?.title ?? key;

const isRoleplayNoteTitle = (title: string | undefined): boolean =>
	roleplayNoteMetadata.some((entry) => entry.title === title);

export const normalize5eGridPatches = (
	char: CharacterDocument5e2014,
	patches: Array<GridContentPatch>,
	options: Normalize5eGridPatchesOptions = {}
): Array<GridContentPatch> => {
	const createId = options.createId ?? createProductionId;
	const runtimeActions = char.systemData.runtimeActions ?? char.systemData.attacks ?? [];
	const defaultSpellcastingAbility: AbilityKey =
		char.systemData.spellcasting?.ability ??
		char.systemData.classes.find((entry) => entry.spellcasting?.ability)?.spellcasting?.ability ??
		'int';
	const defaultRaceName = char.systemData.race?.name ?? char.identity.ancestryLineage ?? 'Ancestry';
	const defaultBackgroundName =
		char.systemData.background?.name ?? char.identity.background ?? 'Background';
	const getRoleplayNote = (key: RoleplayNoteKey): NoteBlock | undefined =>
		(char.notes ?? []).find((note) => note.title === roleplayNoteTitleForKey(key));

	const normalizeSpellLevelValue = (level: SpellListLevel, value: unknown): Array<SpellRef> => {
		if (!Array.isArray(value)) return [];
		return value.flatMap((candidate) => {
			if (!isObjectRecord(candidate)) return [];
			const name =
				typeof candidate.name === 'string' ? candidate.name : level === 0 ? 'Cantrip' : 'Spell';
			const nextSpell: SpellRef = { name, level };
			if (typeof candidate.prepared === 'boolean') nextSpell.prepared = candidate.prepared;
			if (typeof candidate.notes === 'string') nextSpell.notes = candidate.notes;
			return [nextSpell];
		});
	};

	const mergeSpellLevelPatch = (level: SpellListLevel, value: unknown): GridContentPatch => {
		const currentSpells = char.systemData.spellcasting?.spells ?? [];
		const nextLevelSpells = normalizeSpellLevelValue(level, value);
		return {
			path: ['systemData', 'spellcasting', 'spells'],
			value: [
				...currentSpells.filter((spell) => (spell.level ?? 0) !== level),
				...nextLevelSpells
			].sort((left, right) => (left.level ?? 0) - (right.level ?? 0))
		};
	};

	const normalizeRuntimeActionListValue = (value: unknown): Array<RuntimeAction> => {
		if (!Array.isArray(value)) return [];
		const currentActionsById = Object.fromEntries(
			runtimeActions.map((action) => [action.id, action])
		) as Record<string, RuntimeAction>;
		return value.flatMap((candidate) => {
			if (!isObjectRecord(candidate)) return [];
			const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
			if (name.length === 0) return [];
			const currentId =
				typeof candidate.id === 'string' && candidate.id.trim().length > 0
					? candidate.id
					: createId();
			const currentAction = currentActionsById[currentId];
			const timing =
				candidate.timing === 'action' ||
				candidate.timing === 'bonusAction' ||
				candidate.timing === 'reaction' ||
				candidate.timing === 'free' ||
				candidate.timing === 'other'
					? candidate.timing
					: currentAction?.timing;
			const category =
				candidate.category === 'attack' ||
				candidate.category === 'effect' ||
				candidate.category === 'other'
					? candidate.category
					: currentAction?.category;
			return [
				{
					...currentAction,
					id: currentId,
					name,
					...(timing ? { timing } : {}),
					...(category ? { category } : {}),
					...(typeof candidate.target === 'string' ? { target: candidate.target } : {}),
					...(typeof candidate.notes === 'string' ? { notes: candidate.notes } : {})
				} satisfies RuntimeAction
			];
		});
	};

	const mergeRuntimeActionListPatch = (value: unknown): Array<GridContentPatch> => {
		const nextActions = normalizeRuntimeActionListValue(value);
		return [
			{
				path: ['systemData', 'runtimeActions'],
				value: nextActions.length > 0 ? nextActions : undefined
			},
			{ path: ['systemData', 'attacks'], value: undefined }
		];
	};

	const normalizeProficiencyLanguageValue = (
		value: unknown
	): Record<ProficiencyLanguageSource, Array<string>> => {
		const next: Record<ProficiencyLanguageSource, Array<string>> = {
			race: [],
			background: []
		};
		if (!Array.isArray(value)) return next;
		for (const candidate of value) {
			if (!isObjectRecord(candidate)) continue;
			const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
			if (name.length === 0) continue;
			const source: ProficiencyLanguageSource = candidate.source === 'race' ? 'race' : 'background';
			next[source].push(name);
		}
		return next;
	};

	const mergeProficiencyLanguagePatches = (value: unknown): Array<GridContentPatch> => {
		const nextLanguages = normalizeProficiencyLanguageValue(value);
		const result: Array<GridContentPatch> = [];
		if (nextLanguages.race.length > 0 || char.systemData.race?.languages !== undefined) {
			result.push({ path: ['systemData', 'race', 'languages'], value: nextLanguages.race });
		}
		if (
			nextLanguages.background.length > 0 ||
			char.systemData.background?.proficiencies?.languages !== undefined
		) {
			result.push({
				path: ['systemData', 'background', 'proficiencies', 'languages'],
				value: nextLanguages.background
			});
		}
		return result;
	};

	const mergeClassFeaturePatches = (value: unknown): Array<GridContentPatch> => {
		const nextFeaturesByClass: Array<Array<FeatureRef>> = [];
		if (Array.isArray(value)) {
			for (const candidate of value) {
				if (!isObjectRecord(candidate)) continue;
				const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
				const classIndex =
					typeof candidate.classIndex === 'number' && Number.isInteger(candidate.classIndex)
						? candidate.classIndex
						: undefined;
				if (name.length === 0 || classIndex === undefined) continue;
				const currentEntries = nextFeaturesByClass[classIndex] ?? [];
				currentEntries.push({
					name,
					...(typeof candidate.featureId === 'string' && candidate.featureId.trim().length > 0
						? { featureId: candidate.featureId }
						: {})
				});
				nextFeaturesByClass[classIndex] = currentEntries;
			}
		}
		return char.systemData.classes.flatMap((entry, classIndex) => {
			const nextFeatures = nextFeaturesByClass[classIndex] ?? [];
			if (nextFeatures.length === 0 && entry.features === undefined) return [];
			return [{ path: ['systemData', 'classes', classIndex, 'features'], value: nextFeatures }];
		});
	};

	const normalizeInventoryListValue = (value: unknown, group: InventoryGroup): Array<Item> => {
		if (!Array.isArray(value)) return [];
		const currentItemsById = Object.fromEntries(
			(char.inventory ?? []).map((item) => [item.id, item])
		) as Record<string, Item>;
		return value.flatMap((candidate) => {
			if (!isObjectRecord(candidate)) return [];
			const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
			if (name.length === 0) return [];
			const currentId =
				typeof candidate.id === 'string' && candidate.id.trim().length > 0
					? candidate.id
					: createId();
			const currentItem = currentItemsById[currentId];
			const equipped =
				typeof candidate.equipped === 'boolean' ? candidate.equipped : group !== 'other';
			return [
				{
					...currentItem,
					id: currentId,
					name,
					tags: withInventoryGroupTags(currentItem?.tags, group),
					equipped,
					quantity:
						typeof candidate.quantity === 'number' && Number.isFinite(candidate.quantity)
							? candidate.quantity
							: currentItem?.quantity,
					weight:
						typeof candidate.weight === 'number' && Number.isFinite(candidate.weight)
							? candidate.weight
							: currentItem?.weight,
					value: typeof candidate.value === 'string' ? candidate.value : currentItem?.value,
					notes: typeof candidate.notes === 'string' ? candidate.notes : currentItem?.notes
				}
			];
		});
	};

	const mergeInventoryPatches = (
		group: InventoryGroup,
		value: unknown
	): Array<GridContentPatch> => {
		const currentInventory = char.inventory ?? [];
		const normalizedItems = normalizeInventoryListValue(value, group);
		const currencyItems = currentInventory.filter((item) => isCurrencyInventoryItem(item));
		const stableWeapons = currentInventory.filter(
			(item) => !isCurrencyInventoryItem(item) && getInventoryGroupForItem(item) === 'weapons'
		);
		const stableArmorShields = currentInventory.filter(
			(item) => !isCurrencyInventoryItem(item) && getInventoryGroupForItem(item) === 'armorShields'
		);
		const stableOther = currentInventory.filter(
			(item) => !isCurrencyInventoryItem(item) && getInventoryGroupForItem(item) === 'other'
		);
		return [
			{
				path: ['inventory'],
				value: [
					...(group === 'weapons' ? normalizedItems : stableWeapons),
					...(group === 'armorShields' ? normalizedItems : stableArmorShields),
					...(group === 'other' ? normalizedItems : stableOther),
					...currencyItems
				]
			}
		];
	};

	const normalizeCurrencyAmount = (value: unknown): number => {
		if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
		return Math.max(0, Math.floor(value));
	};

	const coalesceInventoryCurrencyPatches = (
		currentPatches: Array<GridContentPatch>
	): Array<GridContentPatch> => {
		const currencyPatches = currentPatches.filter((patch) =>
			isInventoryCurrencyFieldPath(patch.path)
		);
		if (currencyPatches.length === 0) return currentPatches;
		const nextCurrencyValues = Object.fromEntries(
			inventoryCurrencyMetadata.map(({ key }) => {
				const currentItem = (char.inventory ?? []).find(
					(item) => getCurrencyDenominationForItem(item) === key
				);
				return [key, currentItem?.quantity ?? 0];
			})
		) as Record<CurrencyDenomination, number>;
		for (const patch of currencyPatches) {
			const denomination = patch.path[1] as CurrencyDenomination;
			nextCurrencyValues[denomination] = normalizeCurrencyAmount(patch.value);
		}
		return [
			...currentPatches.filter((patch) => !isInventoryCurrencyFieldPath(patch.path)),
			{ path: [inventoryCurrencyPathPrefix], value: nextCurrencyValues }
		];
	};

	const mergeInventoryCurrencyPatch = (value: unknown): Array<GridContentPatch> => {
		const currentInventory = char.inventory ?? [];
		const stableItems = currentInventory.filter((item) => !isCurrencyInventoryItem(item));
		const currentCurrencyItemsByDenomination = Object.fromEntries(
			currentInventory.flatMap((item) => {
				const denomination = getCurrencyDenominationForItem(item);
				return denomination ? [[denomination, item] as const] : [];
			})
		) as Partial<Record<CurrencyDenomination, Item>>;
		const nextCurrencyValues = isObjectRecord(value) ? value : {};
		const nextCurrencyItems = inventoryCurrencyMetadata.flatMap(({ key, label }) => {
			const amount = normalizeCurrencyAmount(nextCurrencyValues[key]);
			if (amount === 0) return [];
			const currentItem = currentCurrencyItemsByDenomination[key];
			return [
				{
					...currentItem,
					id: currentItem?.id ?? createId(),
					name: label,
					quantity: amount,
					tags: [currencyTagForDenomination(key)]
				} satisfies Item
			];
		});
		return [{ path: ['inventory'], value: [...stableItems, ...nextCurrencyItems] }];
	};

	const normalizeScratchpadNotesValue = (value: unknown): Array<NoteBlock> => {
		if (!Array.isArray(value)) return [];
		const currentNotesById = Object.fromEntries(
			(char.notes ?? []).map((note) => [note.id, note])
		) as Record<string, NoteBlock>;
		return value.flatMap((candidate) => {
			if (!isObjectRecord(candidate)) return [];
			const title = typeof candidate.title === 'string' ? candidate.title.trim() : '';
			const body = typeof candidate.body === 'string' ? candidate.body : '';
			if (title.length === 0 && body.trim().length === 0) return [];
			const currentId =
				typeof candidate.id === 'string' && candidate.id.trim().length > 0
					? candidate.id
					: createId();
			const currentNote = currentNotesById[currentId];
			const kind =
				candidate.kind === 'quick' ||
				candidate.kind === 'session' ||
				candidate.kind === 'lore' ||
				candidate.kind === 'rules' ||
				candidate.kind === 'other'
					? candidate.kind
					: currentNote?.kind;
			return [
				{
					...currentNote,
					id: currentId,
					...(title.length > 0 ? { title } : {}),
					body,
					...(kind ? { kind } : {})
				} satisfies NoteBlock
			];
		});
	};

	const coalesceOrganizationalNotePatches = (
		currentPatches: Array<GridContentPatch>
	): Array<GridContentPatch> => {
		const roleplayPatches = currentPatches.filter((patch) => isRoleplayNotePath(patch.path));
		const scratchpadPatch = currentPatches.find((patch) => isScratchpadNotesPath(patch.path));
		if (roleplayPatches.length === 0 && !scratchpadPatch) return currentPatches;
		const currentNotes = char.notes ?? [];
		const nextRoleplayBodies = Object.fromEntries(
			roleplayNoteMetadata.map(({ key }) => [key, getRoleplayNote(key)?.body ?? ''])
		) as Record<RoleplayNoteKey, string>;
		for (const patch of roleplayPatches) {
			const key = patch.path[1] as RoleplayNoteKey;
			nextRoleplayBodies[key] = typeof patch.value === 'string' ? patch.value : '';
		}
		const nextScratchpadNotes = scratchpadPatch
			? normalizeScratchpadNotesValue(scratchpadPatch.value)
			: currentNotes.filter((note) => !isRoleplayNoteTitle(note.title));
		const nextRoleplayNotes = roleplayNoteMetadata.flatMap(({ key, title }) => {
			const body = nextRoleplayBodies[key];
			if (body.trim().length === 0) return [];
			const currentNote = getRoleplayNote(key);
			return [
				{
					...currentNote,
					id: currentNote?.id ?? createId(),
					title,
					body,
					kind: currentNote?.kind ?? 'lore'
				} satisfies NoteBlock
			];
		});
		return [
			...currentPatches.filter(
				(patch) => !isRoleplayNotePath(patch.path) && !isScratchpadNotesPath(patch.path)
			),
			{
				path: ['notes'],
				value:
					nextScratchpadNotes.length > 0 || nextRoleplayNotes.length > 0
						? [...nextScratchpadNotes, ...nextRoleplayNotes]
						: undefined
			}
		];
	};

	const withSpellcastingDefaults = (
		currentPatches: Array<GridContentPatch>
	): Array<GridContentPatch> => {
		const normalized = [...currentPatches];
		const touchesSpellcasting = normalized.some((patch) =>
			pathStartsWith(patch.path, ['systemData', 'spellcasting'])
		);
		if (!touchesSpellcasting) return normalized;
		const abilityPath: GridContentBindPath = ['systemData', 'spellcasting', 'ability'];
		if (
			char.systemData.spellcasting?.ability === undefined &&
			!normalized.some((patch) => pathsEqual(patch.path, abilityPath))
		) {
			normalized.unshift({ path: abilityPath, value: defaultSpellcastingAbility });
		}
		for (const { key } of spellSlotLevelMetadata) {
			const usedPath: GridContentBindPath = ['systemData', 'spellcasting', 'slots', key, 'used'];
			const maxPath: GridContentBindPath = ['systemData', 'spellcasting', 'slots', key, 'max'];
			const touchesUsed = normalized.some((patch) => pathsEqual(patch.path, usedPath));
			const touchesMax = normalized.some((patch) => pathsEqual(patch.path, maxPath));
			const currentSlot = char.systemData.spellcasting?.slots?.[key];
			if ((touchesUsed || touchesMax) && currentSlot?.used === undefined && !touchesUsed) {
				normalized.push({ path: usedPath, value: 0 });
			}
			if ((touchesUsed || touchesMax) && currentSlot?.max === undefined && !touchesMax) {
				normalized.push({ path: maxPath, value: 0 });
			}
		}
		return normalized;
	};

	const withIdentityBackedDefaults = (
		currentPatches: Array<GridContentPatch>
	): Array<GridContentPatch> => {
		const normalized = [...currentPatches];
		const raceNamePath: GridContentBindPath = ['systemData', 'race', 'name'];
		if (
			normalized.some((patch) => pathStartsWith(patch.path, ['systemData', 'race'])) &&
			char.systemData.race?.name === undefined &&
			!normalized.some((patch) => pathsEqual(patch.path, raceNamePath))
		) {
			normalized.unshift({ path: raceNamePath, value: defaultRaceName });
		}
		const backgroundNamePath: GridContentBindPath = ['systemData', 'background', 'name'];
		if (
			normalized.some((patch) => pathStartsWith(patch.path, ['systemData', 'background'])) &&
			char.systemData.background?.name === undefined &&
			!normalized.some((patch) => pathsEqual(patch.path, backgroundNamePath))
		) {
			normalized.unshift({ path: backgroundNamePath, value: defaultBackgroundName });
		}
		return normalized;
	};

	const toAnnotationPatches = (patch: GridContentPatch): Array<GridContentPatch> => {
		if (!isSystemDataAnnotationPath(patch.path)) return [patch];
		if (!isValidAnnotationArray(patch.value)) return [];
		if (patch.value.length === 0) return [{ ...patch, value: undefined }];
		const entries = annotationEntriesFromArray(patch.value, createId);
		return Object.keys(entries).length > 0
			? [{ ...patch, value: entries as AnnotationEntries }]
			: [];
	};

	const valuesEqual = (left: unknown, right: unknown): boolean =>
		JSON.stringify(left) === JSON.stringify(right);
	const dropNoopPatches = (currentPatches: Array<GridContentPatch>): Array<GridContentPatch> =>
		currentPatches.filter((patch) => {
			const currentValue = getValueAtGridPath(char, patch.path);
			if (typeof patch.value === 'undefined') return typeof currentValue !== 'undefined';
			if (Array.isArray(patch.value) && patch.value.length === 0 && currentValue === undefined) {
				return false;
			}
			return !valuesEqual(currentValue, patch.value);
		});

	return withIdentityBackedDefaults(
		withSpellcastingDefaults(
			dropNoopPatches(
				coalesceOrganizationalNotePatches(coalesceInventoryCurrencyPatches(patches))
					.flatMap((patch) => {
						if (isSpellLevelListPath(patch.path)) {
							return [mergeSpellLevelPatch(patch.path[1], patch.value)];
						}
						if (isRuntimeActionListPath(patch.path)) {
							return mergeRuntimeActionListPatch(patch.value);
						}
						if (isProficiencyLanguagesPath(patch.path)) {
							return mergeProficiencyLanguagePatches(patch.value);
						}
						if (isClassFeatureListPath(patch.path)) {
							return mergeClassFeaturePatches(patch.value);
						}
						if (isInventoryListPath(patch.path)) {
							return mergeInventoryPatches(patch.path[1], patch.value);
						}
						if (isInventoryCurrencyPatchPath(patch.path)) {
							return mergeInventoryCurrencyPatch(patch.value);
						}
						return [patch];
					})
					.flatMap((patch) => toAnnotationPatches(patch))
			)
		)
	);
};
