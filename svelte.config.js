import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Keep base path stable across dev + production for GitHub Pages parity.
const baseDir = '/ez-chars';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		paths: {
			base: baseDir
		}
	}
};

export default config;
