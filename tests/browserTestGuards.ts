import { expect, type Page } from '@playwright/test';

const issuesByPage = new WeakMap<Page, Array<string>>();

export const installBrowserErrorGuard = (page: Page) => {
	const issues: Array<string> = [];
	issuesByPage.set(page, issues);

	page.on('console', (message) => {
		const text = message.text();
		if (message.type() === 'error' || /ResizeObserver\s+loop/i.test(text)) {
			issues.push(`console ${message.type()}: ${text}`);
		}
	});
	page.on('pageerror', (error) => {
		issues.push(`page error: ${error.message}`);
	});
};

export const expectNoBrowserErrors = (page: Page) => {
	expect(issuesByPage.get(page) ?? [], 'Unexpected browser console or page errors').toEqual([]);
};
