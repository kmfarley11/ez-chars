import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	timeout: 10_000,
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 5173',
		url: 'http://localhost:5173',
		reuseExistingServer: true
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
	]
});
