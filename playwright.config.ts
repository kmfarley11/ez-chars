import { defineConfig, devices } from '@playwright/test';
import { env } from 'node:process';

const productionPreview = env.PLAYWRIGHT_PREVIEW === '1';
const baseURL = productionPreview ? 'http://127.0.0.1:4173' : 'http://localhost:5173';

export default defineConfig({
	testDir: './tests',
	testIgnore: ['**/catalog/**', ...(env.PLAYWRIGHT_PERF === '1' ? [] : ['**/*.perf.spec.ts'])],
	fullyParallel: true,
	timeout: 10_000,
	use: {
		baseURL,
		trace: 'retain-on-failure'
	},
	webServer: {
		command: productionPreview
			? 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort'
			: 'npm run dev -- --host 127.0.0.1 --port 5173',
		url: `${baseURL}/ez-chars/`,
		reuseExistingServer: !productionPreview
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } },
		{ name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } }
	]
});
