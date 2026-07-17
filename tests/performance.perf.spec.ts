import { expect, test } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import { e2eCharacter, e2eStoredCharacters } from './fixtures/characters';

const storageKey = 'ez-chars.characters.v1';

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: storageKey,
		value: e2eStoredCharacters
	});
});

test.afterEach(({ page }) => {
	expectNoBrowserErrors(page);
});

test('records a scroll-frame baseline for the character sheet', async ({ page }, testInfo) => {
	await page.goto('/');
	await page
		.locator('tbody tr')
		.filter({ hasText: e2eCharacter.identity.name })
		.locator('td')
		.first()
		.click();
	await expect(page.getByText('Current HP:', { exact: false })).toBeVisible();

	const frameStats = await page.evaluate(async () => {
		const scrollTarget = document.scrollingElement;
		if (!scrollTarget) throw new Error('Expected a document scrolling element.');

		const frameTimes: Array<number> = [];
		let previousTime = performance.now();
		let recording = true;
		const recordFrame = (time: number) => {
			if (!recording) return;
			frameTimes.push(time - previousTime);
			previousTime = time;
			requestAnimationFrame(recordFrame);
		};
		requestAnimationFrame(recordFrame);

		const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		const top = scrollTarget.scrollTop;
		const distance = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight);
		for (const progress of [...Array(30).keys()].map((index) => (index + 1) / 30)) {
			scrollTarget.scrollTop = distance * progress;
			await nextFrame();
		}
		for (const progress of [...Array(30).keys()].map((index) => 1 - (index + 1) / 30)) {
			scrollTarget.scrollTop = distance * progress;
			await nextFrame();
		}
		scrollTarget.scrollTop = top;
		await nextFrame();

		recording = false;
		const intervals = frameTimes.slice(1);
		const averageInterval =
			intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
		const overVsyncBudgetCount = intervals.filter((interval) => interval > 16.7).length;
		const droppedFrameCount = intervals.filter((interval) => interval > 33.3).length;
		return {
			frameCount: intervals.length,
			averageFps: 1000 / averageInterval,
			overVsyncBudgetRate: overVsyncBudgetCount / intervals.length,
			droppedFrameRate: droppedFrameCount / intervals.length
		};
	});

	testInfo.annotations.push({
		type: 'scroll-frame-baseline',
		description: JSON.stringify(frameStats)
	});
	expect(frameStats.frameCount).toBeGreaterThanOrEqual(60);
	expect(frameStats.averageFps).toBeGreaterThanOrEqual(55);
	expect(frameStats.droppedFrameRate).toBeLessThanOrEqual(0.05);
});
