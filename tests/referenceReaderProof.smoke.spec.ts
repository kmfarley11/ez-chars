import { expect, test } from '@playwright/test';
import { e2eStoredCharacters } from './fixtures/characters';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';

test.describe.configure({ mode: 'serial' });
test.beforeEach(async ({ page }, testInfo) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(
		(data) => localStorage.setItem('ez-chars.characters.v1', JSON.stringify(data)),
		e2eStoredCharacters
	);
	await page.setViewportSize({ width: 390, height: 844 });
	// Enter direct links on the first load; a second goto can abort WebKit module imports.
	const reference = testInfo.title.startsWith('direct reference entry')
		? '&reference=dnd5e-2014.srd-5-1.equipment'
		: '';
	await page.goto(`/ez-chars/charsheets/5e?id=e2e-character${reference}`);
});
test.afterEach(({ page }) => expectNoBrowserErrors(page));

test('direct reference entry closes in place and can reopen through ordinary Rules access', async ({
	page
}) => {
	const reader = page.getByRole('dialog', { name: 'Rules reference' });
	await expect(reader.getByLabel('Selectable text for page 62')).not.toBeEmpty();
	const beforeClose = page.url();
	await reader.getByRole('button', { name: 'Close rules reference' }).click();
	await expect(reader).not.toBeVisible();
	await expect(page).toHaveURL(beforeClose);
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	await expect(reader.getByLabel('Selectable text for page 1')).not.toBeEmpty();
	await page.goBack();
	await expect(reader).not.toBeVisible();
});

