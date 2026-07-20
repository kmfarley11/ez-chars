import { applyGridPatches } from '$utils/characterGridHelpers';
import type { GridContentBindPath } from '$utils/gridContentTypes';
import type { RuntimeActionSuggestion } from '$lib/compendium/dnd5e2014/suggestInventoryRuntimeActions';
import { z } from 'zod';
import { createId as createProductionId } from '../../../schema/helpers';
import {
	annotationSchema,
	safeParse5e2014CharacterDocument,
	type AbilityKey,
	type Annotation,
	type CharacterDocument5e2014,
	type FeatureRef,
	type Item,
	type NamedProficiency,
	type NoteBlock,
	type ProficiencySourceKind,
	type RuntimeAction,
	type SpellRef
} from '../../../schema';
import {
	getInventoryGroupForItem,
	inventoryCurrencyMetadata,
	roleplayFieldMetadata,
	withInventoryGroupTags,
	type CurrencyDenomination,
	type InventoryGroup,
	type RoleplayFieldKey,
	type SpellListLevel
} from './sheetConstants';

const runtimeActionTimingSchema = z.enum(['action', 'bonusAction', 'reaction', 'free', 'other']);
const runtimeActionCategorySchema = z.enum(['attack', 'effect', 'other']);
const noteKindSchema = z.enum(['quick', 'session', 'lore', 'rules', 'other']);

export const spellEditorPayloadSchema = z.array(
	z
		.object({
			spellId: z.string().optional(),
			name: z.string().optional(),
			prepared: z.boolean().optional(),
			notes: z.string().optional()
		})
		.strict()
);

export const runtimeActionEditorPayloadSchema = z.array(
	z
		.object({
			id: z.string().optional(),
			name: z.string(),
			timing: runtimeActionTimingSchema.optional(),
			category: runtimeActionCategorySchema.optional(),
			target: z.string().optional(),
			notes: z.string().optional()
		})
		.strict()
);

export const proficiencyEditorPayloadSchema = z.array(
	z
		.object({
			name: z.string(),
			source: z.enum(['ancestry', 'background', 'class', 'feature', 'other'])
		})
		.strict()
);

export const classFeatureEditorPayloadSchema = z.array(
	z
		.object({
			featureId: z.string().optional(),
			name: z.string(),
			classIndex: z.number().int().min(0)
		})
		.strict()
);

export const inventoryEditorPayloadSchema = z.array(
	z
		.object({
			id: z.string().optional(),
			name: z.string(),
			notes: z.string().optional(),
			quantity: z.number().finite().optional(),
			weight: z.number().finite().optional(),
			value: z.string().optional(),
			equipped: z.boolean().optional()
		})
		.strict()
);

export const currencyAmountEditorPayloadSchema = z.number().finite();
export const roleplayFieldEditorPayloadSchema = z.string();

export const scratchpadEditorPayloadSchema = z.array(
	z
		.object({
			id: z.string().optional(),
			title: z.string(),
			body: z.string(),
			kind: noteKindSchema.optional()
		})
		.strict()
);

export const annotationEditorPayloadSchema = z.array(annotationSchema);

export type SpellEditorPayload = z.infer<typeof spellEditorPayloadSchema>;
export type RuntimeActionEditorPayload = z.infer<typeof runtimeActionEditorPayloadSchema>;
export type ProficiencyEditorPayload = z.infer<typeof proficiencyEditorPayloadSchema>;
export type ClassFeatureEditorPayload = z.infer<typeof classFeatureEditorPayloadSchema>;
export type InventoryEditorPayload = z.infer<typeof inventoryEditorPayloadSchema>;
export type ScratchpadEditorPayload = z.infer<typeof scratchpadEditorPayloadSchema>;

export type SheetEditIntent =
	| { type: 'replace-spell-level'; level: SpellListLevel; spells: SpellEditorPayload }
	| { type: 'replace-runtime-actions'; actions: RuntimeActionEditorPayload }
	| { type: 'accept-runtime-action-suggestion'; suggestion: RuntimeActionSuggestion }
	| { type: 'resync-runtime-action'; actionId: string }
	| { type: 'replace-proficiency-languages'; languages: ProficiencyEditorPayload }
	| { type: 'replace-proficiency-tools'; tools: ProficiencyEditorPayload }
	| { type: 'replace-class-features'; features: ClassFeatureEditorPayload }
	| { type: 'replace-inventory-group'; group: InventoryGroup; items: InventoryEditorPayload }
	| {
			type: 'update-currency';
			amounts: Partial<Record<CurrencyDenomination, number>>;
	  }
	| {
			type: 'replace-organizational-notes';
			roleplayBodies: Partial<Record<RoleplayFieldKey, string>>;
			scratchpad?: ScratchpadEditorPayload;
	  }
	| {
			type: 'replace-annotations';
			targetPath: GridContentBindPath;
			annotations: Array<Annotation>;
	  };

