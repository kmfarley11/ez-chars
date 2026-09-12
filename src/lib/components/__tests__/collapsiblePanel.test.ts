import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import CollapsiblePanel from '../CollapsiblePanel.svelte';

describe('CollapsiblePanel', () => {
	it('exposes a stable heading target and controlled-content relationship', () => {
		const { body } = render(CollapsiblePanel, {
			props: {
				heading: 'Features & Traits',
				headingId: 'sheet-features-traits-heading'
			}
		});

		expect(body).toContain('id="sheet-features-traits-heading"');
		expect(body).toContain('aria-controls="sheet-features-traits-heading-content"');
		expect(body).toContain('aria-expanded="true"');
	});

	it('preserves the existing starts-collapsed behavior', () => {
		const { body } = render(CollapsiblePanel, {
			props: {
				heading: 'Spells',
				headingId: 'sheet-spells-heading',
				startsCollapsed: true
			}
		});

		expect(body).toContain('aria-expanded="false"');
		expect(body).toContain('aria-label="Expand Spells"');
		expect(body).not.toContain('id="sheet-spells-heading-content"');
	});
});
