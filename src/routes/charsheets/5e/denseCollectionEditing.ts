import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
import type { GridContentData, GridContentPatch } from '$utils/gridContentTypes';
import type { CharacterDocument5e2014, Item, SpellRef } from '../../../schema';
import {
	annotationEditorPayloadSchema,
	inventoryItemEditorPayloadSchema,
	spellItemEditorPayloadSchema,
	type SheetEditIntent
} from './sheetEditIntents';

const getItem = (
	character: CharacterDocument5e2014,
	row: Dnd5e2014DenseCollectionRow
): Item | undefined =>
	row.source.kind === 'item'
		? character.inventory.find((item) => item.id === row.source.id)
		: undefined;

const getSpell = (
	character: CharacterDocument5e2014,
	row: Dnd5e2014DenseCollectionRow
): SpellRef | undefined =>
	row.source.kind === 'spell'
		? character.systemData.spellcasting?.spells?.find((spell) => spell.spellId === row.source.id)
		: undefined;

export const projectDenseCollectionEditData = (
	character: CharacterDocument5e2014,
	row: Dnd5e2014DenseCollectionRow | undefined
): GridContentData => {
	if (!row) return {};
	const item = getItem(character, row);
	if (item) {
		return {
			name: { fieldName: 'Name', value: item.name },
			detail: { fieldName: 'Detail', value: item.notes ?? '', multiline: true },
			quantity: { fieldName: 'Quantity', value: item.quantity ?? 1, inputKind: 'number' },
			weight: { fieldName: 'Weight', value: item.weight ?? 0, inputKind: 'number' },
			value: { fieldName: 'Value', value: item.value ?? '' },
			equipped: { fieldName: 'Equipped', value: item.equipped ?? false }
		};
	}

	const spell = getSpell(character, row);
	if (!spell) return {};
	return {
		name: { fieldName: 'Name', value: spell.name },
		prepared: { fieldName: 'Prepared', value: spell.prepared ?? false },
		notes: { fieldName: 'Notes', value: spell.notes ?? '', multiline: true }
	};
};

export const projectDenseCollectionNotesData = (
	character: CharacterDocument5e2014,
	row: Dnd5e2014DenseCollectionRow | undefined
): GridContentData => {
	if (!row) return {};
	const record = getItem(character, row) ?? getSpell(character, row);
	if (!record) return {};
	return {
		record: {
			fieldName: row.label,
			value: row.label,
			annotations: record.annotations ?? [],
			annotationBindPath: ['annotations']
		}
	};
};

const valueAt = (data: GridContentData, key: string): unknown => data[key]?.value;

export const decodeDenseCollectionEditIntent = (
	row: Dnd5e2014DenseCollectionRow,
	data: GridContentData
): SheetEditIntent | undefined => {
	if (row.source.kind === 'item') {
		const parsed = inventoryItemEditorPayloadSchema.safeParse({
			name: valueAt(data, 'name'),
			notes: valueAt(data, 'detail'),
			quantity: valueAt(data, 'quantity'),
			weight: valueAt(data, 'weight'),
			value: valueAt(data, 'value'),
			equipped: valueAt(data, 'equipped')
		});
		if (!parsed.success || !parsed.data.name.trim()) return undefined;
		return {
			type: 'update-inventory-item',
			group: row.source.group,
			itemId: row.source.id,
			item: parsed.data
		};
	}

	const parsed = spellItemEditorPayloadSchema.safeParse({
		name: valueAt(data, 'name'),
		prepared: valueAt(data, 'prepared'),
		notes: valueAt(data, 'notes')
	});
	if (!parsed.success || !parsed.data.name?.trim()) return undefined;
	return {
		type: 'update-spell',
		level: row.source.level,
		spellId: row.source.id,
		spell: parsed.data
	};
};

export const decodeDenseCollectionAnnotationsIntent = (
	row: Dnd5e2014DenseCollectionRow,
	patches: ReadonlyArray<GridContentPatch>
): SheetEditIntent | undefined => {
	const patch = patches.find(
		(candidate) => candidate.path.length === 1 && candidate.path[0] === 'annotations'
	);
	const parsed = annotationEditorPayloadSchema.safeParse(patch?.value);
	if (!parsed.success) return undefined;
	return row.source.kind === 'item'
		? {
				type: 'replace-inventory-item-annotations',
				group: row.source.group,
				itemId: row.source.id,
				annotations: parsed.data
			}
		: {
				type: 'replace-spell-annotations',
				level: row.source.level,
				spellId: row.source.id,
				annotations: parsed.data
			};
};
