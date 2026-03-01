import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// if base url provided, use that
// else if production, force the basepath to be the repo name (gh-pages)
// default to nothing
const baseDir = (process.env.BASE_URL ?? process.env.NODE_ENV === 'production') ? '/ez-chars' : '';

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
