import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
import { getInventoryGroupForItem } from '$lib/dnd5e2014/inventory';
import type { GridContentData, GridContentPatch } from '$utils/gridContentTypes';
import type { Annotation, CharacterDocument5e2014, Item, SpellRef } from '../../../schema';
import type { InventoryGroup, SpellListLevel } from './sheetConstants';
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

export const decodeDenseCollectionSaveIntents = (
	row: Dnd5e2014DenseCollectionRow,
	data: GridContentData,
	annotations: ReadonlyArray<Annotation>
): Array<SheetEditIntent> | undefined => {
	const editIntent = decodeDenseCollectionEditIntent(row, data);
	const annotationIntent = decodeDenseCollectionAnnotationsIntent(row, [
		{ path: ['annotations'], value: annotations }
	]);
	if (!editIntent || !annotationIntent) return undefined;
	return [editIntent, annotationIntent];
};

const inventoryPayload = (item: Item) => ({
	id: item.id,
	name: item.name,
	notes: item.notes,
	quantity: item.quantity,
	weight: item.weight,
	value: item.value,
	equipped: item.equipped
});

const spellPayload = (spell: SpellRef) => ({
	spellId: spell.spellId,
	name: spell.name,
	prepared: spell.prepared,
	notes: spell.notes
});

export const projectDenseCollectionAddData = (
	rowSource: { kind: 'item'; group: InventoryGroup } | { kind: 'spell'; level?: SpellListLevel }
): GridContentData => {
	if (rowSource.kind === 'spell') {
		return {
			name: { fieldName: 'Name', value: 'Spell' },
			level: { fieldName: 'Level', value: rowSource.level ?? 1, inputKind: 'number' },
			notes: { fieldName: 'Initial detail', value: '', multiline: true }
		};
	}
	return {
		name: { fieldName: 'Name', value: 'Item' },
		detail: { fieldName: 'Initial detail', value: '', multiline: true }
	};
};

export const decodeDenseCollectionAddIntent = (
	character: CharacterDocument5e2014,
	collection: { kind: 'item'; group: InventoryGroup } | { kind: 'spell' },
	data: GridContentData
): SheetEditIntent | undefined => {
	const name = valueAt(data, 'name');
	if (typeof name !== 'string' || !name.trim()) return undefined;
	if (collection.kind === 'item') {
		const detail = valueAt(data, 'detail');
		return {
			type: 'replace-inventory-group',
			group: collection.group,
			items: [
				...character.inventory
					.filter((item) => getInventoryGroupForItem(item) === collection.group)
					.map(inventoryPayload),
				{ name: name.trim(), notes: typeof detail === 'string' ? detail : '' }
			]
		};
	}
	const rawLevel = Number(valueAt(data, 'level'));
	const level = Number.isInteger(rawLevel) && rawLevel >= 0 && rawLevel <= 9 ? rawLevel : 1;
	const notes = valueAt(data, 'notes');
	return {
		type: 'replace-spell-level',
		level: level as SpellListLevel,
		spells: [
			...(character.systemData.spellcasting?.spells ?? [])
				.filter((spell) => (spell.level ?? 0) === level)
				.map(spellPayload),
			{ name: name.trim(), notes: typeof notes === 'string' ? notes : '' }
		]
	};
};

export const decodeDenseCollectionRemoveIntent = (
	character: CharacterDocument5e2014,
	row: Dnd5e2014DenseCollectionRow
): SheetEditIntent => {
	const source = row.source;
	return source.kind === 'item'
		? {
				type: 'replace-inventory-group',
				group: source.group,
				items: character.inventory
					.filter(
						(item) => getInventoryGroupForItem(item) === source.group && item.id !== source.id
					)
					.map(inventoryPayload)
			}
		: {
				type: 'replace-spell-level',
				level: source.level,
				spells: (character.systemData.spellcasting?.spells ?? [])
					.filter((spell) => (spell.level ?? 0) === source.level && spell.spellId !== source.id)
					.map(spellPayload)
			};
};
