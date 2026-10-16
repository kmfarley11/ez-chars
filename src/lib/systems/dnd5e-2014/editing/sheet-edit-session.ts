import { immutableJSONPatch, type JSONPatchDocument } from 'immutable-json-patch';
import {
	parse5e2014CharacterDocument,
	type CharacterDocument5e2014,
	type CollectionPriorityKind5e2014
} from '../../../../schema';
import { applyGridPatches } from '$utils/characterGridHelpers';
import type { GridContentPatch } from '$utils/gridContentTypes';
import { decode5eGridPatches } from '$lib/systems/dnd5e-2014/editing/sheet-edit-decoder';
import {
	reduce5eSheetEditIntents,
	type SheetEditIntent
} from '$lib/systems/dnd5e-2014/editing/sheet-edit-intents';
import { merge5e2014InventoryGroupPins } from '$lib/systems/dnd5e-2014/collection-priority';
import type { InventoryGroup } from '$lib/systems/dnd5e-2014/sheet-constants';

// Concrete 2014 acceptance boundary shared by the app and isolated examples.
// The host owns storage; this module owns candidate validation, never persistence.
export interface SheetEditOwner {
	read: () => CharacterDocument5e2014;
	write: (character: CharacterDocument5e2014) => void;
	reject?: () => boolean;
}

export type SheetCommitResult = { ok: true } | { ok: false; message: string };

export const commit5eCandidate = (
	owner: SheetEditOwner,
	candidate: CharacterDocument5e2014,
	intents: ReadonlyArray<SheetEditIntent> = []
): SheetCommitResult => {
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

export const apply5eCharacterJsonPatch = (
	entry: CharacterDocument5e2014,
	patch: JSONPatchDocument
): CharacterDocument5e2014 => {
	if (!patch.length) return entry;
	const base = patch.some((operation) =>
		operation.path.startsWith('/systemData/combat/deathSaves/')
	)
		? parse5e2014CharacterDocument(
				immutableJSONPatch(entry, [
					{
						op: 'add',
						path: '/systemData/combat/deathSaves',
						value: entry.systemData.combat.deathSaves ?? { successes: 0, failures: 0 }
					}
				])
			)
		: entry;
	return parse5e2014CharacterDocument(immutableJSONPatch(base, patch));
};

export const create5eSheetEditSession = (owner: SheetEditOwner) => {
	const intents = (changes: ReadonlyArray<SheetEditIntent>) =>
		commit5eCandidate(owner, owner.read(), changes);
	return {
		intents,
		patch(patch: JSONPatchDocument): SheetCommitResult {
			if (!patch.length) return { ok: true };
			return commit5eCandidate(owner, apply5eCharacterJsonPatch(owner.read(), patch));
		},
		grid(patches: Array<GridContentPatch>): SheetCommitResult {
			const decoded = decode5eGridPatches(patches);
			if (!decoded.ok)
				return { ok: false, message: decoded.issues.map((issue) => issue.message).join(' ') };
			return commit5eCandidate(
				owner,
				applyGridPatches(owner.read(), decoded.edits.canonicalPatches),
				decoded.edits.intents
			);
		},
		pins(
			collection: CollectionPriorityKind5e2014,
			identities: ReadonlyArray<string>
		): SheetCommitResult {
			return intents([
				{ type: 'replace-collection-pins', collection, identities: [...identities] }
			]);
		},
		inventoryPins(group: InventoryGroup, draft: ReadonlyArray<string>): SheetCommitResult {
			return intents([
				{
					type: 'replace-collection-pins',
					collection: 'inventory',
					identities: merge5e2014InventoryGroupPins(owner.read(), group, draft)
				}
			]);
		}
	};
};
