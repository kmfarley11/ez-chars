import { describe, expect, it } from 'vitest';
import { seedChars } from '../../fixtures/characters';
import {
	applyCharacterImport,
	CHARACTER_EXPORT_KIND,
	CHARACTER_EXPORT_VERSION,
	createCharacterExportEnvelope,
	safeParseCharacterExportEnvelope
} from '../importExport';
import { create5e2014Character, parse5e2014CharacterDocument } from '../system.5e2014';
import { legacyComprehensive5eCharacter } from './fixtures/legacy5eCharacters';

describe('character import/export envelope', () => {
	it('creates a parseable versioned backup envelope for character documents', () => {
		const envelope = createCharacterExportEnvelope(seedChars);
		const parsed = safeParseCharacterExportEnvelope(envelope);

		expect(envelope.kind).toBe(CHARACTER_EXPORT_KIND);
		expect(envelope.version).toBe(CHARACTER_EXPORT_VERSION);
		expect(envelope.app?.name).toBe('ez-chars');
		expect(envelope.exportedAt).toEqual(expect.any(String));
		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data.characters).toHaveLength(seedChars.length);
			expect(parsed.data.characters).toEqual(envelope.characters);
		}
	});

	it('rejects raw character arrays because imports require the public backup envelope', () => {
		expect(safeParseCharacterExportEnvelope(seedChars).success).toBe(false);
	});

	it('rejects unsupported envelope versions', () => {
		const envelope = {
			...createCharacterExportEnvelope(seedChars),
			version: CHARACTER_EXPORT_VERSION + 1
		};

		expect(safeParseCharacterExportEnvelope(envelope).success).toBe(false);
	});

	it('rejects envelopes containing invalid character documents', () => {
		const [firstCharacter] = seedChars;
		const envelope = {
			...createCharacterExportEnvelope([firstCharacter]),
			characters: [
				{
					...firstCharacter,
					systemData: {
						level: 1
					}
				}
			]
		};

		expect(safeParseCharacterExportEnvelope(envelope).success).toBe(false);
	});

	it('hydrates legacy imported characters and re-exports only current data', () => {
		const imported = safeParseCharacterExportEnvelope({
			kind: CHARACTER_EXPORT_KIND,
			version: CHARACTER_EXPORT_VERSION,
			exportedAt: '2026-07-18T12:00:00Z',
			characters: [legacyComprehensive5eCharacter]
		});

		expect(imported.success).toBe(true);
		if (!imported.success) return;
		const migrated = imported.data.characters[0];
		expect(migrated.meta.schemaVersion).toBe('dnd5e-2014.v2');
		if (migrated.system.id === 'dnd5e-2014') {
			const migrated5e = parse5e2014CharacterDocument(migrated);
			expect(migrated5e.systemData).not.toHaveProperty('attacks');
			expect(migrated5e.systemData.currency.gp?.amount).toBe(12);
		}

		const reExported = createCharacterExportEnvelope(imported.data.characters);
		expect(reExported.characters).toEqual(imported.data.characters);
	});

	it('replaces all current characters with imported characters', () => {
		const currentCharacter = create5e2014Character({
			name: 'Current Character',
			meta: {
				id: 'current-character'
			}
		});
		const importedCharacter = create5e2014Character({
			name: 'Imported Character',
			meta: {
				id: 'imported-character'
			}
		});
		const envelope = createCharacterExportEnvelope([importedCharacter]);

		const result = applyCharacterImport([currentCharacter], envelope, 'replace');

		expect(result).toEqual({
			characters: [importedCharacter],
			addedCount: 1,
			skippedDuplicateCount: 0
		});
	});

	it('merges only new imported characters and skips duplicate ids', () => {
		const currentCharacter = create5e2014Character({
			name: 'Current Character',
			meta: {
				id: 'current-character'
			}
		});
		const duplicateExistingCharacter = create5e2014Character({
			name: 'Duplicate Existing Character',
			meta: {
				id: 'current-character'
			}
		});
		const newImportedCharacter = create5e2014Character({
			name: 'New Imported Character',
			meta: {
				id: 'new-imported-character'
			}
		});
		const duplicateInsideImport = create5e2014Character({
			name: 'Duplicate Inside Import',
			meta: {
				id: 'new-imported-character'
			}
		});
		const envelope = createCharacterExportEnvelope([
			duplicateExistingCharacter,
			newImportedCharacter,
			duplicateInsideImport
		]);

		const result = applyCharacterImport([currentCharacter], envelope, 'merge-new');

		expect(result.characters.map((character) => character.meta.id)).toEqual([
			'current-character',
			'new-imported-character'
		]);
		expect(result.addedCount).toBe(1);
		expect(result.skippedDuplicateCount).toBe(2);
	});
});