export type SheetEditIssueCode =
	| 'unsupported-target'
	| 'malformed-payload'
	| 'invalid-intent-target'
	| 'invalid-character';

export type SheetEditIssue = {
	code: SheetEditIssueCode;
	message: string;
	path?: GridContentBindPath;
};

export type SheetEditResult =
	| { ok: true; character: CharacterDocument5e2014 }
	| { ok: false; issues: ReadonlyArray<SheetEditIssue> };

export type SheetEditOptions = {
	createId?: () => string;
};

const trimmedIdOrNew = (candidate: string | undefined, createId: () => string): string => {
	const trimmed = candidate?.trim();
	return trimmed ? trimmed : createId();
};

const normalizedCurrencyAmount = (value: number): number => Math.max(0, Math.floor(value));

const replaceNamedProficiencies = (
	current: Array<NamedProficiency>,
	next: ProficiencyEditorPayload
): Array<NamedProficiency> => {
	const available = [...current];
	return next.flatMap((entry) => {
		const name = entry.name.trim();
		if (!name) return [];
		const currentIndex = available.findIndex(
			(candidate) => candidate.name === name && candidate.source?.kind === entry.source
		);
		const matching = currentIndex >= 0 ? available.splice(currentIndex, 1)[0] : undefined;
		return [
			{
				...matching,
				name,
				source: { ...matching?.source, kind: entry.source as ProficiencySourceKind }
			} satisfies NamedProficiency
		];
	});
};

const assertNever = (intent: never): never => {
	throw new Error(`Unhandled 5e sheet edit intent: ${JSON.stringify(intent)}`);
};

