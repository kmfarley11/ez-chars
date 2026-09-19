import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './proof-tests',
	fullyParallel: false,
	timeout: 15_000,
	use: {
		baseURL: 'http://127.0.0.1:6006',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'npm run storybook -- --host 127.0.0.1',
		url: 'http://127.0.0.1:6006',
		reuseExistingServer: true,
		timeout: 120_000
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
