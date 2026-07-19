import type { Preview } from '@storybook/sveltekit';

import '../src/app.css';

const preview: Preview = {
	parameters: {
		a11y: {
			test: 'error'
		}
	}
};

export default preview;