test('compact reader keeps Find direct, preserves reading/search context, and isolates the sheet', async ({
	page
}) => {
	test.setTimeout(60_000);
	const trigger = page.getByRole('button', { name: 'Rules', exact: true });
	await trigger.click();
	const reader = page.getByRole('dialog', { name: 'Rules reference' });
	await expect(reader).toBeVisible();
	const bounds = await reader.boundingBox();
	expect(bounds!.width).toBe(390);
	expect(bounds!.height).toBe(844);
	const document = reader.getByRole('region', { name: /PDF document pages/ });
	await expect(reader.getByLabel('Selectable text for page 1')).toContainText('System Reference');
	const documentBounds = (await document.boundingBox())!;
	const toolsPane = reader.getByRole('complementary', { name: 'PDF navigation details' });
	await reader.getByRole('button', { name: 'Page tools', exact: true }).click();
	expect((await toolsPane.boundingBox())!.height).toBeLessThan(documentBounds.height * 0.7);
	await reader.getByRole('button', { name: 'Back to document', exact: true }).click();
	await expect(reader.getByRole('searchbox')).not.toBeVisible();
	const backgroundEdit = page.getByRole('button', { name: 'Edit Current HP' });
	await backgroundEdit.evaluate((element: HTMLButtonElement) => element.focus());
	await expect(backgroundEdit).not.toBeFocused();
	await reader.getByRole('button', { name: 'Find', exact: true }).click();
	await expect(document).not.toBeVisible();
	const find = reader.getByRole('region', { name: 'Find tools' });
	await expect(find.getByRole('searchbox')).toBeFocused();
	const initialFindHeight = (await toolsPane.boundingBox())!.height;
	expect(initialFindHeight).toBeLessThan(documentBounds.height * 0.7);
	await find.getByRole('searchbox').fill('armor');
	await find.getByRole('button', { name: 'Find', exact: true }).click();
	await expect(find.getByText(/^\d+ matches on \d+ pages\.$/)).toBeVisible({ timeout: 30_000 });
	const resultsHeight = (await toolsPane.boundingBox())!.height;
	expect(resultsHeight).toBeGreaterThan(initialFindHeight);
	expect(resultsHeight).toBeLessThanOrEqual(documentBounds.height + 1);
	// Long results still scroll within the bounded tool area, including its last result.
	const lastResult = find.getByRole('button', { name: /^Page \d+ \(/ }).last();
	await lastResult.scrollIntoViewIfNeeded();
	await expect(lastResult).toBeInViewport();
	const disclosure = reader.locator('summary').filter({ hasText: /^Results ·/ });
	await disclosure.click();
	expect((await toolsPane.boundingBox())!.height).toBeLessThan(resultsHeight);
	await disclosure.click();
	const firstResult = find.getByRole('button', { name: /^Page \d+ \(/ }).first();
	await expect(firstResult.locator('mark').first()).toHaveText(/armor/i);
	const resultText = await firstResult.innerText();
	const resultPage = Number(resultText.match(/^Page (\d+)/)![1]);
	await firstResult.click();
	await expect(document).toBeVisible();
	await expect(document).toBeFocused();
	await expect(reader.getByLabel(`PDF page ${resultPage}, current page`)).toBeVisible();
	const scrollTop = await document.evaluate((el) => el.scrollTop);
	await reader.getByRole('button', { name: 'Find', exact: true }).click();
	await expect(find.getByRole('searchbox')).toHaveValue('armor');
	await expect(firstResult).toBeVisible();
	await reader.getByRole('button', { name: 'Back to document', exact: true }).click();
	await expect.poll(() => document.evaluate((el) => el.scrollTop)).toBe(scrollTop);
	await reader.getByRole('button', { name: 'Outline', exact: true }).click();
	await reader.getByRole('button', { name: /Equipment — page 62/ }).click();
	await expect(reader.getByLabel('PDF page 62, current page')).toBeVisible();
	const more = reader.getByRole('button', { name: 'More reference actions' });
	await more.click();
	await expect(reader.getByRole('link', { name: 'Open in browser', exact: true })).toHaveAttribute(
		'href',
		/#page=62$/
	);
	await reader.getByRole('button', { name: 'Outline', exact: true }).click();
	await expect(
		reader.getByRole('link', { name: 'Open in browser', exact: true })
	).not.toBeVisible();
	await expect(more).toHaveAttribute('aria-expanded', 'false');
	await more.click();
	await reader.getByRole('link', { name: 'Open in browser', exact: true }).focus();
	await page.keyboard.press('Escape');
	await expect(more).toBeFocused();
	await expect(more).toHaveAttribute('aria-expanded', 'false');
	await expect(reader).toBeVisible();
	await more.click();
	const popupPromise = page.waitForEvent('popup');
	await reader.getByRole('link', { name: 'Open in browser', exact: true }).click();
	const popup = await popupPromise;
	// The native PDF viewer is browser-owned (headless Chromium may expose a blank URL).
	// The real link destination is asserted above; here verify new-tab activation/dismissal.
	await popup.close();
	await expect(more).toHaveAttribute('aria-expanded', 'false');
	await more.click();
	await reader.getByRole('button', { name: 'Browse resources', exact: true }).click();
	await expect(more).not.toBeVisible();
	await reader.getByRole('button', { name: 'Back to document', exact: true }).click();
	await expect(more).toHaveAttribute('aria-expanded', 'false');
	await expect(
		reader.getByRole('link', { name: 'Open in browser', exact: true })
	).not.toBeVisible();
	await page.goBack();
	await expect(reader).not.toBeVisible();
	await expect(trigger).toBeFocused();
});

test('desktop reader preserves the scrolled sheet outline and allows independent sheet scrolling', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	const navigation = page.getByRole('navigation', { name: 'Character sheet navigation' });
	await navigation.getByRole('button', { name: 'Features & Traits', exact: true }).click();
	const sheetTop = await page.evaluate(() => window.scrollY);
	expect(sheetTop).toBeGreaterThan(300);
	const outlineBounds = (await navigation.boundingBox())!;
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	const reader = page.getByRole('dialog', { name: 'Rules reference' });
	await expect(reader.getByLabel('Selectable text for page 1')).not.toBeEmpty();
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(sheetTop);
	expect(Math.abs((await navigation.boundingBox())!.y - outlineBounds.y)).toBeLessThan(2);
	await expect(
		navigation.getByRole('button', { name: 'Quick Reference', exact: true })
	).toBeInViewport();
	const divider = reader.getByRole('separator', { name: 'Resize or close rules reference' });
	const resizeBounds = (await divider.boundingBox())!;
	await page.mouse.move(resizeBounds.x + resizeBounds.width / 2, resizeBounds.y + 100);
	await page.mouse.down();
	await page.mouse.move(800, resizeBounds.y + 100, { steps: 8 });
	await page.mouse.up();
	const readerBounds = (await reader.boundingBox())!;
	expect(readerBounds.width).toBeLessThan(800);
	const document = reader.getByRole('region', { name: /PDF document pages/ });
	const documentTop = await document.evaluate((el) => el.scrollTop);
	const beforeWheel = await page.evaluate(() => window.scrollY);
	await page.mouse.move(readerBounds.x - 50, 500);
	await page.mouse.wheel(0, 400);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeWheel + 100);
	await expect(reader).toBeVisible();
	await expect.poll(() => document.evaluate((el) => el.scrollTop)).toBe(documentTop);
	await reader.getByRole('button', { name: 'Page tools', exact: true }).click();
	const beforeJump = await page.evaluate(() => window.scrollY);
	await reader.getByRole('spinbutton', { name: 'Page', exact: true }).fill('62');
	await reader.getByRole('button', { name: 'Go', exact: true }).click();
	await expect(reader.getByLabel('PDF page 62, current page')).toBeVisible();
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(beforeJump);
	// A true modal still locks the sheet even while the desktop reader remains mounted.
	await navigation.getByRole('button', { name: 'Quick Reference', exact: true }).click();
	await page.getByRole('button', { name: 'Add notes for Current HP', exact: true }).click();
	const notes = page
		.getByRole('dialog')
		.filter({ has: page.getByRole('button', { name: 'Add note for Current HP', exact: true }) });
	await expect(notes).toBeVisible();
	const modalSheetTop = await page.evaluate(() => window.scrollY);
	await page.mouse.move(20, 500);
	await page.mouse.wheel(0, 400);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(modalSheetTop);
	await notes.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(notes).not.toBeVisible();
	await expect(reader).toBeVisible();
	const resumedSheetTop = await page.evaluate(() => window.scrollY);
	await page.mouse.move(readerBounds.x - 50, 500);
	await page.mouse.wheel(0, 400);
	await expect
		.poll(() => page.evaluate(() => window.scrollY))
		.toBeGreaterThan(resumedSheetTop + 100);
});

