/// <reference types="vitest/config" />

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { type Plugin, type ResolvedConfig, type ViteDevServer, defineConfig } from 'vite';
import type { OutputOptions as RollupOutputOptions } from 'rollup';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve as pathResolve } from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import type { Dirent, Stats } from 'node:fs';
import type { NextHandleFunction } from 'connect';

const packageVersion = JSON.parse(
	readFileSync(pathResolve(process.cwd(), 'package.json'), 'utf8')
).version;

const copyDirectory = async (
	src: string,
	dest: string,
	excludedDirectoryNames: ReadonlySet<string> = new Set()
): Promise<void> => {
	if (!existsSync(src)) return;
	await mkdir(dest, { recursive: true });
	const entries: Dirent[] = await readdir(src, { withFileTypes: true });
	await Promise.all(
		entries
			.filter((entry) => !entry.name.startsWith('.') && !excludedDirectoryNames.has(entry.name))
			.map(async (entry) => {
				const srcPath = join(src, entry.name);
				const destPath = join(dest, entry.name);
				if (entry.isDirectory()) {
					await copyDirectory(srcPath, destPath, excludedDirectoryNames);
					return;
				}
				if (entry.isFile()) {
					await copyFile(srcPath, destPath);
				}
			})
	);
};

const docsExtPlugin = (): Plugin => {
	const sourceRelative = 'docs/ext';
	const excludedDirectoryNames = new Set(['local-only']);
	let rootDir = process.cwd();
	let outDir = 'dist';
	let shouldCopyOnCloseBundle = false;

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
			shouldCopyOnCloseBundle = config.command === 'build' && config.mode !== 'test';
		},
		configureServer(server: ViteDevServer) {
			const normalizedBase = (server.config.base || '/').replace(/\/$/, '');
			const mountPoints = ['/docs/ext'];
			if (normalizedBase && normalizedBase !== '/') {
				mountPoints.push(`${normalizedBase}/docs/ext`);
			}
			const sourceDir = pathResolve(rootDir ?? server.config.root, sourceRelative);
			if (!existsSync(sourceDir)) return;

			const handler: NextHandleFunction = (req, res, next) => {
				if (!req.url) return next();
				let requestPath: string;
				try {
					requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
				} catch {
					return next();
				}
				const mountPoint = mountPoints.find(
					(point) => requestPath === point || requestPath.startsWith(`${point}/`)
				);
				if (!mountPoint) return next();
				const relativePath = requestPath.slice(mountPoint.length);
				const sanitized = relativePath.replace(/^\/+/, '');
				if (sanitized.split('/').some((segment) => excludedDirectoryNames.has(segment))) {
					return next();
				}
				const target = pathResolve(sourceDir, sanitized);
				const targetRelative = relative(sourceDir, target);
				if (targetRelative.startsWith('..') || isAbsolute(targetRelative)) return next();

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
			if (!shouldCopyOnCloseBundle) return;
			const sourceDir = pathResolve(rootDir, sourceRelative);
			if (!existsSync(sourceDir)) return;
			const destination = pathResolve(rootDir, outDir, 'docs/ext');
			await copyDirectory(sourceDir, destination, excludedDirectoryNames);
		}
	};
};

const pdfJsAssetsPlugin = (): Plugin => {
	const supportDirectoryNames = [
		'cmaps',
		'iccs',
		'image_decoders',
		'standard_fonts',
		'wasm'
	] as const;
	const supportDirectorySet = new Set<string>(supportDirectoryNames);
	const require = createRequire(import.meta.url);
	const packageDir = pathResolve(require.resolve('pdfjs-dist/package.json'), '..');
	let rootDir = process.cwd();
	let outDir = 'dist';
	let shouldCopyOnCloseBundle = false;

	const getContentType = (filePath: string): string => {
		const extension = extname(filePath).toLowerCase();
		if (extension === '.wasm') return 'application/wasm';
		if (extension === '.js' || extension === '.mjs') return 'text/javascript; charset=utf-8';
		if (extension === '.ttf') return 'font/ttf';
		return 'application/octet-stream';
	};

	return {
		name: 'pdfjs-support-assets',
		configResolved(config: ResolvedConfig) {
			rootDir = config.root;
			outDir = config.build.outDir;
			shouldCopyOnCloseBundle = config.command === 'build' && config.mode !== 'test';
		},
		configureServer(server: ViteDevServer) {
			const normalizedBase = (server.config.base || '/').replace(/\/$/, '');
			const mountPoints = ['/pdfjs'];
			if (normalizedBase && normalizedBase !== '/') {
				mountPoints.push(`${normalizedBase}/pdfjs`);
			}

			const handler: NextHandleFunction = (req, res, next) => {
				if (!req.url) return next();
				let requestPath: string;
				try {
					requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
				} catch {
					return next();
				}
				const mountPoint = mountPoints.find(
					(point) => requestPath === point || requestPath.startsWith(`${point}/`)
				);
				if (!mountPoint) return next();
				const sanitized = requestPath.slice(mountPoint.length).replace(/^\/+/, '');
				const [supportDirectory] = sanitized.split('/');
				if (!supportDirectorySet.has(supportDirectory)) return next();
				const target = pathResolve(packageDir, sanitized);
				const targetRelative = relative(packageDir, target);
				if (targetRelative.startsWith('..') || isAbsolute(targetRelative)) return next();

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
			if (!shouldCopyOnCloseBundle) return;
			await Promise.all(
				supportDirectoryNames.map((directoryName) =>
					copyDirectory(
						pathResolve(packageDir, directoryName),
						pathResolve(rootDir, outDir, 'pdfjs', directoryName)
					)
				)
			);
		}
	};
};

// Rollup 4 errors if Kit passes `codeSplitting: undefined`; strip it
const removeUndefinedCodeSplitting = (): Plugin => ({
	name: 'remove-undefined-code-splitting',
	configResolved(config) {
		const output = config.build?.rollupOptions?.output;
		const scrub = (target?: RollupOutputOptions | null) => {
			if (target && 'codeSplitting' in target && target.codeSplitting === undefined) {
				delete target.codeSplitting;
			}
		};

		if (Array.isArray(output)) {
			output.forEach(scrub);
		} else {
			scrub(output);
		}
	}
});

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(packageVersion),
		__GIT_SHA__: JSON.stringify(
			(() => {
				try {
					return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
						.toString()
						.trim();
				} catch {
					return 'unknown';
				}
			})()
		)
	},
	plugins: [
		tailwindcss(),
		sveltekit(),
		docsExtPlugin(),
		pdfJsAssetsPlugin(),
		removeUndefinedCodeSplitting()
	]
});
