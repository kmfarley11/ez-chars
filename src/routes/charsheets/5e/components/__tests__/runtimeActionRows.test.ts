import { describe, expect, it } from 'vitest';
import { projectRuntimeActionRows } from '../runtimeActionRows';

describe('runtime action row projection', () => {
	it('projects playable summaries, authored notes, and resolved item sources', () => {
		expect(
			projectRuntimeActionRows(
				[
					{
						id: 'longsword-action',
						name: 'Longsword attack',
						timing: 'bonusAction',
						category: 'attack',
						target: ' One creature ',
						notes: ' Player-authored strike note. ',
						source: { kind: 'item', id: 'longsword-item' }
					}
				],
				[{ id: 'longsword-item', name: 'Longsword' }]
			)
		).toEqual([
			{
				id: 'longsword-action',
				name: 'Longsword attack',
				timingLabel: 'Bonus action',
				categoryLabel: 'Attack',
				target: 'One creature',
				notes: 'Player-authored strike note.',
				source: { itemId: 'longsword-item', itemName: 'Longsword' }
			}
		]);
	});

	it('uses summary defaults and omits empty metadata or unavailable source controls', () => {
		expect(
			projectRuntimeActionRows(
				[
					{
						id: 'custom-action',
						name: 'Improvise',
						target: ' ',
						notes: '\n',
						source: { kind: 'item', id: 'missing-item' }
					}
				],
				[]
			)
		).toEqual([
			{
				id: 'custom-action',
				name: 'Improvise',
				timingLabel: 'Action',
				categoryLabel: 'Attack'
			}
		]);
	});
});
