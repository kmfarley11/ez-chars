/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// import { viteSingleFile } from 'vite-plugin-singlefile'
// import { createHtmlPlugin } from 'vite-plugin-html'

// https://github.com/vitejs/vite/issues/621#issuecomment-824418351
// https://stackoverflow.com/questions/67781170/bundle-js-and-css-into-single-file-with-vite
export default defineConfig({
	plugins: [
    sveltekit()
    // viteSingleFile()
  ],
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: undefined,
  //     },
  //   },
  // },
});
