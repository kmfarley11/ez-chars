import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCanonicalSheetState } from '$lib/storybook/canonical-sheet-state';
import { create5eSheetEditSession } from '../../editing/sheet-edit-session';
import { createSheetEditCharacter } from '$lib/systems/dnd5e-2014/__tests__/sheet-edit-fixtures';
import { create5eSmallRecordModel } from '$lib/systems/dnd5e-2014/editing/small-edit-adapters';

vi.mock('../../../../../schema/helpers', async (importOriginal) => ({
	...(await importOriginal<object>()),
	createId: () => 'deterministic-created-id'
}));
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-10-11T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

type Host = ReturnType<
	typeof createCanonicalSheetState<ReturnType<typeof createSheetEditCharacter>>
>;
const editName = (host: Host) => {
	const field = create5eSmallRecordModel(host, 'item:weapon-1')!.fields[0];
	return field.commit!(field.read(), 'New weapon name');
};

describe('isolated canonical sheet host', () => {
	it('clones each instance and restores a clean, independent baseline on Reset', () => {
		const fixture = createSheetEditCharacter();
		const original = structuredClone(fixture);
		const first = createCanonicalSheetState(fixture);
		const second = createCanonicalSheetState(fixture);
		expect(editName(first)).toEqual({ ok: true });
		expect(first.read()).not.toEqual(original);
		expect(second.read()).toEqual(original);
		expect(fixture).toEqual(original);
		first.setRejected(true);
		first.reset();
		expect(first.reject?.()).toBe(false);
		expect(first.read()).toEqual(original);
		expect(first.read()).not.toBe(fixture);
		first.read().systemData.inventory[0].name = 'Mutated disposable snapshot';
		first.reset();
		expect(first.read()).toEqual(original);
	});

	const paths: Array<[string, (host: Host) => { ok: boolean }]> = [
		[
			'runtime patch',
			(host) =>
				create5eSheetEditSession(host).patch([
					{ op: 'replace', path: '/systemData/identity/name', value: 'Changed' }
				])
		],
		[
			'grid edit',
			(host) =>
				create5eSheetEditSession(host).grid([
					{ path: ['systemData', 'identity', 'name'], value: 'Changed' }
				])
		],
		['focused value', editName],
		[
			'focused note',
			(host) =>
				create5eSmallRecordModel(host, 'item:weapon-1')!.fields[0].notes!.commit({
					before: undefined,
					after: { id: 'fixed-note-id', origin: 'user', kind: 'note', text: 'Independent' }
				})
		],
		[
			'collection add',
			(host) =>
				create5eSheetEditSession(host).intents([
					{
						type: 'replace-proficiency-languages',
						languages: [
							...host.read().systemData.proficiencies.languages.map((entry) => ({
								id: entry.id,
								name: entry.name,
								source: entry.source?.kind ?? 'other'
							})),
							{ id: 'fixed-language-id', name: 'New language', source: 'other' }
						]
					}
				])
		],
		[
			'collection remove',
			(host) =>
				create5eSheetEditSession(host).intents([
					{ type: 'replace-proficiency-languages', languages: [] }
				])
		],
		[
			'runtime action add',
			(host) =>
				create5eSheetEditSession(host).intents([
					{ type: 'create-runtime-action', draft: { name: 'Custom action' } }
				])
		],
		['pin', (host) => create5eSheetEditSession(host).pins('inventory', ['weapon-1'])]
	];
	it.each(paths)(
		'rejects %s without changing the character, then permits retry',
		(_label, mutate) => {
			const host = createCanonicalSheetState(createSheetEditCharacter());
			const original = structuredClone(host.read());
			host.setRejected(true);
			expect(mutate(host)).toMatchObject({ ok: false });
			expect(host.read()).toEqual(original);
			host.setRejected(false);
			expect(mutate(host)).toEqual({ ok: true });
			expect(host.read()).not.toEqual(original);
			host.reset();
			expect(host.read()).toEqual(original);
		}
	);
});
