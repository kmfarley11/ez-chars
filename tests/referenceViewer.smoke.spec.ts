import { expect, test, type Page } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import { e2eCharacter, e2eStoredCharacters } from './fixtures/characters';

const storageKey = 'ez-chars.characters.v1';

// Each case loads the adopted 403-page artifact. Keep this file serial per browser project so the
// full cross-browser gate does not create several parser/worker pairs in one process at once.
test.describe.configure({ mode: 'serial' });

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

const openCharacter = async (page: Page) => {
	await page.goto('/');
	await page.getByRole('button', { name: `Open ${e2eCharacter.identity.name}` }).click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-character/);
};

test('opens a contextual SRD locator at the exact page and converges Close and browser Back', async ({
	page,
	context
}) => {
	test.setTimeout(30_000);
	await openCharacter(page);
	const initialUrl = page.url();
	const trigger = page.getByRole('button', { name: 'References: classes' });
	await trigger.click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	await expect(reference).toBeVisible();
	await expect(page).toHaveURL(initialUrl);
	const expandNavigation = reference.getByRole('button', {
		name: 'Expand document navigation'
	});
	if (await expandNavigation.isVisible()) await expandNavigation.click();
	const documentRegion = reference.getByRole('region', { name: /PDF document pages/ });
	const currentPage = reference.getByLabel('PDF page 8, current page');
	await expect(currentPage).toBeVisible();
	const documentBox = await documentRegion.boundingBox();
	const currentPageBox = await currentPage.boundingBox();
	expect(documentBox).not.toBeNull();
	expect(currentPageBox).not.toBeNull();
	expect(currentPageBox!.y).toBeGreaterThanOrEqual(documentBox!.y);
	expect(currentPageBox!.y - documentBox!.y).toBeLessThanOrEqual(48);
	const curatedSection = reference.getByRole('button', { name: /Equipment — page 62/ });
	await expect(curatedSection).toBeVisible();
	expect(await curatedSection.evaluate((element) => getComputedStyle(element).cursor)).toBe(
		'pointer'
	);
	await expect(reference.getByRole('link', { name: 'Open in browser' })).toHaveAttribute(
		'href',
		/#page=8$/
	);
	expect(context.pages()).toHaveLength(1);

	await reference.getByRole('button', { name: 'Close rules reference' }).click();
	await expect(reference).not.toBeVisible();
	await expect(trigger).toBeFocused();

	await trigger.click();
	await expect(reference).toBeVisible();
	await page.goBack();
	await expect(reference).not.toBeVisible();
	await expect(trigger).toBeFocused();
});

test('scrolls progressively through the full PDF while mounting only nearby pages', async ({
	page
}) => {
	test.setTimeout(30_000);
	await openCharacter(page);
	await page.getByRole('button', { name: 'References: classes' }).click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	const documentRegion = reference.getByRole('region', { name: /PDF document pages/ });
	await expect(reference.getByLabel('PDF page 8, current page')).toBeVisible();

	const scrollBounds = await documentRegion.evaluate((element) => ({
		clientHeight: element.clientHeight,
		scrollHeight: element.scrollHeight
	}));
	expect(scrollBounds.scrollHeight).toBeGreaterThan(scrollBounds.clientHeight * 100);
	expect(await reference.getByLabel(/^PDF page \d/).count()).toBeLessThanOrEqual(3);

	await documentRegion.evaluate((element) => {
		element.scrollTop = element.scrollHeight;
	});
	await expect(reference.getByLabel('PDF page 403, current page')).toBeVisible();
	await expect(reference.getByRole('spinbutton')).toHaveValue('403');
	expect(await reference.getByLabel(/^PDF page \d/).count()).toBeLessThanOrEqual(3);

	await documentRegion.evaluate((element) => {
		element.scrollTop = 0;
	});
	await expect(reference.getByLabel('PDF page 1, current page')).toBeVisible();
	await expect(reference.getByRole('spinbutton')).toHaveValue('1');
});

