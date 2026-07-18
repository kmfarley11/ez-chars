import { describe, expect, it } from 'vitest';
import {
	collectAnnotationPatchesFromData,
	collectHelpAnnotationGroups,
	collectPatchesFromData,
	collectValuePatchesFromData,
	readGridAnnotationsAtPath,
	resolveGridFieldDescriptor,
	resolveGridFieldDescriptors,
	toGridJsonPointer
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

describe('grid field descriptor resolution', () => {
	const characterLikeSource = {
		systemData: {
			combat: {
				hitPoints: {
					current: 12,
					temp: 3
				}
			},
			annotations: {
				combat: {
					hitPoints: {
						current: {
							_annotations: {
								sourceNote: {
									origin: 'source',
									kind: 'reference',
									text: 'Class table reference'
								}
							}
						},
						temp: {
							_annotations: [
								{
									id: 'temp-note',
									origin: 'user',
									kind: 'note',
									text: 'From armor feature.'
								}
							]
						}
					}
				}
			}
		}
	};

	const annotationPathForValuePath = (path: Array<string | number>) => [
		'systemData',
		'annotations',
		...path.slice(1),
		'_annotations'
	];

	it('converts grid paths to escaped JSON Pointers for RFC 6902 field drafts', () => {
		expect(toGridJsonPointer(['systemData', 'a/b', 'tilde~key', 0])).toBe(
			'/systemData/a~1b/tilde~0key/0'
		);
	});

	it('reads annotation arrays and record-shaped annotation entries', () => {
		expect(
			readGridAnnotationsAtPath(characterLikeSource, [
				'systemData',
				'annotations',
				'combat',
				'hitPoints',
				'current',
				'_annotations'
			])
		).toEqual([
			{
				id: 'sourceNote',
				origin: 'source',
				kind: 'reference',
				text: 'Class table reference'
			}
		]);

		expect(
			readGridAnnotationsAtPath(characterLikeSource, [
				'systemData',
				'annotations',
				'combat',
				'hitPoints',
				'temp',
				'_annotations'
			])
		).toEqual([
			{
				id: 'temp-note',
				origin: 'user',
				kind: 'note',
				text: 'From armor feature.'
			}
		]);
	});

	it('resolves a descriptor into grid field data with binding, capabilities, annotations, and affordances', () => {
		expect(
			resolveGridFieldDescriptor(
				characterLikeSource,
				{
					key: 'currentHp',
					fieldName: 'Current HP',
					path: ['systemData', 'combat', 'hitPoints', 'current'],
					inputKind: 'number',
					interaction: {
						editAffordance: 'persistent',
						annotationAffordance: 'persistent'
					}
				},
				{ annotationPathForValuePath }
			)
		).toEqual({
			fieldName: 'Current HP',
			label: undefined,
			hidden: undefined,
			options: undefined,
			inputKind: 'number',
			editOnly: undefined,
			multiline: undefined,
			bindPath: ['systemData', 'combat', 'hitPoints', 'current'],
			annotationBindPath: [
				'systemData',
				'annotations',
				'combat',
				'hitPoints',
				'current',
				'_annotations'
			],
			annotations: [
				{
					id: 'sourceNote',
					origin: 'source',
					kind: 'reference',
					text: 'Class table reference'
				}
			],
			binding: {
				readPath: ['systemData', 'combat', 'hitPoints', 'current'],
				valuePatchPath: ['systemData', 'combat', 'hitPoints', 'current'],
				annotationReadPath: [
					'systemData',
					'annotations',
					'combat',
					'hitPoints',
					'current',
					'_annotations'
				],
				annotationPatchPath: [
					'systemData',
					'annotations',
					'combat',
					'hitPoints',
					'current',
					'_annotations'
				],
				valuePatchOperation: undefined
			},
			capabilities: {
				canEditValue: true,
				canEditAnnotations: true
			},
			interaction: {
				editAffordance: 'persistent',
				annotationAffordance: 'persistent'
			},
			value: 12
		});
	});

	it('infers display names, input kinds, and default values for primitive descriptors', () => {
		expect(
			resolveGridFieldDescriptor(
				characterLikeSource,
				{
					key: 'tempHp',
					path: ['systemData', 'combat', 'hitPoints', 'missingTempHp']
				},
				{ annotationPathForValuePath }
			)
		).toMatchObject({
			fieldName: 'Temp HP',
			inputKind: 'number',
			value: 0
		});

		expect(
			resolveGridFieldDescriptor(characterLikeSource, {
				key: 'armorClass',
				path: ['systemData', 'combat', 'missingArmorClass']
			})
		).toMatchObject({
			fieldName: 'Armor Class',
			inputKind: 'number',
			value: 0
		});

		expect(
			resolveGridFieldDescriptor(characterLikeSource, {
				key: 'featureNotes',
				path: ['systemData', 'combat', 'missingFeatureNotes']
			})
		).toMatchObject({
			fieldName: 'Feature Notes',
			inputKind: 'text',
			value: ''
		});
	});

	it('resolves multiple descriptors into GridContentData keyed by descriptor key', () => {
		expect(
			Object.keys(
				resolveGridFieldDescriptors(
					characterLikeSource,
					[
						{
							key: 'currentHp',
							fieldName: 'Current HP',
							path: ['systemData', 'combat', 'hitPoints', 'current']
						},
						{
							key: 'tempHp',
							fieldName: 'Temp HP',
							path: ['systemData', 'combat', 'hitPoints', 'temp'],
							valuePatchOperation: 'add'
						}
					],
					{ annotationPathForValuePath }
				)
			)
		).toEqual(['currentHp', 'tempHp']);
	});
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