test('Close preserves the current sheet position while browser Back restores reader invocation', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	const rules = page.getByRole('button', { name: 'Rules', exact: true });
	const reader = page.getByRole('dialog', { name: 'Rules reference' });
	const navigation = page.getByRole('navigation', { name: 'Character sheet navigation' });
	await navigation.getByRole('button', { name: 'Quick Reference', exact: true }).click();
	await rules.click();
	await expect(reader.getByLabel('Selectable text for page 1')).not.toBeEmpty();
	const openedLength = await page.evaluate(() => history.length);
	await reader.getByRole('spinbutton', { name: 'Page', exact: true }).fill('62');
	await reader.getByRole('button', { name: 'Go', exact: true }).click();
	await expect(reader.getByLabel('PDF page 62, current page')).toBeVisible();
	expect(await page.evaluate(() => history.length)).toBe(openedLength);
	await navigation.getByRole('button', { name: 'Features & Traits', exact: true }).click();
	await navigation.getByRole('button', { name: 'Inventory / Equipment', exact: true }).click();
	const inventoryUrl = page.url();
	const inventoryTop = await page.evaluate(() => window.scrollY);
	await reader.getByRole('button', { name: 'Close rules reference' }).click();
	await expect(reader).not.toBeVisible();
	await expect(rules).toBeFocused();
	await expect(page).toHaveURL(inventoryUrl);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(inventoryTop);
	// Explicit dismissal replaces the reader entry, so history cannot resurrect it.
	await page.goBack();
	await expect(page).toHaveURL(/#sheet-quick-reference-heading$/);
	await page.goForward();
	await expect(page).toHaveURL(inventoryUrl);
	await expect(reader).not.toBeVisible();
	await rules.click();
	await expect(reader).toBeVisible();
	await navigation.getByRole('button', { name: 'Spells', exact: true }).click();
	await page.goBack();
	await expect(reader).not.toBeVisible();
	await expect(page).toHaveURL(inventoryUrl);
	await expect(rules).toBeFocused();
	await page.goForward();
	await expect(reader).toBeVisible();
});

