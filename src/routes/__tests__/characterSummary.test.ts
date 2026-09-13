import { describe, expect, it } from 'vitest';
import {
	formatCharacterName,
	formatClassSummary,
	formatSystemLabel,
	formatTimestamp,
	toCharacterSummary
} from '../characterSummary.js';
import type { CharacterWithSystemData } from '../../schema/index.js';
import { SYSTEM_ID_5E2014 } from '../../schema/versions.5e2014.js';

describe('characterSummary view-model projection', () => {
	describe('formatCharacterName', () => {
		it('returns trimmed name when present', () => {
			expect(formatCharacterName('  Valeros  ', 'char-123')).toBe('Valeros');
		});

		it('falls back to identifier when name is undefined', () => {
			expect(formatCharacterName(undefined, 'char-123')).toBe('char-123');
		});

		it('falls back to identifier when name is empty or whitespace only', () => {
			expect(formatCharacterName('', 'char-123')).toBe('char-123');
			expect(formatCharacterName('   ', 'char-123')).toBe('char-123');
		});
	});

	describe('formatSystemLabel', () => {
		it('returns human-readable label for 5e 2014', () => {
			expect(formatSystemLabel(SYSTEM_ID_5E2014)).toBe('D&D 5e (2014)');
		});

		it('returns system id for unknown system', () => {
			expect(formatSystemLabel('pathfinder-2e')).toBe('pathfinder-2e');
		});

		it('returns fallback for empty or missing system id', () => {
			expect(formatSystemLabel('')).toBe('Unknown System');
			expect(formatSystemLabel(undefined)).toBe('Unknown System');
		});
	});

	describe('formatClassSummary', () => {
		it('formats single class with level', () => {
			const char = {
				systemData: {
					classes: [{ name: 'Fighter', level: 3 }]
				}
			} as unknown as CharacterWithSystemData;
			expect(formatClassSummary(char)).toBe('Fighter 3');
		});

		it('formats multi-class with levels', () => {
			const char = {
				systemData: {
					classes: [
						{ name: 'Paladin', level: 5 },
						{ name: 'Sorcerer', level: 2 }
					]
				}
			} as unknown as CharacterWithSystemData;
			expect(formatClassSummary(char)).toBe('Paladin 5, Sorcerer 2');
		});

		it('returns em-dash when classes array is empty or absent', () => {
			const emptyChar = {
				systemData: { classes: [] }
			} as unknown as CharacterWithSystemData;
			expect(formatClassSummary(emptyChar)).toBe('—');

			const noSystemDataChar = {} as unknown as CharacterWithSystemData;
			expect(formatClassSummary(noSystemDataChar)).toBe('—');
		});
	});

	describe('formatTimestamp', () => {
		it('formats ISO timestamp into human-readable date string in UTC', () => {
			expect(formatTimestamp('2026-03-30T12:00:00.000Z')).toBe('Mar 30, 2026');
		});

		it('returns em-dash for undefined or empty timestamp', () => {
			expect(formatTimestamp(undefined)).toBe('—');
			expect(formatTimestamp('')).toBe('—');
		});

		it('returns raw string if not a valid ISO date', () => {
			expect(formatTimestamp('invalid-date')).toBe('invalid-date');
		});
	});

	describe('toCharacterSummary', () => {
		it('derives a complete summary from character document', () => {
			const character: CharacterWithSystemData = {
				meta: {
					id: 'char-abc-123',
					createdAt: '2026-01-15T08:00:00.000Z',
					updatedAt: '2026-03-30T14:30:00.000Z'
				},
				identity: {
					name: 'Gimli'
				},
				system: {
					id: SYSTEM_ID_5E2014
				},
				systemData: {
					classes: [{ name: 'Fighter', level: 5 }]
				}
			} as unknown as CharacterWithSystemData;

			const summary = toCharacterSummary(character);
			expect(summary).toEqual({
				id: 'char-abc-123',
				name: 'Gimli',
				systemId: SYSTEM_ID_5E2014,
				systemLabel: 'D&D 5e (2014)',
				classSummary: 'Fighter 5',
				updatedAt: 'Mar 30, 2026',
				updatedAtRaw: '2026-03-30T14:30:00.000Z',
				createdAt: 'Jan 15, 2026',
				createdAtRaw: '2026-01-15T08:00:00.000Z',
				raw: character
			});
		});

		it('handles missing identity name by falling back to character id', () => {
			const character: CharacterWithSystemData = {
				meta: {
					id: 'char-unnamed-456',
					createdAt: '2026-02-01T00:00:00.000Z',
					updatedAt: '2026-02-01T00:00:00.000Z'
				},
				identity: {},
				system: {
					id: 'custom-system'
				}
			} as unknown as CharacterWithSystemData;

			const summary = toCharacterSummary(character);
			expect(summary.name).toBe('char-unnamed-456');
			expect(summary.systemLabel).toBe('custom-system');
			expect(summary.classSummary).toBe('—');
		});
	});
});