export const reduce5eSheetEditIntents = (
	character: CharacterDocument5e2014,
	intents: ReadonlyArray<SheetEditIntent>,
	options: SheetEditOptions = {}
): SheetEditResult => {
	const createId = options.createId ?? createProductionId;
	let candidate = structuredClone(character);

	for (const intent of intents) {
		switch (intent.type) {
			case 'replace-spell-level': {
				const currentSpellcasting = candidate.systemData.spellcasting;
				const currentSpells = currentSpellcasting?.spells ?? [];
				const currentSpellsById = new Map(
					currentSpells.flatMap((spell) => (spell.spellId ? [[spell.spellId, spell] as const] : []))
				);
				const nextLevelSpells = intent.spells.map((entry) => {
					const spellId = trimmedIdOrNew(entry.spellId, createId);
					const currentSpell = currentSpellsById.get(spellId);
					return {
						...currentSpell,
						spellId,
						name: entry.name ?? (intent.level === 0 ? 'Cantrip' : 'Spell'),
						level: intent.level,
						...(entry.prepared !== undefined ? { prepared: entry.prepared } : {}),
						...(entry.notes !== undefined ? { notes: entry.notes } : {})
					} satisfies SpellRef;
				});
				const defaultAbility: AbilityKey =
					currentSpellcasting?.ability ??
					candidate.systemData.classes.find((entry) => entry.spellcasting?.ability)?.spellcasting
						?.ability ??
					'int';
				candidate.systemData.spellcasting = {
					...currentSpellcasting,
					ability: defaultAbility,
					spells: [
						...currentSpells.filter((spell) => (spell.level ?? 0) !== intent.level),
						...nextLevelSpells
					].sort((left, right) => (left.level ?? 0) - (right.level ?? 0))
				};
				break;
			}

			case 'replace-runtime-actions': {
				const currentActions = candidate.systemData.runtimeActions;
				const currentActionsById = new Map(currentActions.map((action) => [action.id, action]));
				const nextActions = intent.actions.flatMap((entry) => {
					const name = entry.name.trim();
					if (!name) return [];
					const id = trimmedIdOrNew(entry.id, createId);
					const currentAction = currentActionsById.get(id);
					return [
						{
							...currentAction,
							id,
							name,
							...(entry.timing !== undefined ? { timing: entry.timing } : {}),
							...(entry.category !== undefined ? { category: entry.category } : {}),
							...(entry.target !== undefined ? { target: entry.target } : {}),
							...(entry.notes !== undefined ? { notes: entry.notes } : {})
						} satisfies RuntimeAction
					];
				});
				candidate.systemData.runtimeActions = nextActions;
				break;
			}

			case 'accept-runtime-action-suggestion': {
				const sourceItem = candidate.inventory.find(
					(item) => item.id === intent.suggestion.source.id && item.equipped === true
				);
				if (!sourceItem) {
					return {
						ok: false,
						issues: [
							{
								code: 'invalid-intent-target',
								message: `Action suggestion source item ${intent.suggestion.source.id} is missing or no longer equipped.`
							}
						]
					};
				}
				candidate.systemData.runtimeActions = [
					...candidate.systemData.runtimeActions,
					{ ...intent.suggestion, id: createId() } satisfies RuntimeAction
				];
				break;
			}

			case 'resync-runtime-action': {
				const actionIndex = candidate.systemData.runtimeActions.findIndex(
					(action) => action.id === intent.actionId
				);
				const action = candidate.systemData.runtimeActions[actionIndex];
				if (!action?.source) {
					return {
						ok: false,
						issues: [
							{
								code: 'invalid-intent-target',
								message: `Runtime action ${intent.actionId} is missing or has no linked source.`
							}
						]
					};
				}
				const sourceItem = candidate.inventory.find((item) => item.id === action.source?.id);
				if (!sourceItem) {
					return {
						ok: false,
						issues: [
							{
								code: 'invalid-intent-target',
								message: `Runtime action ${intent.actionId} references missing item ${action.source.id}.`
							}
						]
					};
				}
				const { notes: _notes, ...actionWithoutNotes } = action;
				candidate.systemData.runtimeActions[actionIndex] = {
					...actionWithoutNotes,
					name: sourceItem.name,
					...(sourceItem.notes !== undefined ? { notes: sourceItem.notes } : {})
				};
				break;
			}

			case 'replace-proficiency-languages': {
				candidate.systemData.proficiencies.languages = replaceNamedProficiencies(
					candidate.systemData.proficiencies.languages,
					intent.languages
				);
				break;
			}

			case 'replace-proficiency-tools': {
				candidate.systemData.proficiencies.tools = replaceNamedProficiencies(
					candidate.systemData.proficiencies.tools,
					intent.tools
				);
				break;
			}

			case 'replace-class-features': {
				const invalidEntry = intent.features.find(
					(entry) => entry.classIndex >= candidate.systemData.classes.length
				);
				if (invalidEntry) {
					return {
						ok: false,
						issues: [
							{
								code: 'invalid-intent-target',
								message: `Class feature targets missing class index ${invalidEntry.classIndex}.`
							}
						]
					};
				}
				const nextFeaturesByClass = new Map<number, Array<FeatureRef>>();
				for (const entry of intent.features) {
					const name = entry.name.trim();
					if (!name) continue;
					const currentFeatures = candidate.systemData.classes[entry.classIndex]?.features ?? [];
					const suppliedId = entry.featureId?.trim();
					const currentFeature = suppliedId
						? currentFeatures.find((feature) => feature.featureId === suppliedId)
						: undefined;
					const featureId = suppliedId || createId();
					const nextEntries = nextFeaturesByClass.get(entry.classIndex) ?? [];
					nextEntries.push({ ...currentFeature, featureId, name });
					nextFeaturesByClass.set(entry.classIndex, nextEntries);
				}
				candidate.systemData.classes = candidate.systemData.classes.map((entry, classIndex) => {
					const nextFeatures = nextFeaturesByClass.get(classIndex) ?? [];
					if (nextFeatures.length === 0 && entry.features === undefined) return entry;
					return { ...entry, features: nextFeatures };
				});
				break;
			}

			case 'replace-inventory-group': {
				const currentInventory = candidate.inventory;
				const currentGroupItemIds = new Set(
					currentInventory
						.filter((item) => getInventoryGroupForItem(item) === intent.group)
						.map((item) => item.id)
				);
				const currentItemsById = new Map(currentInventory.map((item) => [item.id, item]));
				const nextItems = intent.items.flatMap((entry) => {
					const name = entry.name.trim();
					if (!name) return [];
					const id = trimmedIdOrNew(entry.id, createId);
					const currentItem = currentItemsById.get(id);
					return [
						{
							...currentItem,
							id,
							name,
							tags: withInventoryGroupTags(currentItem?.tags, intent.group),
							equipped: entry.equipped ?? intent.group !== 'other',
							...(entry.quantity !== undefined ? { quantity: entry.quantity } : {}),
							...(entry.weight !== undefined ? { weight: entry.weight } : {}),
							...(entry.value !== undefined ? { value: entry.value } : {}),
							...(entry.notes !== undefined ? { notes: entry.notes } : {})
						} satisfies Item
					];
				});
				const stableGroups: Record<InventoryGroup, Array<Item>> = {
					weapons: currentInventory.filter((item) => getInventoryGroupForItem(item) === 'weapons'),
					armorShields: currentInventory.filter(
						(item) => getInventoryGroupForItem(item) === 'armorShields'
					),
					other: currentInventory.filter((item) => getInventoryGroupForItem(item) === 'other')
				};
				candidate.inventory = [
					...(intent.group === 'weapons' ? nextItems : stableGroups.weapons),
					...(intent.group === 'armorShields' ? nextItems : stableGroups.armorShields),
					...(intent.group === 'other' ? nextItems : stableGroups.other)
				];
				const nextItemIds = new Set(nextItems.map((item) => item.id));
				const removedItemIds = new Set(
					[...currentGroupItemIds].filter((itemId) => !nextItemIds.has(itemId))
				);
				if (removedItemIds.size > 0) {
					candidate.systemData.runtimeActions = candidate.systemData.runtimeActions.map(
						(action) => {
							if (action.source?.kind !== 'item' || !removedItemIds.has(action.source.id)) {
								return action;
							}
							const { source: _source, ...unlinkedAction } = action;
							return unlinkedAction;
						}
					);
				}
				break;
			}

			case 'update-currency': {
				const nextCurrency = structuredClone(candidate.systemData.currency);
				for (const { key } of inventoryCurrencyMetadata) {
					const currentAmount = nextCurrency[key];
					const amount = normalizedCurrencyAmount(
						intent.amounts[key] ?? currentAmount?.amount ?? 0
					);
					if (amount === 0) delete nextCurrency[key];
					else nextCurrency[key] = { ...currentAmount, amount };
				}
				candidate.systemData.currency = nextCurrency;
				break;
			}

			case 'replace-organizational-notes': {
				const currentNotes = candidate.notes;
				const currentNotesById = new Map(currentNotes.map((note) => [note.id, note]));
				const scratchpadNotes = intent.scratchpad
					? intent.scratchpad.flatMap((entry) => {
							const title = entry.title.trim();
							if (!title && !entry.body.trim()) return [];
							const id = trimmedIdOrNew(entry.id, createId);
							const currentNote = currentNotesById.get(id);
							return [
								{
									...currentNote,
									id,
									...(title ? { title } : {}),
									body: entry.body,
									...(entry.kind !== undefined ? { kind: entry.kind } : {})
								} satisfies NoteBlock
							];
						})
					: currentNotes;
				const nextRoleplay = structuredClone(candidate.systemData.roleplay);
				for (const { key } of roleplayFieldMetadata) {
					const currentField = nextRoleplay[key];
					const body = intent.roleplayBodies[key] ?? currentField?.body;
					if (body === undefined) continue;
					if (!body.trim()) delete nextRoleplay[key];
					else nextRoleplay[key] = { ...currentField, body };
				}
				candidate.notes = scratchpadNotes;
				candidate.systemData.roleplay = nextRoleplay;
				break;
			}

			case 'replace-annotations': {
				const entries: Record<string, Annotation> = {};
				for (const annotation of intent.annotations) {
					const id = trimmedIdOrNew(annotation.id, createId);
					if (id in entries) continue;
					entries[id] = { ...annotation, id };
				}
				candidate = applyGridPatches(candidate, [
					{
						path: intent.targetPath,
						value: Object.keys(entries).length > 0 ? entries : undefined
					}
				]);
				break;
			}

			default:
				assertNever(intent);
		}
	}

	const parsed = safeParse5e2014CharacterDocument(candidate);
	if (!parsed.success) {
		return {
			ok: false,
			issues: parsed.error.issues.map((issue) => ({
				code: 'invalid-character',
				message: `${issue.path.join('.') || 'character'}: ${issue.message}`
			}))
		};
	}

	return { ok: true, character: parsed.data };
};