test('keeps general Rules reachable while scrolled and exposes bounded resource discovery', async ({
	page,
	context
}) => {
	test.setTimeout(30_000);
	await openCharacter(page);
	const storedBefore = await page.evaluate((key) => localStorage.getItem(key), storageKey);
	await page.getByRole('button', { name: 'Organizational', exact: true }).scrollIntoViewIfNeeded();

	const rulesTrigger = page.getByRole('button', { name: 'Rules', exact: true });
	await expect(rulesTrigger).toBeVisible();
	const rulesShortcut = page.getByRole('complementary', { name: 'Rules shortcut' });
	expect(
		await rulesShortcut.evaluate((element) => ({
			contain: getComputedStyle(element).contain,
			transform: getComputedStyle(element).transform
		}))
	).toEqual({ contain: 'none', transform: 'none' });
	const triggerBox = await rulesTrigger.boundingBox();
	const viewport = page.viewportSize();
	expect(triggerBox).not.toBeNull();
	expect(viewport).not.toBeNull();
	expect(triggerBox!.y).toBeGreaterThanOrEqual(0);
	expect(triggerBox!.y + triggerBox!.height).toBeLessThanOrEqual(viewport!.height);

	await rulesTrigger.click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	await expect(reference.getByLabel('PDF page 1, current page')).toBeVisible();
	await reference.getByRole('button', { name: 'Browse resources' }).click();
	const search = reference.getByRole('searchbox', { name: 'Search rules resources' });
	await expect(search).toBeFocused();
	await search.fill('equipment');
	await expect(reference.getByText('1 of 4 topics')).toBeVisible();
	const equipmentResult = reference.getByRole('listitem').filter({ hasText: 'Equipment' }).first();
	await expect(equipmentResult.getByRole('button', { name: 'Open', exact: true })).toBeVisible();
	await equipmentResult.getByText('Other sources (1)').click();
	const external = equipmentResult.getByRole('link', { name: 'Open at publisher (external)' });
	await expect(external).toHaveAttribute('target', '_blank');
	await expect(external).toHaveAttribute('href', /dndbeyond\.com/);
	await equipmentResult.getByText('Source details').first().click();
	await expect(equipmentResult.getByText('Wizards of the Coast LLC').first()).toBeVisible();

	await search.fill('unregistered-example-query');
	await expect(reference.getByText(/No rules resources match/)).toBeVisible();
	await reference.getByRole('button', { name: 'Clear', exact: true }).click();
	await expect(reference.getByText('4 topics')).toBeVisible();
	expect(context.pages()).toHaveLength(1);

	await reference.getByRole('button', { name: 'Close rules reference' }).click();
	await expect(rulesTrigger).toBeFocused();
	const storedAfter = await page.evaluate((key) => localStorage.getItem(key), storageKey);
	expect(storedBefore).not.toBeNull();
	expect(storedAfter).not.toBeNull();
	expect(JSON.parse(storedAfter!)).toEqual(JSON.parse(storedBefore!));
});

test('keeps compact contextual actions in their section headers and routes their locators', async ({
	page,
	context
}) => {
	test.setTimeout(45_000);
	await openCharacter(page);
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	for (const [name, panelHeading, pageNumber] of [
		['References: classes', 'Meta / Top-level Info', 8],
		['References: spells', 'Spells', 100],
		['References: equipment', 'Inventory / Equipment', 62]
	] as const) {
		if (name === 'References: spells') {
			const expandSpells = page.getByRole('button', { name: 'Expand Spells' });
			if ((await expandSpells.count()) > 0) await expandSpells.click();
		}
		const trigger = page.getByRole('button', { name });
		const panelToggle = page.getByRole('button', { name: `Collapse ${panelHeading}` });
		await trigger.scrollIntoViewIfNeeded();
		await expect(trigger).toHaveText('');
		const triggerBox = await trigger.boundingBox();
		const panelToggleBox = await panelToggle.boundingBox();
		expect(triggerBox).not.toBeNull();
		expect(panelToggleBox).not.toBeNull();
		expect(
			Math.abs(
				triggerBox!.y + triggerBox!.height / 2 - (panelToggleBox!.y + panelToggleBox!.height / 2)
			)
		).toBeLessThanOrEqual(2);
		await trigger.click();
		await expect(reference.getByLabel(`PDF page ${pageNumber}, current page`)).toBeVisible();
		await reference.getByRole('button', { name: 'Close rules reference' }).click();
		await expect(trigger).toBeFocused();
	}
	expect(context.pages()).toHaveLength(1);
});

