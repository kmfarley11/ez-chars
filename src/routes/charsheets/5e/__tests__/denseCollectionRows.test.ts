import { describe, expect, it } from 'vitest';
import { filterGridContentListRows } from '$components/gridContentList';
import {
	projectInventoryDenseCollectionRows,
	projectSpellDenseCollectionRows
} from '$lib/dnd5e2014/denseCollectionRows';
import { getInventoryGroupForItem } from '$lib/dnd5e2014/inventory';
import {
	applyCharacterImport,
	createCharacterExportEnvelope,
	parse5e2014CharacterDocument,
	safeParseCharacterExportEnvelope
} from '../../../../schema';
import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
import {
	decodeDenseCollectionAnnotationsIntent,
	decodeDenseCollectionEditIntent,
	projectDenseCollectionEditData
} from '../denseCollectionEditing';
import { reduce5eSheetEditIntents } from '../sheetEditIntents';

describe('2014 dense collection row identity', () => {
	it('projects duplicate inventory names with distinct stable keys in authored group order', () => {
		const rows = projectInventoryDenseCollectionRows(saturatedCharacter5e2014.inventory, 'other');
		const ropeRows = filterGridContentListRows(rows, 'rope');

		expect(ropeRows).toHaveLength(2);
		expect(ropeRows.map((row) => row.key)).toEqual([
			'item:saturated-gear-1',
			'item:saturated-gear-9'
		]);
		expect(rows[2]).toMatchObject({
			key: 'item:saturated-gear-3',
			label: 'Random rock',
			annotations: [expect.objectContaining({ id: 'saturated-rock-note' })]
		});
		expect(rows.every((row) => row.badges === undefined)).toBe(true);
	});

	it('edits one filtered inventory identity without losing annotations, links, or sibling order', () => {
		const character = structuredClone(saturatedCharacter5e2014);
		const originalOther = character.inventory.filter(
			(item) => getInventoryGroupForItem(item) === 'other'
		);
		const selected = filterGridContentListRows(
			projectInventoryDenseCollectionRows(character.inventory, 'other'),
			'xyz dungeon'
		)[0];
		if (!selected || selected.source.kind !== 'item') throw new Error('Expected one selected item');

		const editData = projectDenseCollectionEditData(character, selected);
		editData.name.value = 'Definitely magical rock';
		const intent = decodeDenseCollectionEditIntent(selected, editData);
		if (!intent) throw new Error('Expected focused inventory edit intent');
		const result = reduce5eSheetEditIntents(character, [intent]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const savedOther = result.character.inventory.filter(
			(item) => getInventoryGroupForItem(item) === 'other'
		);
		expect(savedOther.map((item) => item.id)).toEqual(originalOther.map((item) => item.id));
		expect(savedOther.find((item) => item.id === selected.source.id)).toMatchObject({
			name: 'Definitely magical rock',
			annotations: [expect.objectContaining({ id: 'saturated-rock-note' })]
		});
		expect(
			result.character.systemData.runtimeActions.find(
				(action) => action.id === 'saturated-linked-item-action'
			)?.source
		).toEqual({ kind: 'item', id: 'saturated-weapon-1' });

		const annotationIntent = decodeDenseCollectionAnnotationsIntent(selected, [
			{
				path: ['annotations'],
				value: [{ origin: 'user', kind: 'note', text: 'Keep this one close.' }]
			}
		]);
		if (!annotationIntent) throw new Error('Expected focused inventory annotation intent');
		const annotated = reduce5eSheetEditIntents(result.character, [annotationIntent], {
			createId: () => 'focused-item-note'
		});
		expect(annotated.ok).toBe(true);
		if (annotated.ok) {
			expect(
				annotated.character.inventory.find((item) => item.id === selected.source.id)
			).toMatchObject({
				annotations: [
					expect.objectContaining({ id: 'focused-item-note', text: 'Keep this one close.' })
				]
			});
		}
	});

	it('edits one duplicate-name spell identity without replacing another level or source link', () => {
		const character = structuredClone(saturatedCharacter5e2014);
		const spellRows = projectSpellDenseCollectionRows(
			character.systemData.spellcasting?.spells ?? []
		);
		expect([...new Set(spellRows.map((row) => row.groupLabel))]).toEqual([
			'Cantrips',
			'1st-level spells',
			'2nd-level spells',
			'3rd-level spells',
			'4th-level spells'
		]);
		const shieldRows = filterGridContentListRows(spellRows, 'shield');
		expect(shieldRows.map((row) => row.groupLabel)).toEqual(['Cantrips', '1st-level spells']);
		const selected = shieldRows.find(
			(row) => row.source.kind === 'spell' && row.source.level === 1
		);
		if (!selected || selected.source.kind !== 'spell') throw new Error('Expected level-one Shield');
		const selectedSource = selected.source;

		const editData = projectDenseCollectionEditData(character, selected);
		editData.name.value = 'Shield (priority)';
		const intent = decodeDenseCollectionEditIntent(selected, editData);
		if (!intent) throw new Error('Expected focused spell edit intent');
		const result = reduce5eSheetEditIntents(character, [intent]);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const nextSpells = result.character.systemData.spellcasting?.spells ?? [];
		expect(nextSpells.find((spell) => spell.spellId === selectedSource.id)).toMatchObject({
			name: 'Shield (priority)'
		});
		expect(nextSpells.find((spell) => spell.spellId === 'saturated-spell-1')).toMatchObject({
			name: 'Shield'
		});
		expect(
			result.character.systemData.runtimeActions.find(
				(action) => action.id === 'saturated-linked-spell-action'
			)?.source
		).toEqual({ kind: 'spell', id: 'saturated-spell-1' });
	});

	it('rejects focused edits when the stable identity no longer belongs to the projected group', () => {
		const character = structuredClone(saturatedCharacter5e2014);
		const result = reduce5eSheetEditIntents(character, [
			{
				type: 'update-inventory-item',
				group: 'other',
				itemId: 'saturated-weapon-1',
				item: { name: 'Wrong group' }
			},
			{
				type: 'update-spell',
				level: 9,
				spellId: 'saturated-spell-1',
				spell: { name: 'Wrong level' }
			}
		]);

		expect(result).toMatchObject({
			ok: false,
			issues: [expect.objectContaining({ code: 'invalid-intent-target' })]
		});
	});

	it('round-trips focused collection edits through JSON export and restore', () => {
		const character = structuredClone(saturatedCharacter5e2014);
		const edited = reduce5eSheetEditIntents(character, [
			{
				type: 'update-inventory-item',
				group: 'other',
				itemId: 'saturated-gear-9',
				item: { name: 'Rope', notes: 'Exported focused edit.', quantity: 1, equipped: false }
			},
			{
				type: 'replace-spell-annotations',
				level: 4,
				spellId: 'saturated-spell-5',
				annotations: [
					{ id: 'saturated-spell-note', origin: 'user', kind: 'note', text: 'Exported note.' }
				]
			}
		]);
		expect(edited.ok).toBe(true);
		if (!edited.ok) return;

		const json = JSON.stringify(createCharacterExportEnvelope([edited.character]));
		const parsed = safeParseCharacterExportEnvelope(JSON.parse(json));
		expect(parsed.success).toBe(true);
		if (!parsed.success) return;
		const restored = parse5e2014CharacterDocument(
			applyCharacterImport([], parsed.data, 'replace').characters[0]
		);

		expect(restored.inventory.map((item) => item.id)).toEqual(
			edited.character.inventory.map((item) => item.id)
		);
		expect(restored.inventory.find((item) => item.id === 'saturated-gear-9')).toMatchObject({
			notes: 'Exported focused edit.'
		});
		expect(
			restored.systemData.spellcasting?.spells?.find(
				(spell) => spell.spellId === 'saturated-spell-5'
			)
		).toMatchObject({
			annotations: [expect.objectContaining({ text: 'Exported note.' })]
		});
		expect(
			restored.systemData.runtimeActions.find(
				(action) => action.id === 'saturated-linked-item-action'
			)?.source
		).toEqual({ kind: 'item', id: 'saturated-weapon-1' });
	});
});