type ScrollDiagnosticWindow = typeof window & {
	readerScrollDiagnostic: {
		samples: unknown[];
		mark: (phase: string, event?: Event) => void;
		dispose: () => void;
	};
};

// Keep the original combined press as a control: splitting its steps changes timing.
for (const dismissal of ['combined Home', 'split Home', 'Close button'] as const) {
	test(`resize dismissal preserves sheet scroll even when the reference invoker is offscreen (${dismissal})`, async ({
		page
	}, testInfo) => {
		await page.setViewportSize({ width: 1440, height: 1000 });
		const trigger = page.getByRole('button', { name: 'References: classes' });
		await trigger.click();
		const reader = page.getByRole('dialog', { name: 'Rules reference' });
		await expect(reader.getByLabel('Selectable text for page 8')).not.toBeEmpty();
		await page
			.getByRole('navigation', { name: 'Character sheet navigation' })
			.getByRole('button', { name: 'Inventory / Equipment', exact: true })
			.click();
		await page.evaluate(() => window.scrollBy(0, 130));
		await expect(trigger).not.toBeInViewport();
		const currentUrl = page.url();
		const currentTop = await page.evaluate(() => window.scrollY);
		await page.evaluate(() => {
			const samples: unknown[] = [];
			const describe = (target: EventTarget | null) =>
				target instanceof Element
					? {
							tag: target.tagName,
							id: target.id,
							role: target.getAttribute('role'),
							label: target.getAttribute('aria-label')
						}
					: null;
			const mark = (phase: string, event?: Event) => {
				if (samples.length >= 100) return;
				samples.push({
					phase,
					time: performance.now(),
					scrollY: window.scrollY,
					focus: describe(document.activeElement),
					target: describe(event?.target ?? null),
					key: event instanceof KeyboardEvent ? event.key : undefined,
					defaultPrevented: event?.defaultPrevented,
					readerPresent: !!document.querySelector('dialog[aria-label="Rules reference"]')
				});
			};
			const events = ['focusin', 'focusout', 'keydown', 'keyup', 'scroll', 'close'] as const;
			const observe = (event: Event) => {
				mark(`${event.type}:capture`, event);
			};
			// A microtask queued during capture can run before the target handler.
			// Observe bubbling separately to capture the application's preventDefault.
			const observeHandledKey = (event: KeyboardEvent) => {
				mark(`${event.type}:bubble`, event);
				queueMicrotask(() => mark(`${event.type}:after-bubble`, event));
			};
			for (const name of events) window.addEventListener(name, observe, true);
			window.addEventListener('keydown', observeHandledKey);
			window.addEventListener('keyup', observeHandledKey);
			(window as ScrollDiagnosticWindow).readerScrollDiagnostic = {
				samples,
				mark,
				dispose: () => {
					for (const name of events) window.removeEventListener(name, observe, true);
					window.removeEventListener('keydown', observeHandledKey);
					window.removeEventListener('keyup', observeHandledKey);
				}
			};
			mark('before-dismissal');
		});
		const mark = (phase: string) =>
			page.evaluate((label) => {
				(window as ScrollDiagnosticWindow).readerScrollDiagnostic.mark(label);
			}, phase);
		try {
			const handle = reader.getByRole('separator', { name: 'Resize or close rules reference' });
			if (dismissal === 'combined Home') {
				await handle.press('Home');
			} else if (dismissal === 'split Home') {
				await handle.focus();
				await mark('after-handle-focus');
				await expect(handle).toBeFocused();
				await expect
					.poll(
						() => page.evaluate(() => window.scrollY),
						'focusing resize handle preserves sheet scroll'
					)
					.toBe(currentTop);
				await page.keyboard.down('Home');
				await mark('after-keydown');
				await page.keyboard.up('Home');
				await mark('after-keyup');
			} else {
				await reader.getByRole('button', { name: 'Close rules reference', exact: true }).click();
			}
			await mark('after-dismissal-action');
			await expect(reader).not.toBeVisible();
			await expect(trigger).toBeFocused();
			await expect(page).toHaveURL(currentUrl);
			await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(currentTop);
		} finally {
			const samples = await page.evaluate(() => {
				const diagnostic = (window as ScrollDiagnosticWindow).readerScrollDiagnostic;
				diagnostic.mark('final');
				diagnostic.dispose();
				return diagnostic.samples;
			});
			await testInfo.attach('reader-scroll-diagnostic', {
				body: JSON.stringify({ dismissal, currentTop, currentUrl, samples }, null, 2),
				contentType: 'application/json'
			});
		}
	});
}