test('finds text inside only the open PDF and navigates to the matching page', async ({ page }) => {
	test.setTimeout(30_000);
	await openCharacter(page);
	await page.getByRole('button', { name: 'References: classes' }).click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	const expandNavigation = reference.getByRole('button', {
		name: 'Expand document navigation'
	});
	if (await expandNavigation.isVisible()) await expandNavigation.click();
	await reference.getByRole('searchbox').fill('Barbarian');
	await reference.getByRole('button', { name: 'Find', exact: true }).click();
	const firstResult = reference.getByRole('button', { name: /^Page \d+ \(/ }).first();
	await expect(firstResult).toBeVisible({ timeout: 20_000 });
	await expect(reference.getByText(/Found \d+ matches? so far/)).toBeVisible();
	await firstResult.click();
	await expect(reference.getByLabel(/PDF page \d+, current page/)).toBeVisible();
});

test('resizes both desktop pane allocations and progressively exposes the native outline', async ({
	page
}, testInfo) => {
	test.skip(
		testInfo.project.name === 'Mobile Chrome',
		'Horizontal pane dividers are desktop-only.'
	);
	test.setTimeout(30_000);
	await openCharacter(page);
	await page.getByRole('button', { name: 'References: classes' }).click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });

	const referenceDivider = reference.getByRole('separator', {
		name: 'Resize or close rules reference'
	});
	const initialReferenceWidth = Number(await referenceDivider.getAttribute('aria-valuenow'));
	await referenceDivider.focus();
	await referenceDivider.press('ArrowRight');
	await expect(referenceDivider).toHaveAttribute(
		'aria-valuenow',
		String(initialReferenceWidth - 24)
	);

	const navigationDivider = reference.getByRole('separator', {
		name: 'Resize document navigation'
	});
	const initialNavigationWidth = Number(await navigationDivider.getAttribute('aria-valuenow'));
	await navigationDivider.focus();
	await navigationDivider.press('ArrowRight');
	await expect(navigationDivider).toHaveAttribute(
		'aria-valuenow',
		String(initialNavigationWidth + 24)
	);

	const navigationPane = reference.getByLabel('PDF navigation details');
	const documentRegion = reference.getByRole('region', { name: /PDF document pages/ });
	const expandedNavigationBox = await navigationPane.boundingBox();
	const constrainedDocumentBox = await documentRegion.boundingBox();
	const expandedDividerBox = await navigationDivider.boundingBox();
	expect(expandedDividerBox).not.toBeNull();
	await page.mouse.move(
		expandedDividerBox!.x + expandedDividerBox!.width / 2,
		expandedDividerBox!.y + expandedDividerBox!.height / 2
	);
	await page.mouse.down();
	await page.mouse.move(expandedDividerBox!.x - 240, expandedDividerBox!.y + 24);
	await page.mouse.up();
	await expect(reference.getByRole('button', { name: 'Expand document navigation' })).toBeVisible();
	await expect(navigationDivider).toHaveAttribute('aria-valuetext', 'Minimized');
	const collapsedNavigationBox = await navigationPane.boundingBox();
	const expandedDocumentBox = await documentRegion.boundingBox();
	expect(collapsedNavigationBox?.width).toBeLessThanOrEqual(60);
	expect(expandedDocumentBox!.width).toBeGreaterThan(constrainedDocumentBox!.width);
	expect(collapsedNavigationBox!.width).toBeLessThan(expandedNavigationBox!.width);

	const collapsedDividerBox = await navigationDivider.boundingBox();
	expect(collapsedDividerBox).not.toBeNull();
	await page.mouse.move(
		collapsedDividerBox!.x + collapsedDividerBox!.width / 2,
		collapsedDividerBox!.y + collapsedDividerBox!.height / 2
	);
	await page.mouse.down();
	await page.mouse.move(collapsedDividerBox!.x + 48, collapsedDividerBox!.y + 24);
	await page.mouse.up();
	await expect(
		reference.getByRole('button', { name: 'Collapse document navigation' })
	).toBeVisible();
	await expect(navigationDivider).not.toHaveAttribute('aria-valuetext', 'Minimized');

	await reference.getByRole('button', { name: 'Collapse document navigation' }).click();
	await expect(reference.getByRole('button', { name: 'Expand document navigation' })).toBeVisible();
	await reference.getByRole('button', { name: 'Expand document navigation' }).click();
	await expect(
		reference.getByRole('button', { name: 'Collapse document navigation' })
	).toBeVisible();

	const pdfOutline = reference.getByText('PDF outline', { exact: true }).locator('..');
	await expect(pdfOutline).not.toHaveAttribute('open', '');
	await pdfOutline.locator('summary').click();
	await expect(pdfOutline).toHaveAttribute('open', '');
	await expect(pdfOutline.getByText('SRD-CC_V1.1 preamble.pdf')).toBeVisible();
	const pdfOutlineAction = pdfOutline.getByRole('button').first();
	await expect(pdfOutlineAction).toBeVisible();
	expect(await pdfOutlineAction.evaluate((element) => getComputedStyle(element).cursor)).toBe(
		'pointer'
	);

	const referenceDividerBox = await referenceDivider.boundingBox();
	const viewport = page.viewportSize();
	expect(referenceDividerBox).not.toBeNull();
	expect(viewport).not.toBeNull();
	await page.mouse.move(
		referenceDividerBox!.x + referenceDividerBox!.width / 2,
		referenceDividerBox!.y + referenceDividerBox!.height / 2
	);
	await page.mouse.down();
	await page.mouse.move(viewport!.width - 1, referenceDividerBox!.y + 24);
	await page.mouse.up();
	await expect(reference).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'References: classes' })).toBeFocused();
});

