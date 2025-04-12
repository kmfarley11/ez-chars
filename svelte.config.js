import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const baseDir = process.env.BASE_URL || '/ez-chars/';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter({ fallback: 'index.html' }) },
	paths: {
		base: baseDir
	}
};

export default config;
