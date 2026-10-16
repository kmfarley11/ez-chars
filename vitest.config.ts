import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, mergeConfig } from 'vitest/config';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import viteConfig from './vite.config';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		projects: [
			mergeConfig(
				viteConfig,
				defineConfig({
					test: {
						name: 'unit',
						coverage: {
							exclude: ['**/.svelte-kit/**', 'src/**/*.test.{ts,js}', 'src/**/__tests__/**'],
							include: ['src/schema/**/*.{ts,js}', 'src/lib/characterStorage.ts'],
							provider: 'v8',
							reporter: ['text', 'html'],
							reportsDirectory: 'coverage'
						},
						environment: 'node',
						globals: false,
						include: ['src/**/*.{test,spec}.{ts,js}'],
						setupFiles: ['src/test-utils/browser.setup.ts']
					}
				})
			),
			{
				extends: true,
				plugins: [
					sveltekit(),
					storybookTest({
						configDir: join(projectRoot, '.storybook')
					})
				],
				test: {
					name: 'storybook',
					setupFiles: ['.storybook/vitest.setup.ts'],
					// Whole-sheet canonical examples retain the full axe audit. The saturated
					// fixture measured ~19s locally; do not disable rules to fit the 15s default.
					testTimeout: 30_000,
					fileParallelism: false,
					browser: {
						enabled: true,
						headless: true,
						api: {
							host: '127.0.0.1'
						},
						provider: playwright(),
						instances: [{ browser: 'chromium' }]
					}
				}
			}
		]
	}
});
