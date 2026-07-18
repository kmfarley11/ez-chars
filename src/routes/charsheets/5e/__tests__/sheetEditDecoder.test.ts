import { describe, expect, it } from 'vitest';
import type { GridContentPatch } from '$lib/gridContentTypes';
import {
	classFeatureListPathPrefix,
	currencyPathPrefix,
	inventoryListPathPrefix,
	proficiencyLanguagesPathPrefix,
	proficiencyToolsPathPrefix,
	roleplayFieldPathPrefix,
	runtimeActionListPathPrefix,
	scratchpadNotesPathPrefix,
	spellListLevelPathPrefix
} from '../sheetConstants';
import { decode5eGridPatches } from '../sheetEditDecoder';

const malformedPayloadCases: Array<[string, GridContentPatch]> = [
	['spell list', { path: [spellListLevelPathPrefix, 1], value: 'bad' }],
	['runtime action', { path: [runtimeActionListPathPrefix], value: [{ name: 12 }] }],
	[
		'proficiency language',
		{ path: [proficiencyLanguagesPathPrefix], value: [{ name: 'Elvish', source: 'guild' }] }
	],
	[
		'class feature',
		{ path: [classFeatureListPathPrefix], value: [{ name: 'Feature', classIndex: -1 }] }
	],
	['inventory', { path: [inventoryListPathPrefix, 'other'], value: [{ name: false }] }],
	['currency', { path: [currencyPathPrefix, 'gp'], value: Number.NaN }],
	['roleplay note', { path: [roleplayFieldPathPrefix, 'motives'], value: 12 }],
	['scratchpad', { path: [scratchpadNotesPathPrefix], value: [{ title: 'Missing body' }] }],
	[
		'annotation',
		{
			path: ['systemData', 'annotations', 'combat', '_annotations'],
			value: [{ origin: 'user', kind: 'not-a-kind' }]
		}
	]
];

describe('5e sheet edit decoder', () => {
	it('decodes every structured collection family into explicit intents', () => {
		const decoded = decode5eGridPatches([
			{ path: [spellListLevelPathPrefix, 1], value: [{ spellId: 'shield', name: 'Shield' }] },
			{
				path: [runtimeActionListPathPrefix],
				value: [{ id: 'action-1', name: 'Longsword', timing: 'action' }]
			},
			{
				path: [proficiencyLanguagesPathPrefix],
				value: [{ name: 'Elvish', source: 'ancestry' }]
			},
			{
				path: [proficiencyToolsPathPrefix],
				value: [{ name: "Thieves' tools", source: 'class' }]
			},
			{
				path: [classFeatureListPathPrefix],
				value: [{ featureId: 'second-wind', name: 'Second Wind', classIndex: 0 }]
			},
			{
				path: [inventoryListPathPrefix, 'weapons'],
				value: [{ id: 'weapon-1', name: 'Longsword', equipped: true }]
			}
		]);

		expect(decoded).toMatchObject({
			ok: true,
			edits: {
				canonicalPatches: [],
				intents: [
					{ type: 'replace-spell-level', level: 1 },
					{ type: 'replace-runtime-actions' },
					{ type: 'replace-proficiency-languages' },
					{ type: 'replace-proficiency-tools' },
					{ type: 'replace-class-features' },
					{ type: 'replace-inventory-group', group: 'weapons' }
				]
			}
		});
	});

	it('coalesces currency and organizational note batches into atomic semantic intents', () => {
		const decoded = decode5eGridPatches([
			{ path: [currencyPathPrefix, 'gp'], value: 9 },
			{ path: [currencyPathPrefix, 'sp'], value: 3 },
			{ path: [roleplayFieldPathPrefix, 'motives'], value: 'New motive' },
			{ path: [roleplayFieldPathPrefix, 'factionsOrgs'], value: 'The Harpers' },
			{
				path: [scratchpadNotesPathPrefix],
				value: [{ id: 'scratch-1', title: 'Scratch', body: 'Updated', kind: 'quick' }]
			}
		]);

		expect(decoded).toEqual({
			ok: true,
			edits: {
				canonicalPatches: [],
				intents: [
					{ type: 'update-currency', amounts: { gp: 9, sp: 3 } },
					{
						type: 'replace-organizational-notes',
						roleplayBodies: { motives: 'New motive', factionsOrgs: 'The Harpers' },
						scratchpad: [{ id: 'scratch-1', title: 'Scratch', body: 'Updated', kind: 'quick' }]
					}
				]
			}
		});
	});

	it('decodes mirrored annotations and isolates canonical compatibility patches', () => {
		const annotationPath = [
			'systemData',
			'annotations',
			'combat',
			'hitPoints',
			'current',
			'_annotations'
		] as const;
		const decoded = decode5eGridPatches([
			{
				path: [...annotationPath],
				value: [{ origin: 'user', kind: 'note', text: 'Watch this value.' }]
			},
			{ path: ['systemData', 'combat', 'armorClass'], value: 17 }
		]);

		expect(decoded).toEqual({
			ok: true,
			edits: {
				intents: [
					{
						type: 'replace-annotations',
						targetPath: [...annotationPath],
						annotations: [{ origin: 'user', kind: 'note', text: 'Watch this value.' }]
					}
				],
				canonicalPatches: [{ path: ['systemData', 'combat', 'armorClass'], value: 17 }]
			}
		});
	});

	it.each(malformedPayloadCases)(
		'rejects a malformed %s payload without returning partial edits',
		(_, patch) => {
			const decoded = decode5eGridPatches([patch]);
			expect(decoded).toMatchObject({
				ok: false,
				issues: [{ code: 'malformed-payload' }]
			});
		}
	);

	it('rejects unsupported virtual targets explicitly', () => {
		const decoded = decode5eGridPatches([{ path: ['__future5eEditor'], value: [] }]);
		expect(decoded).toEqual({
			ok: false,
			issues: [
				{
					code: 'unsupported-target',
					message: 'Unsupported structured 5e edit target: __future5eEditor.',
					path: ['__future5eEditor']
				}
			]
		});
	});
});
