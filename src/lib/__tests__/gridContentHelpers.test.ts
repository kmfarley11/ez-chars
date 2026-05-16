import { describe, expect, it } from 'vitest';
import {
	collectAnnotationPatchesFromData,
	collectPatchesFromData,
	collectValuePatchesFromData
} from '../gridContentHelpers';
import type { GridContentData } from '../gridContentTypes';

const createPatchProjectionData = (): GridContentData => ({
	abilityScore: {
		fieldName: 'Strength',
		bindPath: ['systemData', 'abilities', 'strength', 'score'],
		annotationBindPath: [
			'systemData',
			'annotations',
			'abilities',
			'strength',
			'score',
			'_annotations'
		],
		annotations: [
			{ id: 'strength-note', origin: 'user', kind: 'note', text: 'Remember enhancement bonuses.' }
		],
		value: 16
	},
	proficiencies: {
		fieldName: 'Proficiencies',
		bindPath: ['systemData', 'proficiencies', 'languages'],
		value: [
			{
				value: {
					name: {
						fieldName: 'Name',
						value: 'Draconic'
					},
					source: {
						fieldName: 'Source',
						annotationBindPath: [
							'systemData',
							'annotations',
							'proficiencies',
							'languages',
							'0',
							'source',
							'_annotations'
						],
						annotations: [
							{
								id: 'language-source',
								origin: 'user',
								kind: 'note',
								text: 'Granted by background.'
							}
						],
						value: 'background'
					}
				}
			}
		]
	}
});

describe('grid content patch projection', () => {
	it('projects value patches separately from annotation patches', () => {
		const data = createPatchProjectionData();

		expect(collectValuePatchesFromData(data)).toEqual([
			{
				kind: 'value',
				path: ['systemData', 'abilities', 'strength', 'score'],
				value: 16
			},
			{
				kind: 'value',
				path: ['systemData', 'proficiencies', 'languages'],
				value: [{ name: 'Draconic', source: 'background' }]
			}
		]);

		expect(collectAnnotationPatchesFromData(data)).toEqual([
			{
				kind: 'annotation',
				path: ['systemData', 'annotations', 'abilities', 'strength', 'score', '_annotations'],
				value: [
					{
						id: 'strength-note',
						origin: 'user',
						kind: 'note',
						text: 'Remember enhancement bonuses.'
					}
				]
			},
			{
				kind: 'annotation',
				path: [
					'systemData',
					'annotations',
					'proficiencies',
					'languages',
					'0',
					'source',
					'_annotations'
				],
				value: [
					{
						id: 'language-source',
						origin: 'user',
						kind: 'note',
						text: 'Granted by background.'
					}
				]
			}
		]);
	});

	it('keeps the legacy combined patch projection available for the current save path', () => {
		const data = createPatchProjectionData();

		expect(collectPatchesFromData(data)).toEqual([
			{
				path: ['systemData', 'abilities', 'strength', 'score'],
				value: 16
			},
			{
				path: ['systemData', 'proficiencies', 'languages'],
				value: [{ name: 'Draconic', source: 'background' }]
			},
			{
				path: ['systemData', 'annotations', 'abilities', 'strength', 'score', '_annotations'],
				value: [
					{
						id: 'strength-note',
						origin: 'user',
						kind: 'note',
						text: 'Remember enhancement bonuses.'
					}
				]
			},
			{
				path: [
					'systemData',
					'annotations',
					'proficiencies',
					'languages',
					'0',
					'source',
					'_annotations'
				],
				value: [
					{
						id: 'language-source',
						origin: 'user',
						kind: 'note',
						text: 'Granted by background.'
					}
				]
			}
		]);
	});
});
