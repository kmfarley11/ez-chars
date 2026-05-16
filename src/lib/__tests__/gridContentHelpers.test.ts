import { describe, expect, it } from 'vitest';
import {
	collectAnnotationPatchesFromData,
	collectHelpAnnotationGroups,
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
	},
	emptyAnnotatedField: {
		fieldName: 'Empty Annotated Field',
		annotationBindPath: ['systemData', 'annotations', 'emptyAnnotatedField', '_annotations'],
		value: 'No notes yet'
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
			},
			{
				kind: 'value',
				path: ['emptyAnnotatedField'],
				value: 'No notes yet'
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
			},
			{
				kind: 'annotation',
				path: ['systemData', 'annotations', 'emptyAnnotatedField', '_annotations'],
				value: []
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
				path: ['emptyAnnotatedField'],
				value: 'No notes yet'
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
			},
			{
				path: ['systemData', 'annotations', 'emptyAnnotatedField', '_annotations'],
				value: []
			}
		]);
	});

	it('can include editable annotation targets without existing annotations for note dialogs', () => {
		const data = createPatchProjectionData();

		expect(collectHelpAnnotationGroups(data).map((group) => group.title)).toEqual([
			'Strength',
			'Proficiencies / Source'
		]);

		expect(
			collectHelpAnnotationGroups(data, { includeEditableEmpty: true }).map((group) => ({
				title: group.title,
				annotationCount: group.annotations.length,
				annotationBindPath: group.annotationBindPath
			}))
		).toEqual([
			{
				title: 'Strength',
				annotationCount: 1,
				annotationBindPath: [
					'systemData',
					'annotations',
					'abilities',
					'strength',
					'score',
					'_annotations'
				]
			},
			{
				title: 'Proficiencies / Source',
				annotationCount: 1,
				annotationBindPath: [
					'systemData',
					'annotations',
					'proficiencies',
					'languages',
					'0',
					'source',
					'_annotations'
				]
			},
			{
				title: 'Empty Annotated Field',
				annotationCount: 0,
				annotationBindPath: ['systemData', 'annotations', 'emptyAnnotatedField', '_annotations']
			}
		]);
	});
});
