import { expect, type Page } from '@playwright/test';

const issuesByPage = new WeakMap<Page, Array<string>>();
const benignWebKitResizeObserverMessage =
	/^ResizeObserver loop completed with undelivered notifications\.?$/;

const isBenignWebKitResizeObserverIssue = (page: Page, message: string): boolean =>
	page.context().browser()?.browserType().name() === 'webkit' &&
	benignWebKitResizeObserverMessage.test(message.trim());

export const installBrowserErrorGuard = (page: Page) => {
	const issues: Array<string> = [];
	issuesByPage.set(page, issues);

	page.on('console', (message) => {
		const text = message.text();
		if (message.type() === 'error' && !isBenignWebKitResizeObserverIssue(page, text)) {
			issues.push(`console ${message.type()}: ${text}`);
		}
	});
	page.on('pageerror', (error) => {
		if (!isBenignWebKitResizeObserverIssue(page, error.message)) {
			issues.push(`page error: ${error.message}`);
		}
	});
};

export const expectNoBrowserErrors = (page: Page) => {
	expect(issuesByPage.get(page) ?? [], 'Unexpected browser console or page errors').toEqual([]);
};
