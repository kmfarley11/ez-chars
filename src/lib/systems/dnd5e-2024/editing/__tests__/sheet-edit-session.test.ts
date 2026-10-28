import { describe, expect, it } from 'vitest';
import { create5e2024Character } from '../../../../../schema/system-5e2024';
import {
	representativeCharacter5e2024,
	sparseCharacter5e2024
} from '../../../../../fixtures/characters-5e2024';
import { createSheetEditSession, newRecordData } from '../sheet-edit-session';
import { collectionRows, collectionGroupRows } from '../../collection-rows';
import { actionSourceCandidates } from '../../action-sources';
import { projectSheet } from '../../sheet-projections';
import { sheetFields } from '../../sheet-fields';
import { scalarPaths2024 } from '../../../../../schema/fields-5e2024';
import { hasReadFirstLabelTarget } from '$lib/utils/gridContentHelpers';
import {
	is5e2024Character,
	safeParseStoredCharacterDocument,
	serializeStoredCharacterDocuments
} from '../../../../../schema/storedCharacters';

const setup = (fixture = representativeCharacter5e2024) => {
	let character = structuredClone(fixture);
	let reject = false;
	let nextId = 0;
	const session = createSheetEditSession(
		{
			read: () => character,
			write: (next) => {
				character = next;
			},
			reject: () => reject
		},
		{ createId: () => `new-${++nextId}`, nowIso: () => '2026-10-17T00:00:00.000Z' }
	);
	return {
		session,
		read: () => character,
		reject: (value: boolean) => {
			reject = value;
		}
	};
};