test('wide reader keeps page controls above the document and preserves collapsed highlighted results', async ({
	page
}) => {
	test.setTimeout(60_000);
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	const reader = page.getByRole('dialog', { name: 'Rules reference' });
	const navigation = reader.getByRole('complementary', { name: 'PDF navigation details' });
	const toolbar = reader.getByRole('toolbar', { name: 'PDF navigation' });
	const document = reader.getByRole('region', { name: /PDF document pages/ });
	await expect(reader.getByLabel('Selectable text for page 1')).not.toBeEmpty();
	await expect(navigation.getByRole('button', { name: 'Next PDF page', exact: true })).toHaveCount(
		0
	);
	const toolbarBounds = (await toolbar.boundingBox())!;
	const documentBounds = (await document.boundingBox())!;
	expect(toolbarBounds.y + toolbarBounds.height).toBeLessThanOrEqual(documentBounds.y);
	await toolbar.getByRole('button', { name: 'Next PDF page', exact: true }).click();
	await expect(reader.getByLabel('PDF page 2, current page')).toBeVisible();
	await reader.getByRole('button', { name: 'Page tools', exact: true }).click();
	await expect(toolbar.getByRole('spinbutton', { name: 'Page', exact: true })).toBeFocused();
	await reader.getByRole('button', { name: 'Collapse document navigation', exact: true }).click();
	await reader.getByRole('button', { name: 'Page tools', exact: true }).click();
	await expect(toolbar.getByRole('spinbutton', { name: 'Page', exact: true })).toBeFocused();
	await expect(
		reader.getByRole('button', { name: 'Expand document navigation', exact: true })
	).toBeVisible();
	await reader.getByRole('button', { name: 'Find', exact: true }).click();
	const query = reader.getByRole('searchbox');
	await query.fill('armor');
	await navigation.getByRole('button', { name: 'Find', exact: true }).click();
	await expect(reader.getByText(/^\d+ matches on \d+ pages\.$/)).toBeVisible({ timeout: 30_000 });
	const results = reader.getByRole('list', { name: 'PDF find results' });
	await expect(results.locator('mark').first()).toHaveText(/armor/i);
	const outlineHeading = reader.locator('summary').filter({ hasText: /^Document outline$/ });
	await outlineHeading.click();
	await reader.getByRole('button', { name: 'Outline', exact: true }).click();
	await expect(outlineHeading).toBeFocused();
	await expect(outlineHeading).toBeInViewport();
	await expect(reader.getByRole('button', { name: /Equipment — page 62/ })).toBeInViewport();
	await expect(results).toBeVisible();
	const disclosure = reader.locator('summary').filter({ hasText: /^Results ·/ });
	await disclosure.click();
	await expect(results).not.toBeVisible();
	await expect(query).toHaveValue('armor');
	await reader.getByRole('button', { name: 'Outline', exact: true }).click();
	await expect(reader.getByRole('button', { name: /Equipment — page 62/ })).toBeVisible();
	await reader
		.getByLabel('Document tools')
		.getByRole('button', { name: 'Find', exact: true })
		.click();
	await disclosure.click();
	await query.fill('shield');
	// Editing an unsubmitted query must not relabel the existing results' matches.
	await expect(results.locator('mark').first()).toHaveText(/armor/i);
	await disclosure.click();
	await navigation.getByRole('button', { name: 'Find', exact: true }).click();
	await expect(reader.getByText(/^\d+ matches on \d+ pages\.$/)).toBeVisible({ timeout: 30_000 });
	await expect(results).toBeVisible();
	await expect(results.locator('mark').first()).toHaveText(/shield/i);
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(results.locator('mark').first()).toHaveText(/shield/i);
	await reader.getByRole('button', { name: 'Page tools', exact: true }).click();
	await expect(reader.getByRole('spinbutton', { name: 'Page', exact: true })).toBeFocused();
});

