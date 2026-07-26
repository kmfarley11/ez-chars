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

const hydrateOrThrow = (input: unknown) => {
	const hydrated = hydrate5e2014CharacterDocument(input);
	if (!hydrated.success) throw new Error(JSON.stringify(hydrated.issues));
	return hydrated.data;
};

describe('5e 2014 character data hydration', () => {
	it('classifies current, future, retired experimental, and unknown versions explicitly', () => {
		expect(classify5e2014CharacterDataVersion(CHARACTER_DATA_VERSION_5E2014)).toEqual({
			kind: 'current',
			version: CHARACTER_DATA_VERSION_5E2014
		});
		expect(classify5e2014CharacterDataVersion('dnd5e-2014.schema.v1')).toEqual({
			kind: 'future',
			version: 'dnd5e-2014.schema.v1'
		});
		for (const version of ['0.0.1', 'char.v1', 'dnd5e-2014.v2', 'dnd5e-2014.v3']) {
			expect(classify5e2014CharacterDataVersion(version)).toEqual({
				kind: 'unsupported',
				version
			});
		}
		expect(classify5e2014CharacterDataVersion('mystery')).toEqual({
			kind: 'unsupported',
			version: 'mystery'
		});
	});

	it('hydrates current v0 data idempotently and serializes only validated current data', () => {
		const character = create5e2014Character({
			meta: { id: 'current-character' },
			features: [{ id: 'general-feature', name: 'General Feature' }],
			inventory: [{ id: 'item-1', name: 'Longsword' }],
			systemData: {
				race: {
					name: 'Elf',
					traits: [{ featureId: 'trait-1', name: 'Darkvision' }]
				},
				background: {
					name: 'Sage',
					features: [{ featureId: 'background-1', name: 'Researcher' }]
				},
				classes: [
					{
						name: 'Wizard',
						level: 1,
						features: [{ featureId: 'class-feature-1', name: 'Arcane Recovery' }]
					}
				],
				spellcasting: {
					ability: 'int',
					spells: [{ spellId: 'spell-1', name: 'Shield', level: 1 }]
				},
				runtimeActions: [
					{
						id: 'spell-action',
						name: 'Shield',
						source: { kind: 'spell', id: 'spell-1' }
					},
					{
						id: 'trait-action',
						name: 'Darkvision',
						source: { kind: 'feature', id: 'trait-1' }
					}
				]
			}
		});

		const once = hydrateOrThrow(character);
		const twice = hydrateOrThrow(once);

		expect(twice).toEqual(once);
		expect(serialize5e2014CharacterDocument(once)).toEqual(once);
	});

	it('rejects future and retired versions without modifying the input', () => {
		const character = create5e2014Character();
		for (const [version, issueCode] of [
			['dnd5e-2014.schema.v1', 'future-version'],
			['dnd5e-2014.v3', 'unsupported-version']
		] as const) {
			const input = {
				...structuredClone(character),
				meta: { ...character.meta, schemaVersion: version }
			};
			const original = structuredClone(input);

			expect(hydrate5e2014CharacterDocument(input)).toMatchObject({
				success: false,
				issues: [{ code: issueCode, path: ['meta', 'schemaVersion'] }]
			});
			expect(input).toEqual(original);
		}
	});

	it('rejects invalid current documents with detailed current-data issues', () => {
		const current = create5e2014Character();
		const invalid = {
			...current,
			systemData: { ...current.systemData, currency: undefined }
		};

		expect(hydrate5e2014CharacterDocument(invalid)).toMatchObject({
			success: false,
			issues: [{ code: 'invalid-current-data' }]
		});
		expect(safeParse5e2014CharacterDocument(invalid).success).toBe(false);
		expect(() => serialize5e2014CharacterDocument(invalid as never)).toThrow();
	});
});
