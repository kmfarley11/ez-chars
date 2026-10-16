import type { Preview } from '@storybook/sveltekit';

import '../src/app.css';
import StorySurface from '../src/lib/storybook/story-surface.svelte';

const preview: Preview = {
	decorators: [() => ({ Component: StorySurface })],
	parameters: {
		a11y: {
			test: 'error'
		}
	}
};

export default preview;
