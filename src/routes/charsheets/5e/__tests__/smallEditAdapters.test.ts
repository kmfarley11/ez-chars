import { describe, expect, it } from 'vitest';
import { createSheetEditCharacter } from './sheetEditFixtures';
import {
	create5eSmallGridModel,
	create5eSmallSpellModel,
	create5eSmallRecordModel
} from '../smallEditAdapters';
import { project5eSheet } from '../sheetProjections';
import type { GridContentData } from '$utils/gridContentTypes';

const fixture = () => {
	let character = createSheetEditCharacter();
	return {
		read: () => character,
		write: (next: typeof character) => {
			character = next;
		}
	};
};

describe('small-edit proof domain adapters', () => {
	it('leaves a missing runtime category unset until chosen and permits clearing it', () => {
		const owner = fixture();
		delete owner.read().systemData.runtimeActions[0].category;
		const model = create5eSmallRecordModel(owner, 'runtime-action:action-1')!;
		const category = model.fields.find((field) => field.label === 'Category')!;
		expect(category.display?.()).toBeUndefined();
		expect(model.badges?.()).not.toContain('Attack');
		expect(model.badges?.()).not.toContain('Effect');
		expect(model.fields[0].commit!(model.fields[0].read(), 'Renamed')).toEqual({ ok: true });
		expect(category.read()).toBeUndefined();
		expect(category.commit!(undefined, 'attack')).toEqual({ ok: true });
		expect(category.read()).toBe('attack');
		expect(category.commit!('attack', undefined)).toEqual({ ok: true });
		expect(category.read()).toBeUndefined();
	});
	it.each([
		'item:weapon-1',
		'general-feature:general-feature',
		'class-feature:0:second-wind',
		'trait:darkvision',
		'languages:language-common',
		'tools:tool-calligrapher',
		'runtime-action:action-1'
	])('updates only the selected property and note for %s', (key) => {
		const owner = fixture();
		const model = create5eSmallRecordModel(owner, key)!;
		const name = model.fields[0];
		const before = name.read();
		const originalNotes = structuredClone(name.notes!.read());
		expect(name.commit!(before, '')).toMatchObject({ ok: false });
		expect(name.commit!(before, 'Renamed')).toEqual({ ok: true });
		expect(name.read()).toBe('Renamed');
		expect(name.notes!.read()).toEqual(originalNotes);
		expect(name.commit!(before, 'Stale')).toMatchObject({ ok: false });
		const afterRename = structuredClone(owner.read());
		const note = {
			id: 'new-record-note',
			origin: 'user' as const,
			kind: 'note' as const,
			text: 'Independent'
		};
		expect(name.notes!.commit({ before: undefined, after: note })).toEqual({ ok: true });
		expect(name.notes!.read()).toEqual([...originalNotes, note]);
		expect(name.notes!.commit({ before: note, after: undefined })).toEqual({ ok: true });
		// Empty annotations are allowed to normalize absence; existing record values are exact.
		expect(name.read()).toBe('Renamed');
		expect(owner.read().inventory).toEqual(afterRename.inventory);
	});
	it('resolves reordered records and preserves unexposed properties and optional absence', () => {
		const owner = fixture();
		const model = create5eSmallRecordModel(owner, 'item:weapon-1')!;
		const name = model.fields[0];
		owner.read().inventory.reverse();
		owner.read().inventory[1].notes = 'Newer detail';
		const before = structuredClone(owner.read().inventory[1]);
		expect(name.commit!(name.read(), 'Sword')).toEqual({ ok: true });
		expect(owner.read().inventory[1]).toEqual({ ...before, name: 'Sword' });
		expect(owner.read().inventory[1].quantity).toBeUndefined();
		owner.read().inventory.splice(1, 1);
		expect(name.commit!('Sword', 'Resurrect')).toMatchObject({ ok: false });
	});
	it('finds class features by stable feature identity after class reordering', () => {
		const owner = fixture();
		const field = create5eSmallRecordModel(owner, 'class-feature:0:second-wind')!.fields[0];
		owner.read().systemData.classes.unshift({ name: 'Wizard', level: 1 });
		expect(field.commit!(field.read(), 'Improved wind')).toEqual({ ok: true });
		expect(owner.read().systemData.classes[1].features![0].name).toBe('Improved wind');
		expect(owner.read().systemData.classes[0].features).toBeUndefined();
	});
	it('retains class creation even when the identity group has an empty class array', () => {
		const owner = fixture();
		owner.read().systemData.classes = [];
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).metaPrimaryData,
			'Identity'
		)!;
		expect(model.fields).toHaveLength(1);
		expect(model.actions![0].commit({ name: 'Wizard', level: 1 })).toEqual({ ok: true });
		expect(model.fields).toHaveLength(3);
		const name = project5eSheet(owner.read()).metaPrimaryData.name;
		expect(create5eSmallGridModel(owner, { name }, 'Name')!.fields).toHaveLength(1);
	});
	it('guards positional class ownership, preserves class content, and validates each save', () => {
		const owner = fixture();
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).metaPrimaryData,
			'Identity'
		)!;
		const level = model.fields.find((field) => field.label === 'Class 1 Level')!;
		const original = structuredClone(owner.read().systemData.classes[0]);
		expect(level.commit!(1, 0)).toMatchObject({ ok: false });
		expect(level.commit!(1, 2)).toEqual({ ok: true });
		expect(owner.read().systemData.classes[0]).toEqual({ ...original, level: 2 });
		owner.read().systemData.classes.unshift({ name: 'Wizard', level: 1 });
		expect(level.commit!(2, 3)).toMatchObject({ ok: false });
		expect(model.actions![0].commit({ name: 'Rogue', level: 1 })).toMatchObject({ ok: false });
	});
	it('rejects pending positional class operations after its own removal shifts the array', () => {
		const owner = fixture();
		owner.read().systemData.classes.push({ name: 'Wizard', level: 1 }, { name: 'Rogue', level: 1 });
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).metaPrimaryData,
			'Identity'
		)!;
		const pendingLevel = model.fields.find((field) => field.label === 'Class 2 Level')!;
		const pendingRemove = model.actions!.find((action) => action.key === 'remove-class-1')!;
		expect(model.actions!.find((action) => action.key === 'remove-class-0')!.commit({})).toEqual({
			ok: true
		});
		const saved = owner.read();
		expect(pendingRemove.commit({})).toMatchObject({ ok: false });
		expect(pendingLevel.commit!(1, 4)).toMatchObject({ ok: false });
		expect(owner.read()).toBe(saved);
		const currentLevel = model.fields.find((field) => field.label === 'Class 1 Level')!;
		expect(currentLevel.commit!(1, 2)).toEqual({ ok: true });
		expect(owner.read().systemData.classes.map((entry) => [entry.name, entry.level])).toEqual([
			['Wizard', 2],
			['Rogue', 1]
		]);
	});
	it('saves empty roleplay text without deleting its notes and edits notes independently', () => {
		const owner = fixture();
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).roleplayPrimaryData,
			'Roleplay'
		)!;
		const motive = model.fields[0];
		const notes = structuredClone(motive.notes!.read());
		expect(notes).toHaveLength(1);
		expect(motive.commit!(motive.read(), '')).toEqual({ ok: true });
		expect(motive.notes!.read()).toEqual(notes);
		expect(
			motive.notes!.commit({ before: notes[0], after: { ...notes[0], text: 'Updated' } })
		).toEqual({ ok: true });
		expect(owner.read().systemData.roleplay.motives?.body).toBe('');
	});
	it('class removal shifts field notes and reconciles priority without dropping surviving class data', () => {
		const owner = fixture();
		owner.read().systemData.classes.push({ name: 'Wizard', level: 2, hitDie: 'd6' });
		owner.read().systemData.collectionPins = { features: ['second-wind', 'general-feature'] };
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).metaPrimaryData,
			'Identity'
		)!;
		const field = model.fields.find((entry) => entry.label === 'Class 2 Level')!;
		const note = {
			id: 'class-note',
			origin: 'user' as const,
			kind: 'note' as const,
			text: 'Keep with wizard'
		};
		expect(field.notes!.commit({ before: undefined, after: note })).toEqual({ ok: true });
		expect(model.actions!.find((entry) => entry.key === 'remove-class-0')!.commit({})).toEqual({
			ok: true
		});
		expect(owner.read().systemData.classes).toEqual([{ name: 'Wizard', level: 2, hitDie: 'd6' }]);
		expect(owner.read().systemData.collectionPins?.features).toEqual(['general-feature']);
		const remaining = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).metaPrimaryData,
			'Identity'
		)!;
		expect(
			remaining.fields.find((entry) => entry.label === 'Class 1 Level')!.notes!.read()
		).toEqual([note]);
	});
	it('keeps scratchpad creation/removal separate from stable-ID field edits', () => {
		const owner = { ...fixture(), allocateId: () => 'created-note' };
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).scratchpadNotesData,
			'Scratchpad'
		)!;
		const body = model.fields.find((field) => field.kind === 'multiline')!;
		expect(body.commit!(body.read(), 'Edited')).toEqual({ ok: true });
		expect(model.actions![0].commit({ title: 'New', body: 'One new note', kind: 'quick' })).toEqual(
			{ ok: true }
		);
		expect(owner.read().notes[1].id).toBe('created-note');
		owner.read().notes.reverse();
		expect(body.commit!('Edited', 'Still same note')).toEqual({ ok: true });
		expect(owner.read().notes[1].body).toBe('Still same note');
		expect(
			model.actions!.find((action) => action.key === 'remove-scratch-scratch-1')!.commit({})
		).toEqual({ ok: true });
		expect(body.commit!('Still same note', 'Gone')).toMatchObject({ ok: false });
	});
	it('changes spell level without replacing identity, metadata, notes or pins', () => {
		const owner = fixture();
		const spell = owner.read().systemData.spellcasting!.spells![0];
		owner.read().systemData.collectionPins = { spells: [spell.spellId] };
		const field = create5eSmallSpellModel(owner, `spell:${spell.spellId}`)!.fields.find(
			(entry) => entry.key === 'level'
		)!;
		const before = field.read();
		for (const invalid of [-1, 10, 1.5, '3'])
			expect(field.commit!(before, invalid)).toMatchObject({ ok: false });
		const original = structuredClone(spell);
		expect(field.commit!(before, 3)).toEqual({ ok: true });
		expect(owner.read().systemData.spellcasting!.spells![0]).toEqual({ ...original, level: 3 });
		expect(owner.read().systemData.collectionPins?.spells).toEqual([spell.spellId]);
		expect(field.commit!(before, 4)).toMatchObject({ ok: false });
	});
	it('edits one slot value while preserving sibling values, annotated zero slots and absence', () => {
		const owner = fixture();
		const note = { id: 'slot-note', origin: 'user' as const, kind: 'note' as const, text: 'Keep' };
		owner.read().systemData.spellcasting!.slots = {
			'1': { used: 0, max: 2, annotations: [note] },
			'2': { used: 0, max: 0, annotations: [note] }
		};
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).spellSlotRuntimeData,
			'Slots'
		)!;
		const used = model.fields.find(
			(field) => field.key === '/systemData/spellcasting/slots/1/used'
		)!;
		const max = model.fields.find((field) => field.key === '/systemData/spellcasting/slots/1/max')!;
		expect(used.commit!(0, 1)).toEqual({ ok: true });
		expect(max.commit!(2, 0)).toEqual({ ok: true });
		expect(used.commit!(1, 0)).toEqual({ ok: true });
		expect(owner.read().systemData.spellcasting!.slots).toEqual({
			'1': { used: 0, max: 0, annotations: [note] },
			'2': { used: 0, max: 0, annotations: [note] }
		});
		const missing = model.fields.find(
			(field) => field.key === '/systemData/spellcasting/slots/3/used'
		)!;
		expect(missing.read()).toBeUndefined();
		expect(missing.commit!(undefined, -1)).toMatchObject({ ok: false });
		expect(missing.commit!(undefined, 1)).toEqual({ ok: true });
		expect(owner.read().systemData.spellcasting!.slots?.['3']).toEqual({ used: 1, max: 0 });
		expect(owner.read().systemData.spellcasting!.slots?.['4']).toBeUndefined();
		const stillMissing = model.fields.find(
			(field) => field.key === '/systemData/spellcasting/slots/4/used'
		)!;
		delete owner.read().systemData.spellcasting;
		expect(stillMissing.commit!(undefined, 1)).toMatchObject({ ok: false });
		expect(owner.read().systemData.spellcasting).toBeUndefined();
	});
	it('reports adapter rejection without committing and rejects a removed optional parent', () => {
		const owner = fixture();
		const rejected = create5eSmallGridModel(
			{ ...owner, reject: () => true },
			project5eSheet(owner.read()).quickRefReferenceData,
			'Stats'
		)!.fields[0];
		const before = owner.read();
		expect(rejected.commit!(rejected.read(), 20)).toMatchObject({
			ok: false,
			message: expect.stringContaining('rejects saves')
		});
		expect(owner.read()).toBe(before);
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).spellcastingRuntimeData,
			'Spellcasting'
		)!;
		const ability = model.fields.find((field) => field.label === 'Ability')!;
		const original = ability.read();
		delete owner.read().systemData.spellcasting;
		expect(ability.commit!(original, 'wis')).toMatchObject({ ok: false });
		expect(owner.read().systemData.spellcasting).toBeUndefined();
	});
	it('merges a leaf into current state, preserves notes and validates the entire candidate', () => {
		const owner = fixture();
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).abilityRuntimeColumns[0].data,
			'STR'
		)!;
		const score = model.fields.find((field) => field.label === 'Score')!;
		const before = score.read();
		owner.write({
			...owner.read(),
			identity: { ...owner.read().identity, name: 'Changed elsewhere' }
		});
		expect(score.commit!(before, 15)).toEqual({ ok: true });
		expect(owner.read().identity.name).toBe('Changed elsewhere');
		expect(score.read()).toBe(15);
		const saved = owner.read();
		expect(score.commit!(15, 'invalid')).toMatchObject({ ok: false });
		expect(owner.read()).toBe(saved);
		expect(score.commit!(before, 16)).toMatchObject({ ok: false });
	});
	it('preserves false/zero and does not invent absence or expose required-field deletion', () => {
		const owner = fixture();
		const model = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).abilityRuntimeColumns[0].data,
			'STR'
		)!;
		const save = model.fields.find((field) => field.label === 'Save')!;
		expect(save.commit!(save.read(), false)).toEqual({ ok: true });
		expect(save.read()).toBe(false);
		const score = model.fields.find((field) => field.label === 'Score')!;
		expect(score.canClear).toBe(false);
		expect(score.commit!(score.read(), undefined)).toMatchObject({ ok: false });
	});
	it('clears an eligible value while retaining notes, and rejects a removed owner', () => {
		const owner = fixture();
		owner.write({
			...owner.read(),
			identity: {
				...owner.read().identity,
				alignment: 'Neutral',
				annotations: [{ id: 'identity-note', origin: 'user', kind: 'note', text: 'Keep' }]
			}
		});
		const data: GridContentData = {
			alignment: { value: 'Neutral', fieldName: 'Alignment', bindPath: ['identity', 'alignment'] }
		};
		const field = create5eSmallGridModel(owner, data, 'Identity')!.fields[0];
		expect(field.commit!('Neutral', undefined)).toEqual({ ok: true });
		expect(owner.read().identity.alignment).toBeUndefined();
		expect(owner.read().identity.annotations?.[0].text).toBe('Keep');
		owner.write({ ...owner.read(), meta: { ...owner.read().meta, id: 'different' } });
		expect(field.commit!(undefined, 'Other')).toMatchObject({ ok: false });
	});
	it('uses stable spell identity while preserving latest neighbors and source data', () => {
		const owner = fixture();
		const spells = owner.read().systemData.spellcasting!.spells!;
		const spell = spells[0];
		const model = create5eSmallSpellModel(owner, `spell:${spell.spellId}`)!;
		const name = model.fields.find((field) => field.key === 'name')!;
		spell.notes = 'Concurrent detail';
		const old = structuredClone(spell);
		expect(name.commit!(name.read(), 'Renamed spell')).toEqual({ ok: true });
		const saved = owner.read().systemData.spellcasting!.spells![0];
		expect(saved).toEqual({ ...old, name: 'Renamed spell' });
		const savedOwner = owner.read();
		owner.write({ ...savedOwner, meta: { ...savedOwner.meta, id: 'other-character' } });
		expect(name.commit!('Renamed spell', 'Wrong owner')).toMatchObject({ ok: false });
		expect(
			name.notes!.commit({
				before: undefined,
				after: {
					id: 'wrong-owner-note',
					origin: 'user',
					kind: 'note',
					text: 'Wrong owner'
				}
			})
		).toMatchObject({ ok: false });
		owner.write(savedOwner);
		owner.read().systemData.spellcasting!.spells = [];
		expect(name.commit!('Renamed spell', 'Recreated')).toMatchObject({ ok: false });
	});
	it('saves notes independently, validates empty notes, and rejects stale note removal', () => {
		const owner = fixture();
		const spell = owner.read().systemData.spellcasting!.spells![0];
		const notes = create5eSmallSpellModel(owner, `spell:${spell.spellId}`)!.fields[0].notes!;
		const note = {
			id: 'new-note',
			kind: 'note' as const,
			origin: 'user' as const,
			text: 'One note'
		};
		expect(notes.commit({ before: undefined, after: { ...note, text: '' } })).toMatchObject({
			ok: false
		});
		expect(notes.commit({ before: undefined, after: note })).toEqual({ ok: true });
		expect(notes.commit({ before: note, after: { ...note, text: 'Newer' } })).toEqual({ ok: true });
		expect(notes.commit({ before: note, after: undefined })).toMatchObject({ ok: false });
		expect(owner.read().systemData.spellcasting!.spells![0].name).toBe(spell.name);
	});
});
