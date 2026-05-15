import { describe, expect, it } from 'vitest';
import { seedChars } from '../../fixtures/characters';
import {
	CHARACTER_EXPORT_KIND,
	CHARACTER_EXPORT_VERSION,
	createCharacterExportEnvelope,
	safeParseCharacterExportEnvelope
} from '../importExport';

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
});
