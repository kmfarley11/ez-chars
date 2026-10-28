import { describe, expect, it } from 'vitest';
import { createSheetEditCharacter } from '$lib/systems/dnd5e-2014/__tests__/sheet-edit-fixtures';
import {
	create5eSmallGridModel,
	create5eSmallSpellModel,
	create5eSmallRecordModel
} from '$lib/systems/dnd5e-2014/editing/small-edit-adapters';
import { project5eSheet, projectClassRows } from '$lib/systems/dnd5e-2014/sheet-projections';
import type { GridContentData } from '$lib/utils/gridContentTypes';
import { resolveDenseCollectionRow } from '../dense-collection-rows';
import { resolve5eRuntimeActionSource } from '../runtime-action-sources';
import { decodeDenseCollectionRemoveIntent } from '../editing/dense-collection-editing';
import { reduce5eSheetEditIntents } from '../editing/sheet-edit-intents';
import {
	safeParseStoredCharacterDocument,
	serializeStoredCharacterDocuments
} from '../../../../schema/storedCharacters';

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
	it('edits 2014 coverage leaves independently without fabricating bonuses or losing notes', () => {
		const owner = fixture();
		delete owner.read().systemData.combat.senses;
		const original = structuredClone(owner.read());
		const projection = project5eSheet(owner.read());
		expect(owner.read()).toEqual(original);
		const reference = create5eSmallGridModel(owner, projection.quickRefReferenceData, 'Reference')!;
		const passive = reference.fields.find((f) => f.label === 'Passive Perception')!;
		expect(passive.read()).toBeUndefined();
		expect(passive.commit!(undefined, 14)).toEqual({ ok: true });
		expect(passive.commit!(14, 14.5).ok).toBe(false);
		const inspiration = reference.fields.find((f) => f.label === 'Inspiration')!;
		expect(inspiration.commit!(inspiration.read(), true).ok).toBe(true);
		expect(inspiration.commit!(true, 'yes').ok).toBe(false);
		const ability = create5eSmallGridModel(owner, projection.abilityRuntimeColumns[0].data, 'STR')!;
		const bonus = ability.fields.find((f) => f.label === 'Athletics: Bonus')!;
		const expertise = ability.fields.find((f) => f.label === 'Athletics: Expertise')!;
		expect(bonus.commit!(bonus.read(), -1).ok).toBe(true);
		const note = {
			id: 'bonus-note',
			kind: 'note' as const,
			origin: 'user' as const,
			text: 'Situational'
		};
		expect(bonus.notes!.commit({ before: undefined, after: note }).ok).toBe(true);
		expect(expertise.commit!(expertise.read(), true).ok).toBe(true);
		expect(bonus.read()).toBe(-1);
		expect(
			project5eSheet(owner.read()).abilityRuntimeColumns[0].data.Athletics.displayStatus?.mark
		).toBe('E');
		expect(bonus.commit!(-1, undefined).ok).toBe(true);
		expect(bonus.notes!.read()).toEqual([note]);
		const saveBonus = ability.fields.find((f) => f.label === 'STR Save: Bonus')!;
		expect(saveBonus.commit!(saveBonus.read(), 3).ok).toBe(true);
		const identity = create5eSmallGridModel(
			owner,
			project5eSheet(owner.read()).metaPrimaryData,
			'Identity'
		)!;
		const subclass = identity.fields.find((f) => f.label === 'Class 1 Subclass')!;
		const player = identity.fields.find((f) => f.label === 'Player Name')!;
		expect(subclass.commit!(subclass.read(), 'Champion').ok).toBe(true);
		expect(player.commit!(player.read(), 'Test Player').ok).toBe(true);
		expect(projectClassRows(owner.read())[0].badges).toContain('Champion');
		const saved = serializeStoredCharacterDocuments([owner.read()])[0];
		expect(safeParseStoredCharacterDocument(saved)).toMatchObject({
			success: true,
			data: owner.read()
		});
		expect(owner.read().systemData.combat.hitPoints).toEqual(original.systemData.combat.hitPoints);
		expect(subclass.commit!(subclass.read(), undefined).ok).toBe(true);
		expect(passive.commit!(14, undefined).ok).toBe(true);
	});
	it('projects compact class badges/notes and reuses the guarded Add operation', () => {
		const owner = fixture();
		const model = create5eSmallGridModel(
			owner,
			{ classLevels: project5eSheet(owner.read()).metaPrimaryData.classLevels },
			'Classes'
		)!;
		const name = model.fields.find((field) => field.key === '/systemData/classes/0/name')!;
		expect(
			name.notes!.commit({
				before: undefined,
				after: { id: 'class-note', kind: 'note', origin: 'user', text: 'Remember this class' }
			}).ok
		).toBe(true);
		expect(projectClassRows(owner.read())[0]).toMatchObject({
			key: 'class:0',
			label: owner.read().systemData.classes[0].name,
			badges: [`Level ${owner.read().systemData.classes[0].level}`],
			annotations: [{ id: 'class-note' }]
		});
		const add = model.actions!.find((action) => action.key === 'add-class')!;
		expect(add.commit({ name: 'Wizard', level: 2 }).ok).toBe(true);
		expect(projectClassRows(owner.read()).at(-1)).toMatchObject({
			label: 'Wizard',
			badges: ['Level 2']
		});
		const staleAdd = model.actions!.find((action) => action.key === 'add-class')!;
		owner.read().systemData.classes.unshift({ name: 'Rogue', level: 1 });
		expect(staleAdd.commit({ name: 'Wrong target', level: 1 }).ok).toBe(false);
	});
	it.each([
		['item', 'weapon-1'],
		['spell', 'fire-bolt'],
		['feature', 'general-feature'],
		['feature', 'second-wind'],
		['feature', 'darkvision']
	] as const)('resolves %s source Detail and refreshes only domain-owned text', (kind, id) => {
		const owner = fixture();
		const action = owner.read().systemData.runtimeActions[0];
		action.source = { kind, id };
		action.name = 'Player snapshot';
		action.notes = 'Player detail';
		const resolved = resolve5eRuntimeActionSource(owner.read(), action.source)!;
		expect(resolved).toBeDefined();
		const model = create5eSmallRecordModel(owner, `runtime-action:${action.id}`)!;
		const source = model.source!.open()!;
		const name = source.fields.find((field) => field.label === 'Name')!;
		expect(name.commit!(name.read(), 'Changed source')).toEqual({ ok: true });
		expect(model.fields[0].read()).toBe('Player snapshot');
		expect(model.source!.label()).toContain('Changed source');
		const before = structuredClone(owner.read().systemData.runtimeActions[0]);
		expect(model.source!.refresh!.commit({})).toEqual({ ok: true });
		expect(owner.read().systemData.runtimeActions[0]).toEqual({
			...before,
			name: 'Changed source',
			...(resolved.ownedText.ownsNotes ? { notes: resolved.ownedText.notes } : {})
		});
		owner.read().systemData.runtimeActions = [];
		expect(model.source!.open()).toBeUndefined();
		expect(model.source!.refresh!.commit({}).ok).toBe(false);
	});
	it.each([
		['Weapons', 'weapons'],
		['Armor & Shields', 'armorShields'],
		['Other Gear', 'other']
	])(
		'saves readable inventory category %s as %s without changing item content or pins',
		(label, key) => {
			const owner = fixture();
			owner.read().systemData.collectionPins = { inventory: ['weapon-1'] };
			const before = structuredClone(owner.read().systemData.inventory[0]);
			const model = create5eSmallRecordModel(owner, 'item:weapon-1')!;
			const category = model.fields.find((field) => field.label === 'Category')!;
			expect(category.read()).toBe('Weapons');
			expect(category.display?.()).toBe('Weapons');
			expect(category.options).toEqual(['Weapons', 'Armor & Shields', 'Other Gear']);
			expect(category.commit!(category.read(), label)).toEqual({ ok: true });
			expect(category.read()).toBe(label);
			expect(category.display?.()).toBe(label);
			expect(owner.read().systemData.inventory[0]).toEqual({ ...before, category: key });
			expect(owner.read().systemData.collectionPins?.inventory).toEqual(['weapon-1']);
		}
	);
	it('rejects unavailable inventory category labels without changing the character', () => {
		const owner = fixture();
		const before = structuredClone(owner.read());
		const category = create5eSmallRecordModel(owner, 'item:weapon-1')!.fields.find(
			(field) => field.label === 'Category'
		)!;
		expect(category.commit!(category.read(), 'armorShields')).toEqual({
			ok: false,
			message: 'Choose an available option.'
		});
		expect(owner.read()).toEqual(before);
	});
	it('keeps category independent of names/tags and retains identity, notes, pins and source navigation when reclassified', () => {
		const owner = fixture();
		owner.read().systemData.collectionPins = { inventory: ['weapon-1'] };
		const before = structuredClone(owner.read().systemData.inventory[0]);
		const model = create5eSmallRecordModel(owner, 'item:weapon-1')!;
		const name = model.fields[0];
		const category = model.fields.find((field) => field.label === 'Category')!;
		expect(category.commit!(category.read(), 'Other Gear')).toEqual({ ok: true });
		expect(name.commit!(name.read(), 'Sword shield armor')).toEqual({ ok: true });
		expect(owner.read().systemData.inventory[0]).toEqual({
			...before,
			name: 'Sword shield armor',
			category: 'other'
		});
		expect(owner.read().systemData.collectionPins?.inventory).toEqual(['weapon-1']);
		const source = { kind: 'item' as const, id: 'weapon-1' };
		expect(resolve5eRuntimeActionSource(owner.read(), source)?.destination).toEqual({
			kind: 'inventory',
			group: 'other'
		});
		const row = resolveDenseCollectionRow(owner.read(), 'item:weapon-1')!;
		expect(row.source).toEqual({ kind: 'item', id: 'weapon-1', group: 'other' });
		const removed = reduce5eSheetEditIntents(owner.read(), [
			decodeDenseCollectionRemoveIntent(owner.read(), row)
		]);
		expect(removed.ok).toBe(true);
		if (!removed.ok) throw new Error('Expected valid removal');
		expect(removed.character.systemData.inventory.some((item) => item.id === before.id)).toBe(
			false
		);
		expect(removed.character.systemData.collectionPins?.inventory ?? []).not.toContain(before.id);
		expect(removed.character.systemData.runtimeActions[0].source).toBeUndefined();
	});
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
		expect(owner.read().systemData.inventory).toEqual(afterRename.systemData.inventory);
	});
	it('resolves reordered records and preserves unexposed properties and optional absence', () => {
		const owner = fixture();
		const model = create5eSmallRecordModel(owner, 'item:weapon-1')!;
		const name = model.fields[0];
		owner.read().systemData.inventory.reverse();
		owner.read().systemData.inventory[1].notes = 'Newer detail';
		const before = structuredClone(owner.read().systemData.inventory[1]);
		expect(name.commit!(name.read(), 'Sword')).toEqual({ ok: true });
		expect(owner.read().systemData.inventory[1]).toEqual({ ...before, name: 'Sword' });
		expect(owner.read().systemData.inventory[1].quantity).toBeUndefined();
		owner.read().systemData.inventory.splice(1, 1);
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
		expect(model.fields).toHaveLength(2);
		expect(model.actions![0].commit({ name: 'Wizard', level: 1 })).toEqual({ ok: true });
		expect(model.fields).toHaveLength(5);
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
		expect(owner.read().systemData.notes[1].id).toBe('created-note');
		owner.read().systemData.notes.reverse();
		expect(body.commit!('Edited', 'Still same note')).toEqual({ ok: true });
		expect(owner.read().systemData.notes[1].body).toBe('Still same note');
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
			systemData: {
				...owner.read().systemData,
				identity: { ...owner.read().systemData.identity, name: 'Changed elsewhere' }
			}
		});
		expect(score.commit!(before, 15)).toEqual({ ok: true });
		expect(owner.read().systemData.identity.name).toBe('Changed elsewhere');
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
		const save = model.fields.find((field) => field.key === '/systemData/saves/str/proficient')!;
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
			systemData: {
				...owner.read().systemData,
				identity: {
					...owner.read().systemData.identity,
					alignment: 'Neutral',
					annotations: [{ id: 'identity-note', origin: 'user', kind: 'note', text: 'Keep' }]
				}
			}
		});
		const data: GridContentData = {
			alignment: {
				value: 'Neutral',
				fieldName: 'Alignment',
				bindPath: ['systemData', 'identity', 'alignment']
			}
		};
		const field = create5eSmallGridModel(owner, data, 'Identity')!.fields[0];
		expect(field.commit!('Neutral', undefined)).toEqual({ ok: true });
		expect(owner.read().systemData.identity.alignment).toBeUndefined();
		expect(owner.read().systemData.identity.annotations?.[0].text).toBe('Keep');
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
