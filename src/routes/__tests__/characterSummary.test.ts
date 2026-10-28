import { describe, expect, it } from 'vitest';
import {
	formatCharacterName,
	formatClassSummary,
	formatSystemLabel,
	formatTimestamp,
	toCharacterSummary
} from '../characterSummary.js';
import { create5e2014Character, create5e2024Character } from '../../schema/index.js';
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
		it('shows authored 2024 classes without inventing an unknown level', () => {
			const character = create5e2024Character({
				systemData: {
					classes: [
						{ id: 'a', name: 'Wizard', level: 4 },
						{ id: 'b', name: 'Fighter' }
					]
				}
			});
			expect(formatClassSummary(character)).toBe('Wizard 4, Fighter');
		});
		it('formats single class with level', () => {
			const char = create5e2014Character({
				systemData: {
					classes: [{ name: 'Fighter', level: 3 }]
				}
			});
			expect(formatClassSummary(char)).toBe('Fighter 3');
		});

		it('formats multi-class with levels', () => {
			const char = create5e2014Character({
				systemData: {
					classes: [
						{ name: 'Paladin', level: 5 },
						{ name: 'Sorcerer', level: 2 }
					]
				}
			});
			expect(formatClassSummary(char)).toBe('Paladin 5, Sorcerer 2');
		});

		it('returns em-dash when classes array is empty or absent', () => {
			const emptyChar = create5e2014Character({
				systemData: { classes: [] }
			});
			expect(formatClassSummary(emptyChar)).toBe('—');

			expect(formatClassSummary(create5e2024Character())).toBe('—');
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
			const character = create5e2014Character({
				meta: {
					id: 'char-abc-123',
					createdAt: '2026-01-15T08:00:00.000Z',
					updatedAt: '2026-03-30T14:30:00.000Z'
				},

				system: {
					id: SYSTEM_ID_5E2014
				},
				systemData: {
					identity: {
						name: 'Gimli'
					},
					classes: [{ name: 'Fighter', level: 5 }]
				}
			});

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
			const character = create5e2024Character({
				meta: {
					id: 'char-unnamed-456',
					schemaVersion: 'dnd5e-2024.schema.v0',
					createdAt: '2026-02-01T00:00:00.000Z',
					updatedAt: '2026-02-01T00:00:00.000Z'
				},
				systemData: { identity: {}, inventory: [], runtimeActions: [], notes: [] }
			});

			const summary = toCharacterSummary(character);
			expect(summary.name).toBe('char-unnamed-456');
			expect(summary.systemLabel).toBe('D&D 5e (2024)');
			expect(summary.classSummary).toBe('—');
		});
	});
});
