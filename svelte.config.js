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
		},
		alias: {
			$components: 'src/lib/components',
			$storage: 'src/lib/storage',
			$utils: 'src/lib/utils',
			$fixtures: 'src/fixtures'
		}
	}
};

export default config;
