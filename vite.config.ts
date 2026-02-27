import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { type Plugin, type ResolvedConfig, type ViteDevServer, defineConfig } from 'vite';
import { createReadStream, existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { extname, join, resolve as pathResolve } from 'node:path';
import type { Dirent, Stats } from 'node:fs';
import type { NextHandleFunction } from 'connect';

const docsExtPlugin = (): Plugin => {
	const sourceRelative = 'docs/ext';
	let rootDir = process.cwd();
	let outDir = 'dist';

	const copyDirectory = async (src: string, dest: string): Promise<void> => {
		if (!existsSync(src)) return;
		await mkdir(dest, { recursive: true });
		const entries: Dirent[] = await readdir(src, { withFileTypes: true });
		await Promise.all(
			entries.map(async (entry) => {
				const srcPath = join(src, entry.name);
				const destPath = join(dest, entry.name);
				if (entry.isDirectory()) {
					await copyDirectory(srcPath, destPath);
					return;
				}
				if (entry.isFile()) {
					await copyFile(srcPath, destPath);
				}
			})
		);
	};

	const getContentType = (filePath: string): string => {
		const extension = extname(filePath).toLowerCase();
		if (extension === '.pdf') return 'application/pdf';
		if (extension === '.md') return 'text/markdown; charset=utf-8';
		return 'application/octet-stream';
	};

	return {
		name: 'docs-ext-static-assets',
		configResolved(config: ResolvedConfig) {
			rootDir = config.root;
			outDir = config.build.outDir;
		},
		configureServer(server: ViteDevServer) {
			const mountPoint = '/docs/ext';
			const sourceDir = pathResolve(rootDir ?? server.config.root, sourceRelative);
			if (!existsSync(sourceDir)) return;

			const handler: NextHandleFunction = (req, res, next) => {
				if (!req.url || !req.url.startsWith(mountPoint)) return next();
				const relativePath = req.url.slice(mountPoint.length);
				const sanitized = relativePath.replace(/^\/+/, '');
				const target = pathResolve(sourceDir, sanitized);
				if (!target.startsWith(sourceDir)) return next();

				stat(target)
					.then((fileStat: Stats) => {
						if (!fileStat.isFile()) return next();
						res.setHeader('Content-Type', getContentType(target));
						createReadStream(target)
							.on('error', () => next())
							.pipe(res);
					})
					.catch(() => next());
			};

			server.middlewares.use(handler);
		},
		async closeBundle() {
			const sourceDir = pathResolve(rootDir, sourceRelative);
			if (!existsSync(sourceDir)) return;
			const destination = pathResolve(rootDir, outDir, 'docs/ext');
			await copyDirectory(sourceDir, destination);
		}
	};
};

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), docsExtPlugin()]
});
