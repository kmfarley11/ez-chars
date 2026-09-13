import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import CharacterList from '../CharacterList.svelte';
import { seedChars } from '../../../fixtures/characters.js';

describe('CharacterList component markup contract', () => {
	it('renders both semantic desktop table and semantic mobile card list with human-readable text', () => {
		const unnamedChar = {
			meta: { id: 'char-unnamed-001', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
			identity: {},
			system: { id: 'dnd5e-2014' },
			systemData: { classes: [] }
		} as any;

		const { body } = render(CharacterList, {
			props: {
				characters: [...seedChars, unnamedChar],
				onSelect: () => {},
				onDelete: () => {}
			}
		});

		// Desktop table assertions
		expect(body).toContain('<table');
		expect(body).toContain('Bryltin Brewhammer');
		expect(body).toContain('D&amp;D 5e (2014)');
		expect(body).toContain('warrior 8');

		// Mobile card list assertions
		expect(body).toContain('<ul role="list"');
		expect(body).toContain('<article');
		expect(body).toContain('char-unnamed-001'); // Fallback for unnamed character

		// Action targets
		expect(body).toContain('aria-label="Open Bryltin Brewhammer"');
		expect(body).toContain('aria-label="Delete Bryltin Brewhammer"');
	});

	it('renders empty state when no characters are present', () => {
		const { body } = render(CharacterList, {
			props: {
				characters: [],
				onSelect: () => {}
			}
		});

		expect(body).toContain('No characters found.');
		expect(body).not.toContain('<table');
		expect(body).not.toContain('<ul role="list"');
	});
});
