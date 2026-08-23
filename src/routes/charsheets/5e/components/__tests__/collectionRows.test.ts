import { describe, expect, it } from 'vitest';
import { saturatedCharacter5e2014 } from '../../../../../fixtures/saturatedCharacter.5e2014';
import { filterRuntimeActionRows, projectRuntimeActionRows } from '../runtimeActionRows';
import {
	filterSupportingCollectionRows,
	projectSupportingCollectionRows
} from '../supportingCollectionRows';

describe('runtime action collection rows', () => {
	it('preserves authored order and searches snapshot plus source context', () => {
		const rows = projectRuntimeActionRows(
			saturatedCharacter5e2014.systemData.runtimeActions,
			saturatedCharacter5e2014
		);

		expect(rows.map((row) => row.id)).toEqual(
			saturatedCharacter5e2014.systemData.runtimeActions.map((action) => action.id)
		);
		expect(filterRuntimeActionRows(rows, 'inventory weapons')).toMatchObject([
			{ id: 'saturated-linked-item-action', name: 'Longsword attack' }
		]);
		expect(filterRuntimeActionRows(rows, 'runtime REMINDER 8')).toMatchObject([
			{ id: 'saturated-custom-action-8', name: 'Custom runtime action 8' }
		]);
	});
});

describe('supporting collection rows', () => {
	it('projects each domain without forcing shared mutation data', () => {
		expect(projectSupportingCollectionRows(saturatedCharacter5e2014, 'features')).toHaveLength(18);
		expect(projectSupportingCollectionRows(saturatedCharacter5e2014, 'traits')).toHaveLength(7);
		expect(projectSupportingCollectionRows(saturatedCharacter5e2014, 'languages')).toHaveLength(5);
		expect(projectSupportingCollectionRows(saturatedCharacter5e2014, 'tools')).toHaveLength(7);
	});

	it('searches labels, authored detail, and source context while preserving order', () => {
		const rows = projectSupportingCollectionRows(saturatedCharacter5e2014, 'features');

		expect(filterSupportingCollectionRows(rows, 'feature summary')).toHaveLength(8);
		expect(filterSupportingCollectionRows(rows, 'wizard class feature 10')).toMatchObject([
			{ key: 'class-feature:0:saturated-class-feature-10', label: 'Class feature 10' }
		]);
	});
});
