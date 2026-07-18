import { describe, expect, it } from 'vitest';
import {
	classify5e2014CharacterDataVersion,
	hydrate5e2014CharacterDocument,
	serialize5e2014CharacterDocument
} from '../migrations/system.5e2014';
import {
	CHARACTER_DATA_VERSION_5E2014,
	create5e2014Character,
	safeParse5e2014CharacterDocument
} from '../system.5e2014';
import {
	cloneLegacy5eFixture,
	legacyComprehensive5eCharacter,
	legacyOnlyActions5eCharacter,
	legacySparse5eCharacter
} from './fixtures/legacy5eCharacters';

const hydrateOrThrow = (input: unknown) => {
	const hydrated = hydrate5e2014CharacterDocument(input);
	if (!hydrated.success) throw new Error(JSON.stringify(hydrated.issues));
	return hydrated.data;
};

describe('5e 2014 character data migration', () => {
	it('classifies current, supported legacy, future, and unknown versions explicitly', () => {
		expect(classify5e2014CharacterDataVersion(CHARACTER_DATA_VERSION_5E2014)).toEqual({
			kind: 'current',
			version: CHARACTER_DATA_VERSION_5E2014
		});
		expect(classify5e2014CharacterDataVersion('0.0.1')).toEqual({
			kind: 'legacy',
			version: '0.0.1'
		});
		expect(classify5e2014CharacterDataVersion('char.v1')).toEqual({
			kind: 'legacy',
			version: 'char.v1'
		});
		expect(classify5e2014CharacterDataVersion('dnd5e-2014.v3')).toEqual({
			kind: 'future',
			version: 'dnd5e-2014.v3'
		});
		expect(classify5e2014CharacterDataVersion('mystery')).toEqual({
			kind: 'unsupported',
			version: 'mystery'
		});
	});

	it('normalizes sparse legacy groups and version-owned movement values', () => {
		const legacy = cloneLegacy5eFixture(legacySparse5eCharacter);
		const original = structuredClone(legacy);
		const migrated = hydrateOrThrow(legacy);

		expect(legacy).toEqual(original);
		expect(migrated.meta).toEqual({
			...legacy.meta,
			schemaVersion: CHARACTER_DATA_VERSION_5E2014
		});
		expect(migrated.features).toEqual([]);
		expect(migrated.inventory).toEqual([]);
		expect(migrated.notes).toEqual([]);
		expect(migrated.systemData.runtimeActions).toEqual([]);
		expect(migrated.systemData.currency).toEqual({});
		expect(migrated.systemData.roleplay).toEqual({});
		expect(migrated.systemData.proficiencies).toEqual({ languages: [], tools: [] });
		expect(migrated.systemData.spellcasting).toBeUndefined();
		expect(migrated.systemData.combat).toMatchObject({
			speed: 35,
			speedSwim: 20,
			speedFly: 0
		});
		expect(migrated.systemData.combat.speedClimb).toBeUndefined();
	});

	it('moves legacy-only attacks to runtime actions without changing their IDs', () => {
		const migrated = hydrateOrThrow(legacyOnlyActions5eCharacter);

		expect(migrated.systemData.runtimeActions).toEqual(
			legacyOnlyActions5eCharacter.systemData.attacks
		);
		expect(migrated.systemData).not.toHaveProperty('attacks');
	});

	it('merges dual action aliases deterministically with canonical IDs winning', () => {
		const migrated = hydrateOrThrow(legacyComprehensive5eCharacter);

		expect(migrated.systemData.runtimeActions.map((action) => action.id)).toEqual([
			'shared-action',
			'canonical-only',
			'legacy-only'
		]);
		expect(migrated.systemData.runtimeActions[0]).toMatchObject({
			name: 'Canonical Longsword',
			annotations: [{ id: 'action-annotation' }]
		});
	});

	it('combines tagged currency while preserving unrelated inventory and annotations', () => {
		const migrated = hydrateOrThrow(legacyComprehensive5eCharacter);

		expect(migrated.inventory.map((item) => item.id)).toEqual(['sword-1', 'rope-1']);
		expect(migrated.inventory[0]).toMatchObject({
			id: 'sword-1',
			tags: ['inventory:weapon', 'silvered'],
			annotations: [{ id: 'sword-annotation' }]
		});
		expect(migrated.inventory[1]).toMatchObject({
			id: 'rope-1',
			tags: ['adventuring-gear']
		});
		expect(migrated.systemData.currency.gp).toEqual({
			amount: 12,
			annotations: [
				expect.objectContaining({ id: 'gp-first-annotation' }),
				expect.objectContaining({ id: 'gp-second-annotation' })
			]
		});
	});

	it('moves the first recognized roleplay title and retains collisions in note order', () => {
		const migrated = hydrateOrThrow(legacyComprehensive5eCharacter);

		expect(migrated.systemData.roleplay.motives).toEqual({
			body: 'Protect the party.',
			annotations: [expect.objectContaining({ id: 'motive-annotation' })]
		});
		expect(migrated.systemData.roleplay.factionsOrgs).toEqual({ body: 'The Harpers.' });
		expect(migrated.notes.map((note) => note.id)).toEqual([
			'general-before',
			'general-middle',
			'motives-collision',
			'general-after'
		]);
		expect(migrated.notes[2]).toMatchObject({
			title: 'Motives',
			body: 'A conflicting authored note.'
		});
		expect(migrated.notes[3]).toMatchObject({ kind: 'session' });
	});

	it('moves ancestry and background proficiencies without name-only deduplication', () => {
		const migrated = hydrateOrThrow(legacyComprehensive5eCharacter);

		expect(migrated.systemData.proficiencies.languages).toEqual([
			{ name: 'Common', source: { kind: 'ancestry' } },
			{ name: 'Elvish', source: { kind: 'ancestry' } },
			{ name: 'Common', source: { kind: 'background' } },
			{ name: 'Draconic', source: { kind: 'background' } }
		]);
		expect(migrated.systemData.proficiencies.tools).toEqual([
			{ name: 'Calligrapher supplies', source: { kind: 'background' } }
		]);
		expect(migrated.systemData.race).not.toHaveProperty('languages');
		expect(migrated.systemData.background?.proficiencies).toEqual({ skills: ['Arcana'] });
	});

	it('preserves timestamps, identity-addressable records, and unrelated annotations', () => {
		const migrated = hydrateOrThrow(legacyComprehensive5eCharacter);

		expect(migrated.meta.createdAt).toBe(legacyComprehensive5eCharacter.meta.createdAt);
		expect(migrated.meta.updatedAt).toBe(legacyComprehensive5eCharacter.meta.updatedAt);
		expect(migrated.features[0]).toMatchObject({
			id: 'feature-root-1',
			annotations: [{ id: 'feature-annotation' }]
		});
		expect(migrated.annotations).toEqual([expect.objectContaining({ id: 'root-annotation' })]);
		expect(migrated.systemData.annotations).toMatchObject({
			combat: { armorClass: { _annotations: { 'ac-source': { id: 'ac-source' } } } }
		});
	});

	it('is idempotent after migration and serializes only the current model', () => {
		const once = hydrateOrThrow(legacyComprehensive5eCharacter);
		const twice = hydrateOrThrow(once);

		expect(twice).toEqual(once);
		expect(serialize5e2014CharacterDocument(once)).toEqual(once);
		expect(() =>
			serialize5e2014CharacterDocument(legacyComprehensive5eCharacter as never)
		).toThrow();
	});

	it('rejects future versions and invalid current documents with explicit reasons', () => {
		const future = cloneLegacy5eFixture(legacyComprehensive5eCharacter);
		future.meta.schemaVersion = 'dnd5e-2014.v3';
		const futureResult = hydrate5e2014CharacterDocument(future);
		expect(futureResult).toMatchObject({
			success: false,
			issues: [{ code: 'future-version', path: ['meta', 'schemaVersion'] }]
		});

		const invalidCurrent = create5e2014Character();
		const invalidResult = hydrate5e2014CharacterDocument({
			...invalidCurrent,
			systemData: { ...invalidCurrent.systemData, currency: undefined }
		});
		expect(invalidResult).toMatchObject({
			success: false,
			issues: [{ code: 'invalid-current-data' }]
		});
		expect(safeParse5e2014CharacterDocument(future).success).toBe(false);
	});
});
