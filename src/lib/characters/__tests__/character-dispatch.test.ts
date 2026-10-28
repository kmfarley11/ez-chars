import { describe, expect, it } from 'vitest';
import {
	characterCreationChoices,
	characterSheetPath,
	createCharacterForSystem,
	findCharacterById
} from '../character-dispatch';
import {
	applyCharacterImport,
	createCharacterExportEnvelope,
	safeParseCharacterExportEnvelope
} from '../../../schema/importExport';
import { toCharacterSummary } from '../../../routes/characterSummary';

const create = (id: 'dnd5e-2014' | 'dnd5e-2024', characterId: string) =>
	createCharacterForSystem(id, {
		createId: () => characterId,
		nowIso: () => '2026-10-16T00:00:00.000Z'
	});
describe('explicit application character dispatch', () => {
	it('creates only the two supported identities and resolves matching destinations', () => {
		const characters = characterCreationChoices.map(({ id }, index) => create(id, `test-${index}`));
		expect(characters.map(characterSheetPath)).toEqual(['/charsheets/5e', '/charsheets/5e2024']);
		expect(characters.map((character) => toCharacterSummary(character).systemLabel)).toEqual([
			'D&D 5e (2014)',
			'D&D 5e (2024)'
		]);
		expect(findCharacterById(characters, ' test-1 ')).toBe(characters[1]);
		expect(findCharacterById(characters, '')).toBeUndefined();
		expect(findCharacterById(characters, 'missing')).toBeUndefined();
	});
	it('round-trips mixed backups, skips cross-system ID collisions globally and rejects partial-invalid input', () => {
		const old = create('dnd5e-2014', 'same');
		const modern = create('dnd5e-2024', 'modern');
		const imported = {
			...createCharacterExportEnvelope([]),
			characters: [create('dnd5e-2024', 'same'), modern, modern]
		};
		const parsed = safeParseCharacterExportEnvelope(JSON.parse(JSON.stringify(imported)));
		if (!parsed.success) throw new Error('Expected valid backup');
		expect(() => applyCharacterImport([old], parsed.data, 'replace')).toThrow(
			'Duplicate character IDs'
		);
		expect(() => createCharacterExportEnvelope([old, create('dnd5e-2024', 'same')])).toThrow(
			'Duplicate character IDs'
		);
		const merged = applyCharacterImport([old], parsed.data, 'merge-new');
		expect(merged).toMatchObject({ addedCount: 1, skippedDuplicateCount: 2 });
		expect(merged.characters).toEqual([old, modern]);
		const invalid = {
			...imported,
			characters: [old, { ...modern, system: { id: 'unknown', version: 'future' } }]
		};
		expect(safeParseCharacterExportEnvelope(invalid).success).toBe(false);
		expect(merged.characters[0]).toBe(old);
	});
});
