import { applyGridPatches } from '$lib/characterGridHelpers';
import type { GridContentBindPath } from '$lib/gridContentTypes';
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
	type NoteBlock,
	type RuntimeAction,
	type SpellRef
} from '../../../schema';
import {
	currencyTagForDenomination,
	getCurrencyDenominationForItem,
	getInventoryGroupForItem,
	inventoryCurrencyMetadata,
	isCurrencyInventoryItem,
	roleplayNoteMetadata,
	withInventoryGroupTags,
	type CurrencyDenomination,
	type InventoryGroup,
	type ProficiencyLanguageSource,
	type RoleplayNoteKey,
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

export const proficiencyLanguageEditorPayloadSchema = z.array(
	z
		.object({
			name: z.string(),
			source: z.enum(['race', 'background'])
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
export const roleplayNoteEditorPayloadSchema = z.string();

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
export type ProficiencyLanguageEditorPayload = z.infer<
	typeof proficiencyLanguageEditorPayloadSchema
>;
export type ClassFeatureEditorPayload = z.infer<typeof classFeatureEditorPayloadSchema>;
export type InventoryEditorPayload = z.infer<typeof inventoryEditorPayloadSchema>;
export type ScratchpadEditorPayload = z.infer<typeof scratchpadEditorPayloadSchema>;

export type SheetEditIntent =
	| { type: 'replace-spell-level'; level: SpellListLevel; spells: SpellEditorPayload }
	| { type: 'replace-runtime-actions'; actions: RuntimeActionEditorPayload }
	| { type: 'replace-proficiency-languages'; languages: ProficiencyLanguageEditorPayload }
	| { type: 'replace-class-features'; features: ClassFeatureEditorPayload }
	| { type: 'replace-inventory-group'; group: InventoryGroup; items: InventoryEditorPayload }
	| {
			type: 'update-currency';
			amounts: Partial<Record<CurrencyDenomination, number>>;
	  }
	| {
			type: 'replace-organizational-notes';
			roleplayBodies: Partial<Record<RoleplayNoteKey, string>>;
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

const roleplayNoteTitleForKey = (key: RoleplayNoteKey): string =>
	roleplayNoteMetadata.find((entry) => entry.key === key)?.title ?? key;

const isRoleplayNoteTitle = (title: string | undefined): boolean =>
	roleplayNoteMetadata.some((entry) => entry.title === title);

const normalizedCurrencyAmount = (value: number): number => Math.max(0, Math.floor(value));

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
				const currentActions =
					candidate.systemData.runtimeActions ?? candidate.systemData.attacks ?? [];
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
				if (nextActions.length > 0) candidate.systemData.runtimeActions = nextActions;
				else delete candidate.systemData.runtimeActions;
				delete candidate.systemData.attacks;
				break;
			}

			case 'replace-proficiency-languages': {
				const nextLanguages: Record<ProficiencyLanguageSource, Array<string>> = {
					race: [],
					background: []
				};
				for (const entry of intent.languages) {
					const name = entry.name.trim();
					if (name) nextLanguages[entry.source].push(name);
				}
				if (nextLanguages.race.length > 0 || candidate.systemData.race?.languages !== undefined) {
					candidate.systemData.race = {
						...(candidate.systemData.race ?? {
							name: candidate.identity.ancestryLineage ?? 'Ancestry'
						}),
						languages: nextLanguages.race
					};
				}
				if (
					nextLanguages.background.length > 0 ||
					candidate.systemData.background?.proficiencies?.languages !== undefined
				) {
					const currentBackground = candidate.systemData.background ?? {
						name: candidate.identity.background ?? 'Background'
					};
					candidate.systemData.background = {
						...currentBackground,
						proficiencies: {
							...currentBackground.proficiencies,
							languages: nextLanguages.background
						}
					};
				}
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
				const currentInventory = candidate.inventory ?? [];
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
				const currencyItems = currentInventory.filter(isCurrencyInventoryItem);
				const stableGroups: Record<InventoryGroup, Array<Item>> = {
					weapons: currentInventory.filter(
						(item) => !isCurrencyInventoryItem(item) && getInventoryGroupForItem(item) === 'weapons'
					),
					armorShields: currentInventory.filter(
						(item) =>
							!isCurrencyInventoryItem(item) && getInventoryGroupForItem(item) === 'armorShields'
					),
					other: currentInventory.filter(
						(item) => !isCurrencyInventoryItem(item) && getInventoryGroupForItem(item) === 'other'
					)
				};
				candidate.inventory = [
					...(intent.group === 'weapons' ? nextItems : stableGroups.weapons),
					...(intent.group === 'armorShields' ? nextItems : stableGroups.armorShields),
					...(intent.group === 'other' ? nextItems : stableGroups.other),
					...currencyItems
				];
				break;
			}

			case 'update-currency': {
				const currentInventory = candidate.inventory ?? [];
				const stableItems = currentInventory.filter((item) => !isCurrencyInventoryItem(item));
				const currentCurrencyItems = new Map(
					currentInventory.flatMap((item) => {
						const denomination = getCurrencyDenominationForItem(item);
						return denomination ? [[denomination, item] as const] : [];
					})
				);
				const nextCurrencyItems = inventoryCurrencyMetadata.flatMap(({ key, label }) => {
					const currentItem = currentCurrencyItems.get(key);
					const amount = normalizedCurrencyAmount(
						intent.amounts[key] ?? currentItem?.quantity ?? 0
					);
					if (amount === 0) return [];
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
				candidate.inventory = [...stableItems, ...nextCurrencyItems];
				break;
			}

			case 'replace-organizational-notes': {
				const currentNotes = candidate.notes ?? [];
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
					: currentNotes.filter((note) => !isRoleplayNoteTitle(note.title));
				const roleplayNotes = roleplayNoteMetadata.flatMap(({ key, title }) => {
					const currentNote = currentNotes.find((note) => note.title === title);
					const body = intent.roleplayBodies[key] ?? currentNote?.body ?? '';
					if (!body.trim()) return [];
					return [
						{
							...currentNote,
							id: currentNote?.id ?? createId(),
							title: roleplayNoteTitleForKey(key),
							body,
							kind: currentNote?.kind ?? 'lore'
						} satisfies NoteBlock
					];
				});
				const nextNotes = [...scratchpadNotes, ...roleplayNotes];
				if (nextNotes.length > 0) candidate.notes = nextNotes;
				else delete candidate.notes;
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
