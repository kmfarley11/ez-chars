import type { GridContentBindPath, GridContentPatch } from '$lib/gridContentTypes';
import { spellLevelSchema } from '../../../schema';
import {
	annotationEditorPayloadSchema,
	classFeatureEditorPayloadSchema,
	currencyAmountEditorPayloadSchema,
	inventoryEditorPayloadSchema,
	proficiencyEditorPayloadSchema,
	roleplayFieldEditorPayloadSchema,
	runtimeActionEditorPayloadSchema,
	scratchpadEditorPayloadSchema,
	spellEditorPayloadSchema,
	type SheetEditIntent,
	type SheetEditIssue
} from './sheetEditIntents';
import {
	classFeatureListPathPrefix,
	currencyPathPrefix,
	inventoryListPathPrefix,
	isCurrencyDenomination,
	proficiencyLanguagesPathPrefix,
	proficiencyToolsPathPrefix,
	roleplayFieldMetadata,
	roleplayFieldPathPrefix,
	runtimeActionListPathPrefix,
	scratchpadNotesPathPrefix,
	spellListLevelPathPrefix,
	type CurrencyDenomination,
	type InventoryGroup,
	type RoleplayFieldKey,
	type SpellListLevel
} from './sheetConstants';

export type Decoded5eSheetEdits = {
	intents: Array<SheetEditIntent>;
	canonicalPatches: Array<GridContentPatch>;
};

export type Decode5eSheetEditsResult =
	| { ok: true; edits: Decoded5eSheetEdits }
	| { ok: false; issues: ReadonlyArray<SheetEditIssue> };

const isSystemDataAnnotationPath = (path: GridContentBindPath): boolean =>
	path.length >= 3 &&
	path[0] === 'systemData' &&
	path[1] === 'annotations' &&
	path[path.length - 1] === '_annotations';

const isVirtualPath = (path: GridContentBindPath): boolean =>
	typeof path[0] === 'string' && path[0].startsWith('__');

const payloadIssue = (
	patch: GridContentPatch,
	family: string,
	message: string
): SheetEditIssue => ({
	code: 'malformed-payload',
	message: `Invalid ${family} editor payload: ${message}`,
	path: patch.path
});

const unsupportedIssue = (patch: GridContentPatch): SheetEditIssue => ({
	code: 'unsupported-target',
	message: `Unsupported structured 5e edit target: ${patch.path.join('.') || '(empty path)'}.`,
	path: patch.path
});

const formatParseIssue = (issues: ReadonlyArray<{ message: string }>): string =>
	issues.map((issue) => issue.message).join('; ');

