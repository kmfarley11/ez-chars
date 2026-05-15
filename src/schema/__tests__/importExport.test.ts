import { describe, expect, it } from 'vitest';
import { seedChars } from '../../fixtures/characters';
import {
	applyCharacterImport,
	CHARACTER_EXPORT_KIND,
	CHARACTER_EXPORT_VERSION,
	createCharacterExportEnvelope,
	safeParseCharacterExportEnvelope
} from '../importExport';
import { create5e2014Character } from '../system.5e2014';

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
		const envelope = createCharacterExportEnvelope([
			{
				...firstCharacter,
				systemData: {
					level: 1
				}
			}
		]);

		expect(safeParseCharacterExportEnvelope(envelope).success).toBe(false);
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