test('reader preserves an unsaved piecewise note and fits its existing dialog', async ({
	page
}) => {
	test.setTimeout(30_000);
	await page.getByRole('button', { name: 'Add notes for Current HP' }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Add note for Current HP', exact: true }).click();
	const text = dialog.getByText('Text (optional)').locator('..').getByRole('textbox');
	await text.fill('Unsaved phone-reader proof');
	await dialog.getByLabel('SRD 5.1 (local PDF)').click();
	await dialog.getByText('Page (optional)').locator('..').getByRole('spinbutton').fill('8');
	await dialog.getByRole('button', { name: '(view in app)' }).click();
	await expect(page.getByRole('dialog').filter({ visible: true })).toHaveCount(1);
	await expect(dialog.getByLabel('Selectable text for page 8')).not.toBeEmpty();
	await dialog.getByRole('button', { name: 'Find', exact: true }).click();
	await expect(dialog.getByRole('searchbox')).toBeFocused();
	const inputBounds = await dialog.getByRole('searchbox').boundingBox();
	expect(inputBounds!.y + inputBounds!.height).toBeLessThan(844);
	await dialog.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(text).toHaveValue('Unsaved phone-reader proof');
});

test('reader responds to available width without losing its page or hiding focused tools', async ({
	page
}) => {
	test.setTimeout(30_000);
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.getByRole('button', { name: 'References: equipment' }).click();
	const reader = page.getByRole('dialog', { name: 'Rules reference' });
	await expect(reader.getByLabel('PDF page 62, current page')).toBeVisible();
	const resize = reader.getByRole('separator', { name: 'Resize document navigation' });
	await expect(resize).toBeVisible();
	await reader.getByRole('searchbox').focus();
	await page.setViewportSize({ width: 650, height: 844 });
	await expect(resize).not.toBeVisible();
	await expect(reader.getByRole('button', { name: 'Find', exact: true })).toBeFocused();
	await expect(reader.getByLabel('PDF page 62, current page')).toBeVisible();
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(reader.getByLabel('PDF page 62, current page')).toBeVisible();
	await reader.getByRole('button', { name: 'Page tools', exact: true }).click();
	await reader.getByRole('spinbutton', { name: 'Page', exact: true }).fill('100');
	await reader.getByRole('button', { name: 'Go', exact: true }).click();
	await expect(reader.getByLabel('PDF page 100, current page')).toBeVisible();
	await reader.getByRole('button', { name: 'Close rules reference' }).click();
	await expect(reader).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'References: equipment' })).toBeFocused();
});