test('shows a browser fallback when viewer initialization fails', async ({ page }) => {
	await page.route('**/*.pdf', (route) =>
		route.fulfill({ status: 200, contentType: 'application/pdf', body: 'not a valid PDF' })
	);
	await openCharacter(page);
	await page.getByRole('button', { name: 'References: classes' }).click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	await expect(
		reference.getByText('The in-app viewer could not open this document.')
	).toBeVisible();
	await expect(reference.getByRole('button', { name: 'Retry' })).toBeVisible();
	await expect(reference.getByRole('link', { name: 'Open in browser instead' })).toHaveAttribute(
		'href',
		/#page=8$/
	);

	await page.unroute('**/*.pdf');
	await reference.getByRole('button', { name: 'Retry' }).click();
	await expect(reference.getByLabel('PDF page 8, current page')).toBeVisible();
});

test('preserves an unsaved annotation draft while the reference is a dialog step', async ({
	page
}) => {
	test.setTimeout(30_000);
	await openCharacter(page);
	await page.getByRole('button', { name: 'Add annotations for Current HP' }).click();
	let dialog = page.getByRole('dialog', { name: 'Current HP Annotations' });
	await dialog.getByRole('button', { name: 'Add', exact: true }).click();
	await dialog.getByText('Annotations (0)').click();
	await dialog.getByRole('button', { name: 'Add', exact: true }).click();
	const draftText = 'Unsaved draft survives reference navigation.';
	await dialog.getByText('Text (optional)').locator('..').getByRole('textbox').fill(draftText);
	await dialog.getByLabel('SRD 5.1 (local PDF)').click();
	await dialog.getByText('Page (optional)').locator('..').getByRole('spinbutton').fill('8');
	await dialog.getByRole('button', { name: '(view in app)' }).click();
	dialog = page.getByRole('dialog', { name: 'Page 8' });
	await expect(dialog.getByLabel('PDF page 8, current page')).toBeVisible();
	await dialog.getByRole('button', { name: 'Back' }).click();
	dialog = page.getByRole('dialog', { name: 'Current HP Annotations' });
	await expect(dialog.getByText('Text (optional)').locator('..').getByRole('textbox')).toHaveValue(
		draftText
	);

	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(dialog.getByText(draftText)).toBeVisible();
	await dialog.getByRole('button', { name: /Open .* in app/ }).click();
	dialog = page.getByRole('dialog', { name: 'Page 8' });
	await expect(dialog.getByLabel('PDF page 8, current page')).toBeVisible();
	await dialog.getByRole('button', { name: 'Back' }).click();
	await expect(
		page.getByRole('dialog', { name: 'Current HP Annotations' }).getByText(draftText)
	).toBeVisible();
});

