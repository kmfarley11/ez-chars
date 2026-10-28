import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Keep base path stable across dev + production for GitHub Pages parity.
const baseDir = process.env.STORYBOOK || process.env.STORYBOOK_TEST ? '' : '/ez-chars';

// Retain existing source imports without Kit's deprecated alias configuration.
// Keep these aligned with jsconfig.json until a dedicated subpath-import migration.
export const sourceAliases = {
	$lib: 'src/lib',
	$storage: 'src/lib/storage',
	$utils: 'src/lib/utils',
	$fixtures: 'src/fixtures'
};

/** @type {import('@sveltejs/kit/vite').Config} */
const config = {
	preprocess: vitePreprocess(),
	adapter: adapter({ fallback: 'index.html' }),
	paths: {
		base: baseDir
	},
	version: {
		pollInterval: 0
	}
};

export default config;