describe('2024 proof edit owner', () => {
	it('retains authored class order and subclass badges without requiring a level', () => {
		const scope = setup(sparseCharacter5e2024);
		scope.read().systemData.classes = [
			{ id: 'wizard', name: 'Wizard', subclass: 'Evoker' },
			{ id: 'fighter', name: 'Fighter', level: 2 }
		];
		const rows = () => collectionRows(scope.read(), 'classes', '', [], { priority: false }).rows;
		expect(rows().map((row) => row.label)).toEqual(['Wizard', 'Fighter']);
		expect(rows()[0].badges).toEqual(['Evoker']);
		const model = scope.session.buildRecord('classes:wizard')!;
		const level = model.fields.find((field) => field.label === 'Level')!;
		expect(level.commit!(level.read(), 3).ok).toBe(true);
		expect(level.commit!(level.read(), undefined).ok).toBe(true);
		expect(rows()[0].badges).toEqual(['Evoker']);
		const name = model.fields.find((field) => field.label === 'Name')!;
		expect(name.commit!(name.read(), 'Zephyr').ok).toBe(true);
		const reloaded = serializeStoredCharacterDocuments([scope.read()])[0];
		if (!is5e2024Character(reloaded)) throw new Error('Expected 2024 character');
		expect(reloaded.systemData.classes?.map((entry) => entry.id)).toEqual(['wizard', 'fighter']);
		expect(rows().map((row) => row.label)).toEqual(['Zephyr', 'Fighter']);
	});
	it('saves one proficiency level atomically, preserves bonuses/notes and distinguishes unrecorded from none', () => {
		const scope = setup(sparseCharacter5e2024);
		scope.read().systemData.skills = { arcana: { bonus: 8 } };
		scope.read().systemData.fieldNotes = {
			'/systemData/skills/arcana/expertise': [
				{ id: 'old-expertise-note', origin: 'user', kind: 'note', text: 'Keep this note' }
			]
		};
		const data = scope.session.project([
			'skills.arcana.proficient',
			'skills.arcana.expertise',
			'skills.arcana.bonus'
		]);
		const model = scope.session.buildGrid({ data, title: 'Arcana' })!;
		const level = model.fields[0];
		expect(level.read()).toBe('Not recorded');
		expect(level.entryKey).toBe('/systemData/skills/arcana/proficient');
		const legacy = model.fields.find((field) => field.label === 'Arcana: Expertise notes')!;
		expect(legacy.commit).toBeUndefined();
		expect(legacy.notes!.read()[0].text).toBe('Keep this note');
		for (const [choice, expected] of [
			['Expertise', { proficient: true, expertise: true }],
			['Proficient', { proficient: true, expertise: false }],
			['None', { proficient: false, expertise: false }],
			['Not recorded', {}]
		] as const) {
			expect(level.commit!(level.read(), choice)).toEqual({ ok: true });
			expect(scope.read().systemData.skills?.arcana).toEqual({ bonus: 8, ...expected });
			expect(legacy.notes!.read()[0].text).toBe('Keep this note');
		}
		expect(scope.read().systemData.skills?.history).toBeUndefined();
		expect(
			safeParseStoredCharacterDocument(
				JSON.parse(JSON.stringify(serializeStoredCharacterDocuments([scope.read()])))[0]
			).success
		).toBe(true);
	});
	it('guards both original flags, including changes which leave the same displayed level', () => {
		const scope = setup(sparseCharacter5e2024);
		scope.read().systemData.skills = { arcana: { proficient: true } };
		const level = scope.session.buildGrid({
			title: 'Arcana',
			data: scope.session.project(['skills.arcana.proficient'])
		})!.fields[0];
		scope.read().systemData.skills!.arcana!.expertise = false;
		expect(level.read()).toBe('Proficient');
		expect(level.commit!('Proficient', 'Expertise').ok).toBe(false);
		expect(scope.read().systemData.skills!.arcana!.expertise).toBe(false);
	});
	it('preserves unusual imported flags on read/no-op and rejects unavailable choices and failed saves', () => {
		const scope = setup(sparseCharacter5e2024);
		scope.read().systemData.saves = { int: { proficient: false, expertise: true, bonus: 4 } };
		const level = scope.session.buildGrid({
			title: 'Intelligence',
			data: scope.session.project(['saves.int.proficient', 'saves.int.expertise'])
		})!.fields[0];
		expect(level.read()).toBe('Custom (preserved)');
		expect(level.explanation).toBeUndefined();
		expect(level.hint).toBeUndefined();
		expect(level.options).not.toContain('Expertise');
		expect(level.commit!(level.read(), level.read()).ok).toBe(true);
		expect(scope.read().systemData.saves?.int).toEqual({
			proficient: false,
			expertise: true,
			bonus: 4
		});
		expect(level.commit!(level.read(), 'Expertise').ok).toBe(false);
		scope.reject(true);
		expect(level.commit!(level.read(), 'Proficient').ok).toBe(false);
		expect(scope.read().systemData.saves?.int?.expertise).toBe(true);
		scope.reject(false);
		expect(level.commit!(level.read(), 'Proficient').ok).toBe(true);
		expect(scope.read().systemData.saves?.int).toEqual({
			proficient: true,
			expertise: false,
			bonus: 4
		});
	});
	it('keeps proficiency detail quiet and shows only the authored-bonus reminder by Bonus', () => {
		const scope = setup();
		const before = structuredClone(scope.read());
		const data = scope.session.project([
			'skills.arcana.proficient',
			'skills.arcana.expertise',
			'skills.arcana.bonus',
			'saves.int.proficient',
			'saves.int.expertise',
			'saves.int.bonus'
		]);
		const model = scope.session.buildGrid({ data, title: 'Checks' })!;
		expect(model.fields).toHaveLength(4);
		expect(model.fields[0].kind).toBe('select');
		for (const field of model.fields) {
			expect(field.explanation).toBeUndefined();
			expect(field.hint).toBe(
				field.kind === 'number'
					? 'Entered manually; changing proficiency won’t recalculate it.'
					: undefined
			);
		}
		expect(data['skills.arcana.expertise'].displayExplanation).toBeUndefined();
		expect(data['saves.int.expertise'].displayExplanation).toBeUndefined();
		expect(scope.read()).toEqual(before);
	});
	it('orders live fields by runtime priority and hides class pin presentation without rewriting stored pins', () => {
		const scope = setup();
		expect(Object.keys(projectSheet(scope.session).live)).toEqual([
			'currentHp',
			'tempHp',
			'deathSaves.successes',
			'deathSaves.failures',
			'heroicInspiration',
			'conditions'
		]);
		const id = scope.read().systemData.classes![0].id;
		expect(scope.session.togglePin('classes', id).ok).toBe(true);
		expect(
			collectionRows(scope.read(), 'classes', '', [], { priority: false }).rows.every(
				(row) => !row.pinned
			)
		).toBe(true);
		expect(scope.read().systemData.collectionPins?.classes).toContain(id);
		expect(projectSheet(scope.session).abilities[0].data['saves.str'].displayStatus).toBeDefined();
	});
	it('preserves class notes on names and individual leaves in compact collection summaries', () => {
		const scope = setup();
		const record = scope.read().systemData.classes![0];
		const model = scope.session.buildRecord(`classes:${record.id}`)!;
		for (const label of ['Name', 'Level']) {
			const field = model.fields.find((field) => field.label === label)!;
			expect(
				field.notes!.commit({
					before: undefined,
					after: { id: `note-${label}`, origin: 'user', kind: 'note', text: label }
				}).ok
			).toBe(true);
		}
		expect(collectionRows(scope.read(), 'classes').rows[0].annotations).toHaveLength(2);
		expect(safeParseStoredCharacterDocument(scope.read()).success).toBe(true);
	});

	it('combines feature and feat presentation without changing source, pin or removal ownership', () => {
		const scope = setup();
		for (const kind of ['features', 'feats'] as const) {
			const data = newRecordData(kind);
			data.name.value = kind === 'feats' ? 'Zed feat' : 'Alpha feature';
			expect(scope.session.add(kind, data).ok).toBe(true);
		}
		const feat = scope.read().systemData.feats!.at(-1)!;
		expect(scope.session.togglePin('feats', feat.id).ok).toBe(true);
		const combined = collectionGroupRows(scope.read(), ['features', 'feats']);
		expect(combined.rows[0].key).toBe(`feats:${feat.id}`);
		expect(combined.rows[0].badges).toContain('Feat');
		expect(collectionGroupRows(scope.read(), ['features', 'feats'], 'Alpha').rows).toHaveLength(1);
		expect(scope.session.buildRecord(combined.rows[0].key)?.title).toBe('Zed feat');
		expect(
			actionSourceCandidates(scope.read()).some((candidate) => candidate.label === 'Zed feat')
		).toBe(true);
		expect(scope.session.remove('feats', feat.id).ok).toBe(true);
		expect(
			collectionGroupRows(scope.read(), ['features', 'feats']).rows.some(
				(row) => row.key === `feats:${feat.id}`
			)
		).toBe(false);
		expect(scope.read().systemData.features!.some((entry) => entry.name === 'Alpha feature')).toBe(
			true
		);
	});

	it('maps every supported scalar and keeps empty paired groups reachable with unambiguous Detail labels', () => {
		const scope = setup(sparseCharacter5e2024);
		expect(sheetFields.map((field) => field.path.join('/')).sort()).toEqual(
			scalarPaths2024.map((path) => path.join('/')).sort()
		);
		const projected = projectSheet(scope.session);
		for (const group of [...projected.abilities, ...projected.slots]) {
			expect(hasReadFirstLabelTarget(group.data)).toBe(true);
			const model = scope.session.buildGrid({ title: 'Group', data: group.data })!;
			expect(model).toBeDefined();
			expect(new Set(model.fields.map((field) => field.label)).size).toBe(model.fields.length);
		}
	});
	it('authors optional scalar regions independently and validates each candidate without inventing neighbors', () => {
		const scope = setup(sparseCharacter5e2024);
		for (const [key, value] of [
			['abilities.int.score', 16],
			['spellcasting.ability', 'Intelligence'],
			['spellcasting.saveDC', 14],
			['slots.1.used', 1],
			['training.armor', 'Light'],
			['roleplay.ideals', 'Knowledge'],
			['heroicInspiration', true]
		] as const) {
			const model = scope.session.buildGrid({ title: key, data: scope.session.project([key]) })!;
			expect(model.fields[0].read()).toBeUndefined();
			expect(model.fields[0].commit!(undefined, value)).toEqual({ ok: true });
			expect(model.fields[0].read()).toBe(value);
		}
		expect(scope.read().systemData.abilities).toEqual({ int: { score: 16 } });
		expect(scope.read().systemData.spellcasting).toEqual({
			ability: 'int',
			saveDC: 14,
			slots: { '1': { used: 1 } }
		});
		const score = scope.session.buildGrid({
			title: 'Intelligence',
			data: scope.session.project(['abilities.int.score'])
		})!.fields[0];
		expect(score.commit!(16, 31).ok).toBe(false);
		expect(score.read()).toBe(16);
	});

	it.each([
		'classes',
		'languages',
		'tools',
		'features',
		'traits',
		'feats',
		'masteries',
		'spells'
	] as const)(
		'creates, independently edits, annotates, pins and removes optional %s records',
		(kind) => {
			const scope = setup(sparseCharacter5e2024);
			const draft = newRecordData(kind);
			draft.name.value = 'Authored record';
			expect(scope.session.add(kind, draft).ok).toBe(true);
			const model = scope.session.buildRecord(`${kind}:new-1`)!;
			const name = model.fields[0];
			expect(name.commit!('Authored record', 'Renamed record').ok).toBe(true);
			expect(
				name.notes!.commit({
					before: undefined,
					after: { id: 'note', kind: 'note', origin: 'user', text: 'Keep me' }
				}).ok
			).toBe(true);
			const description = model.fields.find((field) => field.label === 'Description')!;
			expect(
				description.notes!.commit({
					before: undefined,
					after: { id: 'detail-note', kind: 'note', origin: 'user', text: 'Field note' }
				}).ok
			).toBe(true);
			expect(scope.session.togglePin(kind, 'new-1').ok).toBe(true);
			expect(collectionRows(scope.read(), kind).rows[0]).toMatchObject({
				pinned: true,
				label: 'Renamed record'
			});
			expect(scope.session.remove(kind, 'new-1').ok).toBe(true);
			expect(scope.read().systemData.collectionPins?.[kind]).toEqual([]);
			expect(scope.read().systemData.fieldNotes).toBeUndefined();
			expect(name.commit!('Renamed record', 'Stale').ok).toBe(false);
		}
	);

	it.each(['spells', 'features', 'traits', 'feats', 'masteries'] as const)(
		'resolves %s source details and atomically detaches snapshots',
		(kind) => {
			const scope = setup(sparseCharacter5e2024);
			const draft = newRecordData(kind);
			draft.name.value = 'Source';
			draft.detail.value = 'Source text';
			expect(scope.session.add(kind, draft).ok).toBe(true);
			const source = actionSourceCandidates(scope.read())[0].source;
			const actionDraft = newRecordData('runtimeActions');
			actionDraft.name.value = 'Reviewed snapshot';
			expect(scope.session.add('runtimeActions', actionDraft, source).ok).toBe(true);
			const action = scope.session.buildRecord('runtimeActions:new-2')!;
			expect(action.source!.open()!.fields[0].key).toBe(`/${kind}/new-1/name`);
			expect(action.source!.refresh!.commit({}).ok).toBe(true);
			expect(action.fields[0].read()).toBe('Source');
			expect(scope.session.remove(kind, 'new-1').ok).toBe(true);
			expect(action.source!.open()).toBeUndefined();
			expect(action.fields[0].read()).toBe('Source');
			expect(scope.read().systemData.runtimeActions.at(-1)?.source).toBeUndefined();
		}
	);

	it('composes spell text, multi-level and Prepared filters while keeping matching pins first', () => {
		const scope = setup(sparseCharacter5e2024);
		for (const [name, level, prepared] of [
			['Ward zero', 0, true],
			['Ward two', 2, true],
			['Ward one', 1, false]
		] as const) {
			const draft = newRecordData('spells');
			draft.name.value = name;
			draft.level.value = level;
			draft.prepared.value = prepared;
			expect(scope.session.add('spells', draft).ok).toBe(true);
		}
		expect(scope.session.togglePin('spells', 'new-2').ok).toBe(true);
		expect(
			collectionRows(scope.read(), 'spells', 'ward', [], {
				levels: ['0', '2'],
				prepared: true
			}).rows.map((row) => row.identity)
		).toEqual(['new-2', 'new-1']);
		expect(
			collectionRows(scope.read(), 'spells', 'ward', [], { levels: ['1'], prepared: true }).rows
		).toEqual([]);
		const level = scope.session
			.buildRecord('spells:new-2')!
			.fields.find((field) => field.label === 'Level')!;
		expect(level.commit!(2, 10).ok).toBe(false);
		expect(level.commit!(2, 1).ok).toBe(true);
		expect(
			collectionRows(scope.read(), 'spells', 'ward', [], {
				levels: ['1'],
				prepared: true
			}).rows.map((row) => row.identity)
		).toEqual(['new-2']);
	});

	it('does not let a retained Detail model write through a changed character owner', () => {
		let character = structuredClone(representativeCharacter5e2024);
		const session = createSheetEditSession({
			read: () => character,
			write: (next) => {
				character = next;
			}
		});
		const name = session.buildRecord('inventory:mira-staff')!.fields[0];
		character = { ...character, meta: { ...character.meta, id: 'another-owner' } };
		expect(name.commit!('Quarterstaff', 'Wrong character').ok).toBe(false);
		expect(
			name.notes!.commit({
				before: undefined,
				after: { id: 'note', kind: 'note', origin: 'user', text: 'Wrong owner' }
			}).ok
		).toBe(false);
	});
	it('keeps editable source snapshots independent, refreshes only owned text and atomically detaches on deletion', () => {
		const scope = setup();
		const candidate = actionSourceCandidates(scope.read()).find(
			(entry) => entry.source.id === 'mira-staff'
		)!;
		const draft = newRecordData('runtimeActions');
		draft.name.value = 'My staff response';
		draft.detail.value = 'Player detail';
		draft.timing.value = 'Reaction';
		expect(scope.session.add('runtimeActions', draft, candidate.source).ok).toBe(true);
		expect(scope.session.add('runtimeActions', draft, candidate.source).ok).toBe(true);
		const model = scope.session.buildRecord('runtimeActions:new-1')!;
		const name = model.fields.find((field) => field.label === 'Name')!;
		const detail = model.fields.find((field) => field.label === 'Description')!;
		expect(
			name.notes!.commit({
				before: undefined,
				after: { id: 'action-note', kind: 'note', origin: 'user', text: 'Keep independent note' }
			}).ok
		).toBe(true);
		expect(
			detail.notes!.commit({
				before: undefined,
				after: { id: 'detail-note', kind: 'note', origin: 'user', text: 'Keep field note' }
			}).ok
		).toBe(true);
		expect(scope.session.togglePin('runtimeActions', 'new-1').ok).toBe(true);
		const source = model.source!.open()!;
		const sourceName = source.fields.find((field) => field.label === 'Name')!;
		const sourceText = source.fields.find((field) => field.label === 'Description')!;
		expect(sourceName.commit!(sourceName.read(), 'Renamed staff').ok).toBe(true);
		expect(sourceText.commit!(sourceText.read(), 'New source text').ok).toBe(true);
		const category = source.fields.find((field) => field.label === 'Category')!;
		expect(category.commit!(category.read(), 'Other Gear').ok).toBe(true);
		expect(name.read()).toBe('My staff response');
		expect(detail.read()).toBe('Player detail');
		expect(model.source!.label()).toBe('Renamed staff');
		expect(model.source!.refresh!.confirmation).toContain('overwrites direct edits');
		expect(model.source!.refresh!.commit({}).ok).toBe(true);
		expect(name.read()).toBe('Renamed staff');
		expect(detail.read()).toBe('New source text');
		expect(
			scope.read().systemData.runtimeActions.find((action) => action.id === 'new-2')!.detail
		).toBe('Player detail');
		expect(sourceText.commit!(sourceText.read(), undefined).ok).toBe(true);
		expect(model.source!.refresh!.commit({}).ok).toBe(true);
		expect(detail.read()).toBeUndefined();
		expect(name.notes!.read()[0].text).toBe('Keep independent note');
		expect(detail.notes!.read()[0].text).toBe('Keep field note');
		expect(
			scope.read().systemData.runtimeActions.find((action) => action.id === 'new-1')!.timing
		).toBe('reaction');
		const beforeDelete = structuredClone(scope.read());
		expect(
			safeParseStoredCharacterDocument(
				JSON.parse(JSON.stringify(serializeStoredCharacterDocuments([beforeDelete])))[0]
			)
		).toEqual({ success: true, data: beforeDelete });
		expect(scope.session.remove('inventory', 'mira-staff').ok).toBe(true);
		expect(scope.read().systemData.runtimeActions).toEqual(
			beforeDelete.systemData.runtimeActions.map((action) => ({
				...action,
				...(action.source ? { source: undefined } : {})
			}))
		);
		expect(scope.read().systemData.collectionPins?.runtimeActions).toEqual(
			beforeDelete.systemData.collectionPins?.runtimeActions
		);
		expect(scope.read().systemData.fieldNotes).toEqual(beforeDelete.systemData.fieldNotes);
		expect(model.source!.label()).toBeUndefined();
		expect(model.source!.open()).toBeUndefined();
		expect(model.source!.refresh!.commit({}).ok).toBe(false);
		expect(scope.session.add('runtimeActions', draft, candidate.source).ok).toBe(false);
	});

	it('rejects source writes without partial updates and preserves reviewed drafts when source text changes', () => {
		const scope = setup();
		const source = { kind: 'item', id: 'mira-staff' } as const;
		const draft = newRecordData('runtimeActions');
		draft.name.value = 'Reviewed name';
		draft.detail.value = 'Reviewed text';
		const name = scope.session.buildRecord('inventory:mira-staff')!.fields[0];
		expect(name.commit!(name.read(), 'Source changed while reviewing').ok).toBe(true);
		const before = structuredClone(scope.read());
		scope.reject(true);
		expect(scope.session.add('runtimeActions', draft, source).ok).toBe(false);
		expect(scope.read()).toEqual(before);
		scope.reject(false);
		expect(scope.session.add('runtimeActions', draft, source).ok).toBe(true);
		const action = scope.read().systemData.runtimeActions.at(-1)!;
		expect(action).toMatchObject({ name: 'Reviewed name', detail: 'Reviewed text', source });
		const model = scope.session.buildRecord(`runtimeActions:${action.id}`)!;
		const saved = structuredClone(scope.read());
		scope.reject(true);
		expect(model.source!.refresh!.commit({}).ok).toBe(false);
		expect(scope.session.remove('inventory', source.id).ok).toBe(false);
		expect(scope.read()).toEqual(saved);
		expect(scope.session.add('inventory', newRecordData('inventory'), source).ok).toBe(false);
	});

	it('projects unknown facts without manufacturing values and authors just one absent leaf', () => {
		const scope = setup(
			create5e2024Character(
				{},
				{ createId: () => 'blank', nowIso: () => '2026-10-16T00:00:00.000Z' }
			)
		);
		const data = scope.session.project(['currentHp', 'maxHp', 'species']);
		expect(data.currentHp.value).toBe('');
		expect(data.currentHp.binding?.valuePatchOperation).toBe('add');
		expect(scope.read().systemData.combat).toBeUndefined();
		expect(
			scope.session.patch([{ op: 'add', path: '/systemData/combat/hitPoints/current', value: 0 }])
		).toEqual({ ok: true });
		expect(scope.read().systemData.combat).toEqual({ hitPoints: { current: 0 } });
		expect(scope.read().systemData.identity).toEqual({});
	});

	it('saves leaves independently, keeps unrelated fields/notes and rejects stale or invalid changes', () => {
		const scope = setup();
		const model = scope.session.buildGrid({
			title: 'Origin',
			data: scope.session.project(['species', 'background'])
		})!;
		const [species, background] = model.fields;
		expect(species.commit!('Human', 'Elf')).toEqual({ ok: true });
		expect(background.commit!('Sage', 'Guide')).toEqual({ ok: true });
		expect(species.commit!('Human', 'Dwarf').ok).toBe(false);
		expect(
			scope.session.patch([
				{ op: 'replace', path: '/systemData/combat/hitPoints/current', value: -1 }
			]).ok
		).toBe(false);
		expect(scope.read().systemData.combat?.hitPoints?.current).toBe(22);
		expect(
			species.notes!.commit({
				before: undefined,
				after: { id: 'species-note', kind: 'note', origin: 'user', text: 'An authored exception.' }
			}).ok
		).toBe(true);
		expect(species.commit!('Elf', undefined).ok).toBe(true);
		expect(species.read()).toBeUndefined();
		expect(species.notes!.read().map((note) => note.id)).toEqual([
			'mira-species-reference',
			'species-note'
		]);
		expect(background.read()).toBe('Guide');
		expect(scope.read().meta.updatedAt).toBe('2026-10-17T00:00:00.000Z');
		expect(representativeCharacter5e2024.systemData.identity.species).toBe('Human');
	});

	it('retains stable item fields across reclassification and removal of a preceding record', () => {
		const scope = setup();
		const fields = scope.session.buildRecord('inventory:mira-pack')!.fields;
		const name = fields.find((field) => field.label === 'Name')!;
		const category = fields.find((field) => field.label === 'Category')!;
		expect(name.commit!('Travel pack', 'Sword-shaped pack').ok).toBe(true);
		expect(scope.read().systemData.inventory[2].category).toBe('other');
		expect(category.commit!('Other Gear', 'Weapons').ok).toBe(true);
		expect(scope.session.remove('inventory', 'mira-staff').ok).toBe(true);
		expect(name.commit!('Sword-shaped pack', 'Still a pack').ok).toBe(true);
		expect(scope.read().systemData.inventory.find((item) => item.id === 'mira-pack')).toMatchObject(
			{ name: 'Still a pack', category: 'weapons', annotations: [{ id: 'mira-pack-note' }] }
		);
		expect(scope.read().systemData.collectionPins?.inventory).toEqual(['mira-pack']);
		expect(scope.session.remove('inventory', 'mira-pack').ok).toBe(true);
		expect(name.commit!('Still a pack', 'Resurrected').ok).toBe(false);
		expect(scope.read().systemData.collectionPins?.inventory).toEqual([]);
	});

	it('rejects every write family without losing original data', () => {
		const scope = setup();
		const before = structuredClone(scope.read());
		scope.reject(true);
		expect(
			scope.session.patch([
				{ op: 'replace', path: '/systemData/combat/hitPoints/current', value: 3 }
			]).ok
		).toBe(false);
		expect(scope.session.togglePin('runtimeActions', 'mira-strike').ok).toBe(false);
		expect(scope.session.remove('inventory', 'mira-staff').ok).toBe(false);
		const add = newRecordData('inventory');
		add.name.value = 'New item';
		expect(scope.session.add('inventory', add).ok).toBe(false);
		const name = scope.session.buildRecord('inventory:mira-staff')!.fields[0];
		expect(name.commit!('Quarterstaff', 'Another staff').ok).toBe(false);
		expect(
			name.notes!.commit({
				before: undefined,
				after: { id: 'new-note', kind: 'note', origin: 'user', text: 'Not saved' }
			}).ok
		).toBe(false);
		expect(scope.read()).toEqual(before);
	});

	it('adds sparse records with explicit categories, retains ID and composes timing/text with global pins', () => {
		const scope = setup(sparseCharacter5e2024);
		const item = newRecordData('inventory');
		item.name.value = 'Backup sword';
		expect(scope.session.add('inventory', item).ok).toBe(true);
		expect(scope.read().systemData.inventory).toMatchObject([
			{ id: 'new-1', name: 'Backup sword', category: 'other' }
		]);
		const action = newRecordData('runtimeActions');
		action.name.value = 'Spear response';
		action.timing.value = 'Reaction';
		expect(scope.session.add('runtimeActions', action).ok).toBe(true);
		expect(scope.session.togglePin('runtimeActions', 'new-2').ok).toBe(true);
		expect(collectionRows(scope.read(), 'runtimeActions').rows[0].identity).toBe('new-2');
		expect(
			collectionRows(scope.read(), 'runtimeActions', 'spear', ['action']).rows.map(
				(row) => row.identity
			)
		).toEqual(['pip-action']);
		expect(
			collectionRows(scope.read(), 'runtimeActions', 'spear', ['action', 'reaction']).rows
		).toHaveLength(2);
		const note = newRecordData('notes');
		note.body.value = 'Remember to rest.';
		expect(scope.session.add('notes', note).ok).toBe(true);
		expect(scope.read().systemData.notes.at(-1)?.body).toBe('Remember to rest.');
	});
});
