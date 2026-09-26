import { describe, expect, it } from 'vitest';
import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
import { projectInventoryDenseCollectionRows } from '$lib/dnd5e2014/denseCollectionRows';
import {
	decodeDenseCollectionSaveIntents,
	projectDenseCollectionEditData
} from '../denseCollectionEditing';
import {
	decodeRuntimeActionSaveIntent,
	projectRuntimeActionEditData
} from '../runtimeActionEditing';
import {
	decodeSupportingRecordSaveIntent,
	projectSupportingRecordEditData
} from '../supportingCollectionEditing';
import { projectRuntimeActionRows } from '../components/runtimeActionRows';
import { projectSupportingCollectionRows } from '../components/supportingCollectionRows';
import { reduce5eSheetEditIntents } from '../sheetEditIntents';

describe('focused 2014 editing adapters', () => {
	it('commits one inventory record and its annotations without changing identity or siblings', () => {
		const character = structuredClone(saturatedCharacter5e2014);
		const row = projectInventoryDenseCollectionRows(character.inventory, 'other').find(
			(candidate) => candidate.source.id === 'saturated-gear-3'
		)!;
		const data = projectDenseCollectionEditData(character, row);
		data.detail.value = 'Updated in one focused draft.';
		const intents = decodeDenseCollectionSaveIntents(row, data, [
			{ id: 'combined-note', origin: 'user', kind: 'note', text: 'Saved together.' }
		]);
		expect(intents).toHaveLength(2);
		const result = reduce5eSheetEditIntents(character, intents!);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.character.inventory.map((item) => item.id)).toEqual(
			character.inventory.map((item) => item.id)
		);
		expect(result.character.inventory.find((item) => item.id === row.source.id)).toMatchObject({
			notes: 'Updated in one focused draft.',
			annotations: [{ id: 'combined-note', text: 'Saved together.' }]
		});
	});

	it('preserves mixed feature ownership while editing one class-owned record', () => {
		const character = structuredClone(saturatedCharacter5e2014);
		const row = projectSupportingCollectionRows(character, 'features').find(
			(candidate) => candidate.source.kind === 'class-feature'
		)!;
		const data = projectSupportingRecordEditData(character, row);
		data.name.value = 'Refined class feature';
		const intent = decodeSupportingRecordSaveIntent(character, 'features', row, data, [
			{ id: 'class-note', origin: 'user', kind: 'note', text: 'Owned by the class.' }
		]);
		expect(intent?.type).toBe('replace-features');
		const result = reduce5eSheetEditIntents(character, [intent!]);
		expect(result.ok).toBe(true);
		if (!result.ok || row.source.kind !== 'class-feature') return;
		expect(result.character.features.map((feature) => feature.id)).toEqual(
			character.features.map((feature) => feature.id)
		);
		expect(
			result.character.systemData.classes[row.source.classIndex].features?.find(
				(feature) => feature.featureId === row.source.id
			)
		).toMatchObject({
			name: 'Refined class feature',
			annotations: [{ id: 'class-note', text: 'Owned by the class.' }]
		});
	});

	it('preserves runtime-action source ownership during focused authored and note edits', () => {
		const character = structuredClone(saturatedCharacter5e2014);
		const row = projectRuntimeActionRows(character.systemData.runtimeActions, character).find(
			(candidate) => candidate.source
		)!;
		const data = projectRuntimeActionEditData(character, row);
		data.target.value = 'A nearby creature';
		const intent = decodeRuntimeActionSaveIntent(character, row.id, data, [
			{ id: 'action-note', origin: 'user', kind: 'note', text: 'Do this first.' }
		]);
		const result = reduce5eSheetEditIntents(character, [intent!]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const saved = result.character.systemData.runtimeActions.find((action) => action.id === row.id);
		expect(saved).toMatchObject({
			target: 'A nearby creature',
			source: row.source?.reference,
			annotations: [{ id: 'action-note', text: 'Do this first.' }]
		});
	});
});
