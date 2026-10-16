import { defineConfig, devices } from '@playwright/test';

// Opt-in catalog-host regressions, separate from real application E2E.
export default defineConfig({
	testDir: './tests/catalog',
	// Whole-sheet edit/reset flows took ~22s alone and exceeded 30s alongside
	// the app suite. Serialize them; this is not a runtime performance budget.
	workers: 1,
	timeout: 60_000,
	use: { baseURL: 'http://localhost:6006', trace: 'retain-on-failure' },
	webServer: {
		command: 'npm run storybook -- --ci',
		url: 'http://localhost:6006',
		reuseExistingServer: true
	},
	projects: [
		{ name: 'light', use: { ...devices['Desktop Chrome'], colorScheme: 'light' } },
		{ name: 'dark', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } }
	]
});