test('uses a full-screen surface on phone and keeps primary controls touch-sized', async ({
	page
}, testInfo) => {
	test.skip(
		testInfo.project.name !== 'Mobile Chrome',
		'Phone bounds use the coarse-pointer project.'
	);
	test.setTimeout(30_000);
	await openCharacter(page);
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	const expandNavigation = reference.getByRole('button', {
		name: 'Expand document navigation'
	});
	await expect(expandNavigation).toBeVisible();
	await expect(expandNavigation).toContainText('Outline & find');
	await expect(reference.getByText('Document outline', { exact: true })).not.toBeVisible();
	const box = await reference.boundingBox();
	const viewport = page.viewportSize();
	expect(box).not.toBeNull();
	expect(viewport).not.toBeNull();
	expect(box!.x).toBeLessThanOrEqual(1);
	expect(box!.y).toBeLessThanOrEqual(1);
	expect(Math.abs(box!.width - viewport!.width)).toBeLessThanOrEqual(1);
	expect(Math.abs(box!.height - viewport!.height)).toBeLessThanOrEqual(1);

	for (const control of [
		reference.getByRole('button', { name: 'Close rules reference' }),
		reference.getByRole('button', { name: 'Previous PDF page' }),
		reference.getByRole('button', { name: 'Next PDF page' }),
		expandNavigation
	]) {
		const controlBox = await control.boundingBox();
		expect(controlBox?.width).toBeGreaterThanOrEqual(44);
		expect(controlBox?.height).toBeGreaterThanOrEqual(44);
	}

	await expandNavigation.click();
	const collapseNavigation = reference.getByRole('button', {
		name: 'Collapse document navigation'
	});
	await expect(collapseNavigation).toBeVisible();
	await expect(collapseNavigation).toContainText('Outline & find');
	const collapseBox = await collapseNavigation.boundingBox();
	expect(collapseBox?.width).toBeGreaterThanOrEqual(44);
	expect(collapseBox?.height).toBeGreaterThanOrEqual(44);

	const navigationBox = await reference.getByLabel('PDF navigation details').boundingBox();
	const documentBox = await reference
		.getByRole('region', { name: /PDF document pages/ })
		.boundingBox();
	expect(navigationBox?.height).toBeGreaterThanOrEqual(180);
	expect(documentBox?.height).toBeGreaterThanOrEqual(180);

	await collapseNavigation.click();
	await expect(expandNavigation).toBeVisible();
	await expect(reference.getByText('Document outline', { exact: true })).not.toBeVisible();
});
