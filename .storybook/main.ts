import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.ts'],
	addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
	framework: '@storybook/sveltekit',
	core: {
		disableTelemetry: true
	}
};

export default config;
