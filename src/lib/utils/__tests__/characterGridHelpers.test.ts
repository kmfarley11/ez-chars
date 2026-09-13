import { describe, expect, it } from 'vitest';
import {
	appendGridArrayItemAtPath,
	removeGridArrayItemAtPath,
	updateGridDataAtPath
} from '../characterGridHelpers';
import { collectValuePatchesFromData } from '../gridContentHelpers';
import type { GridContentData, GridContentField } from '../gridContentTypes';

describe('characterGridHelpers array and path operations (StructuredForm contract)', () => {
	const createMockFormData = (): GridContentData => ({
		name: {
			fieldName: 'Name',
			value: 'Longsword',
			bindPath: ['inventory', 'weapons', 0, 'name']
		},
		properties: {
			fieldName: 'Properties',
			bindPath: ['inventory', 'weapons', 0, 'properties'],
			value: [
				{
					fieldName: 'Property',
					value: 'Versatile'
				}
			],
			addItemTemplate: {
				fieldName: 'Property',
				value: ''
			} as GridContentField
		} as GridContentField
	});

	it('appends an array item using the provided item template', () => {
		const source = createMockFormData();
		const template: GridContentField = {
			fieldName: 'Property',
			value: ''
		};

		const updated = appendGridArrayItemAtPath(source, ['properties'], template);
		const propertiesField = updated.properties as GridContentField;
		const items = propertiesField.value as Array<GridContentField>;

		expect(items).toHaveLength(2);
		expect(items[0]).toEqual({ fieldName: 'Property', value: 'Versatile' });
		expect(items[1]).toEqual({ fieldName: 'Property', value: '' });
		// Original source is not mutated
		expect(source.properties.value as Array<unknown>).toHaveLength(1);
	});

	it('removes an array item at a specified index', () => {
		const source = createMockFormData();
		const template: GridContentField = {
			fieldName: 'Property',
			value: 'Finesse'
		};

		const withTwo = appendGridArrayItemAtPath(source, ['properties'], template);
		expect(withTwo.properties.value as Array<unknown>).toHaveLength(2);

		// Remove the first item ('Versatile')
		const afterRemoval = removeGridArrayItemAtPath(withTwo, ['properties'], 0);
		const items = afterRemoval.properties.value as Array<GridContentField>;

		expect(items).toHaveLength(1);
		expect(items[0]).toEqual({ fieldName: 'Property', value: 'Finesse' });
	});

	it('updates scalar and nested leaf values within array items', () => {
		const source = createMockFormData();
		const template: GridContentField = {
			fieldName: 'Property',
			value: ''
		};

		const withTwo = appendGridArrayItemAtPath(source, ['properties'], template);
		const updated = updateGridDataAtPath(withTwo, ['properties', 1], 'Thrown');
		const items = updated.properties.value as Array<GridContentField>;

		expect(items[1]).toEqual({ fieldName: 'Property', value: 'Thrown' });
	});

	it('produces expected array patches via collectValuePatchesFromData after addition and removal', () => {
		const source = createMockFormData();
		const template: GridContentField = {
			fieldName: 'Property',
			value: ''
		};

		// 1. Add item
		let draft = appendGridArrayItemAtPath(source, ['properties'], template);
		// 2. Edit newly added item
		draft = updateGridDataAtPath(draft, ['properties', 1], 'Light');
		// 3. Remove original item at index 0
		draft = removeGridArrayItemAtPath(draft, ['properties'], 0);

		// Now properties has 1 item: 'Light'
		const patches = collectValuePatchesFromData(draft);
		const propertyPatch = patches.find(
			(patch) => patch.path.join('.') === 'inventory.weapons.0.properties'
		);

		expect(propertyPatch).toBeDefined();
		expect(propertyPatch?.value).toEqual(['Light']);
	});

	it('gracefully returns unchanged data structure when target path is invalid or not an array', () => {
		const source = createMockFormData();
		const template: GridContentField = { fieldName: 'Property', value: '' };

		// Non-existent key returns identical reference
		expect(appendGridArrayItemAtPath(source, ['nonExistent'], template)).toBe(source);
		expect(removeGridArrayItemAtPath(source, ['nonExistent'], 0)).toBe(source);

		// Non-array field returns matching data
		expect(appendGridArrayItemAtPath(source, ['name'], template)).toEqual(source);
		expect(removeGridArrayItemAtPath(source, ['name'], 0)).toEqual(source);
	});
});
