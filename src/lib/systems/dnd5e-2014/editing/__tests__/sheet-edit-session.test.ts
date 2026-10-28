import { describe, expect, it, vi } from 'vitest';
import { createSheetEditCharacter } from '$lib/systems/dnd5e-2014/__tests__/sheet-edit-fixtures';
import { create5eSmallRecordModel } from '$lib/systems/dnd5e-2014/editing/small-edit-adapters';
import { create5eSheetEditSession } from '../sheet-edit-session';

const fixture = () => {
	let character = createSheetEditCharacter();
	let reject = false;
	const owner = {
		read: () => character,
		write: vi.fn((next: typeof character) => {
			character = next;
		}),
		reject: () => reject
	};
	return {
		owner,
		edits: create5eSheetEditSession(owner),
		reject: () => {
			reject = true;
		}
	};
};

describe('shared 2014 sheet edit acceptance', () => {
	it('initializes missing death saves without mutating the source document', () => {
		const { owner, edits } = fixture();
		delete owner.read().systemData.combat.deathSaves;
		const original = structuredClone(owner.read());
		expect(
			edits.patch([{ op: 'replace', path: '/systemData/combat/deathSaves/successes', value: 1 }])
		).toEqual({ ok: true });
		expect(owner.read().systemData.combat.deathSaves).toEqual({ successes: 1, failures: 0 });
		expect(original.systemData.combat.deathSaves).toBeUndefined();
	});
	it('commits grid changes and pins through validation while preserving unrelated data', () => {
		const { owner, edits } = fixture();
		const inventory = structuredClone(owner.read().systemData.inventory);
		expect(edits.grid([{ path: ['systemData', 'identity', 'name'], value: 'New name' }])).toEqual({
			ok: true
		});
		expect(owner.read().systemData.identity.name).toBe('New name');
		expect(edits.pins('inventory', ['weapon-1'])).toEqual({ ok: true });
		expect(edits.inventoryPins('other', ['gear-1'])).toEqual({ ok: true });
		expect(owner.read().systemData.collectionPins?.inventory).toEqual(['gear-1', 'weapon-1']);
		expect(owner.read().systemData.inventory).toEqual(inventory);
		expect(edits.pins('inventory', ['missing'])).toMatchObject({ ok: false });
		expect(owner.read().systemData.collectionPins?.inventory).toEqual(['gear-1', 'weapon-1']);
	});
	it('uses the same acceptance boundary for focused values and independent notes', () => {
		const { owner } = fixture();
		const field = create5eSmallRecordModel(owner, 'item:weapon-1')!.fields[0];
		const notes = structuredClone(field.notes!.read());
		expect(field.commit!(field.read(), 'New weapon name')).toEqual({ ok: true });
		expect(field.notes!.read()).toEqual(notes);
		const note = {
			id: 'fixed-note-id',
			origin: 'user' as const,
			kind: 'note' as const,
			text: 'Independent note'
		};
		expect(field.notes!.commit({ before: undefined, after: note })).toEqual({ ok: true });
		expect(field.read()).toBe('New weapon name');
		expect(field.notes!.read()).toEqual([...notes, note]);
	});
	it('rejects raw patches, grid edits, intents, pins and focused values/notes without writing', () => {
		const { owner, edits, reject } = fixture();
		const original = structuredClone(owner.read());
		const field = create5eSmallRecordModel(owner, 'item:weapon-1')!.fields[0];
		reject();
		expect(
			edits.patch([{ op: 'replace', path: '/systemData/identity/name', value: 'No' }])
		).toMatchObject({
			ok: false
		});
		expect(edits.grid([{ path: ['systemData', 'identity', 'name'], value: 'No' }])).toMatchObject({
			ok: false
		});
		expect(edits.intents([])).toMatchObject({ ok: false });
		expect(edits.pins('inventory', ['weapon-1'])).toMatchObject({ ok: false });
		expect(field.commit!(field.read(), 'No')).toMatchObject({ ok: false });
		expect(
			field.notes!.commit({
				before: undefined,
				after: { id: 'fixed-note-id', origin: 'user', kind: 'note', text: 'No' }
			})
		).toMatchObject({ ok: false });
		expect(owner.write).not.toHaveBeenCalled();
		expect(owner.read()).toEqual(original);
	});
	it('leaves state intact when a raw patch violates the full document schema', () => {
		const { owner, edits } = fixture();
		const original = structuredClone(owner.read());
		expect(() =>
			edits.patch([{ op: 'replace', path: '/systemData/combat/deathSaves/successes', value: -1 }])
		).toThrow();
		expect(owner.write).not.toHaveBeenCalled();
		expect(owner.read()).toEqual(original);
	});
});
