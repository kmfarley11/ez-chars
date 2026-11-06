import { describe, expect, it, vi } from 'vitest';
import { immutableJSONPatch } from 'immutable-json-patch';
import { FieldDraft, commitFieldDraft, commitRuntimeGroupField } from '../fieldDraftHelpers';
import type { GridContentField } from '../gridContentTypes';
import {
	createRepresentativePatchCharacter,
	type RepresentativePatchCharacter
} from '../../../test-utils/jsonPatchFixtures.js';

describe('field draft helpers', () => {
	it('preserves numeric coupled saves and rejects missing group handlers', () => {
		const fields: Array<[string, GridContentField]> = [
			['used', { value: 1, bindPath: ['used'] }],
			['max', { value: 4, bindPath: ['max'] }]
		];
		const saveGroup = vi.fn();
		const saveField = vi.fn();
		commitRuntimeGroupField(
			fields,
			'used',
			[],
			[{ path: ['used'], value: 2 }],
			saveField,
			saveGroup
		);
		expect(saveGroup).toHaveBeenCalledExactlyOnceWith([
			{ path: ['used'], value: 2 },
			{ path: ['max'], value: 4 }
		]);
		expect(saveField).not.toHaveBeenCalled();
		expect(() =>
			commitRuntimeGroupField(
				fields,
				'used',
				[],
				[{ path: ['used'], value: 2 }],
				saveField,
				undefined
			)
		).toThrow('no save handler');
	});
	it.each(['boolean', 'text'] as const)(
		'forwards only the guarded leaf in a group containing %s',
		(inputKind) => {
			const fields: Array<[string, GridContentField]> = [
				[
					'value',
					{
						value: inputKind === 'boolean' ? false : '',
						inputKind,
						bindPath: ['value'],
						binding: { valuePatchOperation: 'add' }
					}
				],
				['counter', { value: 2, bindPath: ['counter'] }]
			];
			const patch = FieldDraft.begin({ kind: 'value', path: '/counter', value: 2 })
				.update(3)
				.prepareAsPatch();
			const compatibility = [{ path: ['counter'], value: 3 }];
			const saveField = vi.fn(() => false);
			const saveGroup = vi.fn();
			expect(
				commitRuntimeGroupField(fields, 'counter', patch, compatibility, saveField, saveGroup)
			).toBe(false);
			expect(saveField).toHaveBeenCalledExactlyOnceWith(patch, compatibility);
			expect(saveGroup).not.toHaveBeenCalled();
			expect(() =>
				commitRuntimeGroupField(fields, 'counter', patch, compatibility, undefined, saveGroup)
			).toThrow('no save handler');
		}
	);
	it('commits exactly once, preserves rejection and does not mutate a retained draft', () => {
		const draft = FieldDraft.begin({ kind: 'value', path: '/ready', value: false });
		const save = vi.fn();
		commitFieldDraft(draft, save);
		expect(save).not.toHaveBeenCalled();
		commitFieldDraft(draft.update(true), save, ['ready']);
		expect(save).toHaveBeenCalledTimes(1);
		expect(save).toHaveBeenCalledWith(
			[
				{ op: 'test', path: '/ready', value: false },
				{ op: 'replace', path: '/ready', value: true }
			],
			[{ path: ['ready'], value: true }]
		);
		expect(() => commitFieldDraft(draft.update(true), undefined)).toThrow('no save handler');
		expect(() => commitFieldDraft(draft.update(true), () => false)).toThrow('Could not save');
		expect(() =>
			commitFieldDraft(draft.update(true), () => {
				throw new Error('Rejected');
			})
		).toThrow('Rejected');
		expect(draft.value).toBe(false);
	});
	it.each([false, true])('preserves typed boolean replacement from %s', (initial) => {
		const draft = FieldDraft.begin({ kind: 'value', path: '/flag', value: initial });
		expect(draft.prepareAsPatch()).toEqual([]);
		expect(draft.update(!initial).prepareAsPatch()).toEqual([
			{ op: 'test', path: '/flag', value: initial },
			{ op: 'replace', path: '/flag', value: !initial }
		]);
	});

	it('keeps an absent flag untouched until deliberate activation', () => {
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/flag',
			value: false,
			operation: 'add'
		});
		expect(draft.prepareAsPatch()).toEqual([]);
		expect(draft.update(true).prepareAsPatch()).toEqual([
			{ op: 'add', path: '/flag', value: true }
		]);
		expect(draft.operation).toBe('add');
		expect(draft.initialValue).toBe(false);
	});

	it('distinguishes an unchanged absent text draft from clearing authored text', () => {
		const absent = FieldDraft.begin({
			kind: 'value',
			path: '/conditions',
			value: '',
			operation: 'add'
		});
		expect(absent.update('').prepareAsPatch()).toEqual([]);
		expect(absent.cancel()).toBeUndefined();
		expect(absent.update('Prone\nConcentrating').prepareAsPatch()).toEqual([
			{ op: 'add', path: '/conditions', value: 'Prone\nConcentrating' }
		]);
		const authored = FieldDraft.begin({
			kind: 'value',
			path: '/conditions',
			value: 'Prone'
		});
		expect(authored.update('').prepareAsPatch()).toEqual([
			{ op: 'test', path: '/conditions', value: 'Prone' },
			{ op: 'replace', path: '/conditions', value: '' }
		]);
	});

	it('starts a value draft without mutating the source value', () => {
		const character = createRepresentativePatchCharacter();
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/systemData/abilities/strength/score',
			value: character.systemData.abilities.strength.score
		});

		expect(draft).toMatchObject({
			kind: 'value',
			path: '/systemData/abilities/strength/score',
			initialValue: 12,
			value: 12
		});
		expect(draft.isDirty()).toBe(false);
	});

	it('updates a value draft and prepares a guarded JSON Patch document', () => {
		const character = createRepresentativePatchCharacter();
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/systemData/abilities/strength/score',
			value: character.systemData.abilities.strength.score
		}).update(16);

		const patch = draft.prepareAsPatch();
		const updated = immutableJSONPatch<RepresentativePatchCharacter>(character, patch);

		expect(draft.isDirty()).toBe(true);
		expect(patch).toEqual([
			{ op: 'test', path: '/systemData/abilities/strength/score', value: 12 },
			{ op: 'replace', path: '/systemData/abilities/strength/score', value: 16 }
		]);
		expect(updated.systemData.abilities.strength.score).toBe(16);
		expect(character.systemData.abilities.strength.score).toBe(12);
	});

	it('prepares guarded patch operations for paths with escaped characters (~1 and ~0)', () => {
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/profile/a~1b/tilde~0key',
			value: 12
		}).update(15);

		expect(draft.prepareAsPatch()).toEqual([
			{ op: 'test', path: '/profile/a~1b/tilde~0key', value: 12 },
			{ op: 'replace', path: '/profile/a~1b/tilde~0key', value: 15 }
		]);
	});

	it('can prepare an add patch for optional primitive values', () => {
		const character = createRepresentativePatchCharacter();
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/systemData/abilities/dexterity/bonus',
			value: 0,
			operation: 'add'
		}).update(4);

		const patch = draft.prepareAsPatch();
		const updated = immutableJSONPatch<
			RepresentativePatchCharacter & {
				systemData: { abilities: { dexterity: { bonus?: number } } };
			}
		>(character, patch);

		expect(patch).toEqual([{ op: 'add', path: '/systemData/abilities/dexterity/bonus', value: 4 }]);
		expect(updated.systemData.abilities.dexterity.bonus).toBe(4);
		expect(character.systemData.abilities.dexterity).not.toHaveProperty('bonus');
	});

	it('prepares no operations for unchanged drafts', () => {
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/identity/name',
			value: 'Patch Tester'
		});

		expect(draft.prepareAsPatch()).toEqual([]);
	});

	it('cancels a draft without producing a patch', () => {
		const draft = FieldDraft.begin({
			kind: 'value',
			path: '/identity/name',
			value: 'Patch Tester'
		}).update('Changed Name');

		expect(draft.isDirty()).toBe(true);
		expect(draft.cancel()).toBeUndefined();
	});

	it('supports annotation drafts as full-array replacement patches', () => {
		const character = createRepresentativePatchCharacter();
		const draft = FieldDraft.begin({
			kind: 'annotation',
			path: '/systemData/abilities/strength/annotations',
			value: character.systemData.abilities.strength.annotations
		}).update([
			{
				id: 'strength-note',
				text: 'Updated strength note'
			}
		]);

		const patch = draft.prepareAsPatch();
		const updated = immutableJSONPatch<RepresentativePatchCharacter>(character, patch);

		expect(patch).toEqual([
			{
				op: 'test',
				path: '/systemData/abilities/strength/annotations',
				value: [{ id: 'strength-note', text: 'Initial strength note' }]
			},
			{
				op: 'replace',
				path: '/systemData/abilities/strength/annotations',
				value: [{ id: 'strength-note', text: 'Updated strength note' }]
			}
		]);
		expect(updated.systemData.abilities.strength.annotations).toEqual([
			{ id: 'strength-note', text: 'Updated strength note' }
		]);
		expect(character.systemData.abilities.strength.annotations).toEqual([
			{ id: 'strength-note', text: 'Initial strength note' }
		]);
	});
});