export const decode5eGridPatches = (
	patches: ReadonlyArray<GridContentPatch>
): Decode5eSheetEditsResult => {
	const intents: Array<SheetEditIntent> = [];
	const canonicalPatches: Array<GridContentPatch> = [];
	const issues: Array<SheetEditIssue> = [];
	const currencyAmounts: Partial<Record<CurrencyDenomination, number>> = {};
	const roleplayBodies: Partial<Record<RoleplayFieldKey, string>> = {};
	let sawCurrency = false;
	let sawOrganizationalNotes = false;
	let scratchpad: ReturnType<typeof scratchpadEditorPayloadSchema.parse> | undefined;

	for (const patch of patches) {
		const [root, target] = patch.path;

		if (
			root === currencyPathPrefix &&
			patch.path.length === 2 &&
			typeof target === 'string' &&
			isCurrencyDenomination(target)
		) {
			sawCurrency = true;
			const parsed = currencyAmountEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) currencyAmounts[target] = parsed.data;
			else issues.push(payloadIssue(patch, 'currency', formatParseIssue(parsed.error.issues)));
			continue;
		}

		if (
			root === roleplayFieldPathPrefix &&
			patch.path.length === 2 &&
			typeof target === 'string' &&
			roleplayFieldMetadata.some((entry) => entry.key === target)
		) {
			sawOrganizationalNotes = true;
			const parsed = roleplayFieldEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) roleplayBodies[target as RoleplayFieldKey] = parsed.data;
			else issues.push(payloadIssue(patch, 'roleplay note', formatParseIssue(parsed.error.issues)));
			continue;
		}

		if (root === scratchpadNotesPathPrefix && patch.path.length === 1) {
			sawOrganizationalNotes = true;
			const parsed = scratchpadEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) scratchpad = parsed.data;
			else issues.push(payloadIssue(patch, 'scratchpad', formatParseIssue(parsed.error.issues)));
			continue;
		}

		if (root === spellListLevelPathPrefix && patch.path.length === 2) {
			const parsedLevel = spellLevelSchema.safeParse(target);
			const parsedPayload = spellEditorPayloadSchema.safeParse(patch.value);
			if (!parsedLevel.success) {
				issues.push(unsupportedIssue(patch));
			} else if (!parsedPayload.success) {
				issues.push(
					payloadIssue(patch, 'spell list', formatParseIssue(parsedPayload.error.issues))
				);
			} else {
				intents.push({
					type: 'replace-spell-level',
					level: parsedLevel.data as SpellListLevel,
					spells: parsedPayload.data
				});
			}
			continue;
		}

		if (root === runtimeActionListPathPrefix && patch.path.length === 1) {
			const parsed = runtimeActionEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) intents.push({ type: 'replace-runtime-actions', actions: parsed.data });
			else
				issues.push(payloadIssue(patch, 'runtime action', formatParseIssue(parsed.error.issues)));
			continue;
		}

		if (root === proficiencyLanguagesPathPrefix && patch.path.length === 1) {
			const parsed = proficiencyEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) {
				intents.push({ type: 'replace-proficiency-languages', languages: parsed.data });
			} else {
				issues.push(
					payloadIssue(patch, 'proficiency language', formatParseIssue(parsed.error.issues))
				);
			}
			continue;
		}

		if (root === proficiencyToolsPathPrefix && patch.path.length === 1) {
			const parsed = proficiencyEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) {
				intents.push({ type: 'replace-proficiency-tools', tools: parsed.data });
			} else {
				issues.push(payloadIssue(patch, 'tool proficiency', formatParseIssue(parsed.error.issues)));
			}
			continue;
		}

		if (root === classFeatureListPathPrefix && patch.path.length === 1) {
			const parsed = classFeatureEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) intents.push({ type: 'replace-class-features', features: parsed.data });
			else issues.push(payloadIssue(patch, 'class feature', formatParseIssue(parsed.error.issues)));
			continue;
		}

		if (
			root === inventoryListPathPrefix &&
			patch.path.length === 2 &&
			(target === 'weapons' || target === 'armorShields' || target === 'other')
		) {
			const parsed = inventoryEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) {
				intents.push({
					type: 'replace-inventory-group',
					group: target as InventoryGroup,
					items: parsed.data
				});
			} else {
				issues.push(payloadIssue(patch, 'inventory', formatParseIssue(parsed.error.issues)));
			}
			continue;
		}

		if (isSystemDataAnnotationPath(patch.path)) {
			const parsed = annotationEditorPayloadSchema.safeParse(patch.value);
			if (parsed.success) {
				intents.push({
					type: 'replace-annotations',
					targetPath: [...patch.path],
					annotations: parsed.data
				});
			} else {
				issues.push(payloadIssue(patch, 'annotation', formatParseIssue(parsed.error.issues)));
			}
			continue;
		}

		if (isVirtualPath(patch.path)) issues.push(unsupportedIssue(patch));
		else canonicalPatches.push({ path: [...patch.path], value: patch.value });
	}

	if (sawCurrency) intents.push({ type: 'update-currency', amounts: currencyAmounts });
	if (sawOrganizationalNotes) {
		intents.push({
			type: 'replace-organizational-notes',
			roleplayBodies,
			...(scratchpad !== undefined ? { scratchpad } : {})
		});
	}

	return issues.length > 0
		? { ok: false, issues }
		: { ok: true, edits: { intents, canonicalPatches } };
};
