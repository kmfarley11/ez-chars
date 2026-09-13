import { expect, test, type Page } from '@playwright/test';
import { saturatedCharacter5e2014 } from '../src/fixtures/saturatedCharacter.5e2014';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import { e2eCharacter, e2eStoredCharacters } from './fixtures/characters';

const storageKey = 'ez-chars.characters.v1';
const mobileViabilityStoredCharacters = {
	...e2eStoredCharacters,
	characters: [...e2eStoredCharacters.characters, saturatedCharacter5e2014]
};

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(
		({ key, value }) => {
			if (localStorage.getItem(key) === null) {
				localStorage.setItem(key, JSON.stringify(value));
			}
		},
		{
			key: storageKey,
			value: mobileViabilityStoredCharacters
		}
	);
});

test.afterEach(({ page }) => {
	expectNoBrowserErrors(page);
});

async function openSeededCharacter(page: Page) {
	await page.goto('/');
	const openButton = page
		.getByRole('button', { name: `Open ${e2eCharacter.identity.name}` })
		.first();
	await expect(openButton).toBeVisible();
	await openButton.click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-character/);
	await expect(page.getByText('Current HP:', { exact: false })).toBeVisible();
}

async function openSaturatedCharacter(page: Page) {
	await page.goto('/');
	const openButton = page
		.getByRole('button', { name: `Open ${saturatedCharacter5e2014.identity.name}` })
		.first();
	await expect(openButton).toBeVisible();
	await openButton.click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=char-5e-2014-saturated/);
}

test.describe('Responsive character list', () => {
	test('renders semantic table on desktop and card list on mobile', async ({ page }, testInfo) => {
		const isMobileProject = testInfo.project.name === 'Mobile Chrome';

		if (isMobileProject) {
			await page.goto('/');
			const cardList = page.getByRole('list', { name: 'Characters list' });
			await expect(cardList).toBeVisible();
			const desktopTable = page.getByRole('table', { name: 'Characters' });
			await expect(desktopTable).toBeHidden();

			const card = cardList.getByRole('article', {
				name: `Character card for ${e2eCharacter.identity.name}`
			});
			await expect(card).toBeVisible();
			await expect(card.getByText(e2eCharacter.identity.name)).toBeVisible();
			await expect(card.getByText('D&D 5e (2014)')).toBeVisible();

			// Test primary action navigates to sheet
			const openButton = card.getByRole('button', {
				name: `Open ${e2eCharacter.identity.name}`
			});
			await openButton.click();
			await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-character/);
		} else {
			// Desktop viewport (>= 768px)
			await page.setViewportSize({ width: 1024, height: 768 });
			await page.goto('/');

			const desktopTable = page.getByRole('table', { name: 'Characters' });
			await expect(desktopTable).toBeVisible();
			const cardList = page.getByRole('list', { name: 'Characters list' });
			await expect(cardList).toBeHidden();

			// Column headers check
			await expect(desktopTable.getByRole('columnheader', { name: 'Identity' })).toBeVisible();
			await expect(desktopTable.getByRole('columnheader', { name: 'System' })).toBeVisible();
			await expect(desktopTable.getByRole('columnheader', { name: 'Classes' })).toBeVisible();
			await expect(desktopTable.getByRole('columnheader', { name: 'Updated' })).toBeVisible();
			await expect(desktopTable.getByRole('columnheader', { name: 'Actions' })).toBeVisible();

			// Resize to mobile viewport (< 768px)
			await page.setViewportSize({ width: 375, height: 667 });
			await expect(desktopTable).toBeHidden();
			await expect(cardList).toBeVisible();

			const card = cardList.getByRole('article', {
				name: `Character card for ${e2eCharacter.identity.name}`
			});
			await expect(card).toBeVisible();

			// Test delete confirmation dialog and focus restoration on mobile card
			const deleteButton = card.getByRole('button', {
				name: `Delete ${e2eCharacter.identity.name}`
			});
			await deleteButton.click();

			const deleteDialog = page.getByRole('dialog', { name: 'Delete character' });
			await expect(deleteDialog).toBeVisible();
			await deleteDialog.getByRole('button', { name: 'Cancel' }).click();
			await expect(deleteDialog).toBeHidden();
			await expect(deleteButton).toBeFocused();
		}
	});
});

test.describe('Document overflow', () => {
	test('produces zero horizontal document overflow on home and sheet routes', async ({
		page
	}, testInfo) => {
		if (testInfo.project.name !== 'Mobile Chrome') {
			await page.setViewportSize({ width: 375, height: 667 });
		}

		// Check Home route
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Create Character' })).toBeVisible();
		const homeOverflow = await page.evaluate(() => {
			const doc = document.documentElement;
			return {
				scrollWidth: doc.scrollWidth,
				clientWidth: doc.clientWidth,
				hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth
			};
		});
		expect(
			homeOverflow.hasHorizontalOverflow,
			`Home route has horizontal overflow: scrollWidth=${homeOverflow.scrollWidth}, clientWidth=${homeOverflow.clientWidth}`
		).toBe(false);

		// Check 5e sheet route
		await openSeededCharacter(page);

		const sheetOverflow = await page.evaluate(() => {
			const doc = document.documentElement;
			return {
				scrollWidth: doc.scrollWidth,
				clientWidth: doc.clientWidth,
				hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth
			};
		});
		expect(
			sheetOverflow.hasHorizontalOverflow,
			`Sheet route has horizontal overflow: scrollWidth=${sheetOverflow.scrollWidth}, clientWidth=${sheetOverflow.clientWidth}`
		).toBe(false);
	});

	test('contains saturated supporting collections within the mobile sheet viewport', async ({
		page
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await openSaturatedCharacter(page);

		const features = page.getByRole('region', { name: 'Features', exact: true });
		await expect(features).toBeVisible();

		const geometry = await page.evaluate(() => {
			const doc = document.documentElement;
			const featuresRegion = document.querySelector<HTMLElement>('section[aria-label="Features"]');
			if (!featuresRegion) throw new Error('Expected the saturated Features region.');

			return {
				documentScrollWidth: doc.scrollWidth,
				documentClientWidth: doc.clientWidth,
				featuresScrollWidth: featuresRegion.scrollWidth,
				featuresClientWidth: featuresRegion.clientWidth
			};
		});

		expect(
			geometry.documentScrollWidth,
			`Saturated sheet exceeds the mobile viewport: scrollWidth=${geometry.documentScrollWidth}, clientWidth=${geometry.documentClientWidth}`
		).toBeLessThanOrEqual(geometry.documentClientWidth);
		expect(
			geometry.featuresScrollWidth,
			`Features exceeds its containing region: scrollWidth=${geometry.featuresScrollWidth}, clientWidth=${geometry.featuresClientWidth}`
		).toBeLessThanOrEqual(geometry.featuresClientWidth);
	});
});

test.describe('Popover menu and dialog lifecycle', () => {
	test('resets trigger disclosure on dialog open and restores focus on dismissal', async ({
		page
	}) => {
		await openSeededCharacter(page);

		const rowMenuTrigger = page.getByRole('button', { name: 'Card actions' }).first();
		await expect(rowMenuTrigger).toBeVisible();
		await expect(rowMenuTrigger).toHaveAttribute('aria-expanded', 'false');

		// Open popover
		await rowMenuTrigger.click();
		await expect(rowMenuTrigger).toHaveAttribute('aria-expanded', 'true');

		// Click "Edit" command which opens a modal dialog
		const editMenuItem = page.getByRole('button', { name: 'Edit', exact: true });
		await expect(editMenuItem).toBeVisible();
		await editMenuItem.click();

		// Modal dialog opens
		const editDialog = page.getByRole('dialog', { name: 'Edit Fields' });
		await expect(editDialog).toBeVisible();

		// Popover trigger must have closed and reset its disclosure state immediately
		await expect(rowMenuTrigger).toHaveAttribute('aria-expanded', 'false');

		// Dismiss the modal dialog
		const cancelButton = editDialog.getByRole('button', { name: 'Cancel' });
		await cancelButton.click();
		await expect(editDialog).toBeHidden();

		// Focus must return to the closed trigger button
		await expect(rowMenuTrigger).toBeFocused();
		await expect(rowMenuTrigger).toHaveAttribute('aria-expanded', 'false');
	});
});

test.describe('Mobile typography and zoom', () => {
	test('enforces >= 16px mobile typography, permits pinch zoom, and preserves the emulated inline-focus viewport', async ({
		page
	}, testInfo) => {
		// Viewport meta verification
		await page.goto('/');
		const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
		expect(viewportMeta).toContain('width=device-width');
		expect(viewportMeta).not.toMatch(/user-scalable\s*=\s*no/i);
		expect(viewportMeta).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b/i);

		if (testInfo.project.name !== 'Mobile Chrome') {
			await page.setViewportSize({ width: 375, height: 667 });
		}

		await openSeededCharacter(page);

		// 1. Primitive field input (Current HP)
		const editCurrentHp = page.getByRole('button', { name: 'Edit Current HP' });
		await editCurrentHp.scrollIntoViewIfNeeded();
		const viewportBeforeInlineFocus = await page.evaluate(() => ({
			scale: window.visualViewport?.scale ?? 1,
			scrollX: window.scrollX,
			scrollY: window.scrollY
		}));
		await editCurrentHp.click();
		const hpInput = page.getByLabel('Current HP');
		await expect(hpInput).toBeVisible();
		const viewportAfterInlineFocus = await page.evaluate(() => ({
			scale: window.visualViewport?.scale ?? 1,
			scrollX: window.scrollX,
			scrollY: window.scrollY
		}));
		expect(viewportAfterInlineFocus.scale).toBe(viewportBeforeInlineFocus.scale);
		expect(viewportAfterInlineFocus.scrollX).toBe(viewportBeforeInlineFocus.scrollX);
		expect(
			Math.abs(viewportAfterInlineFocus.scrollY - viewportBeforeInlineFocus.scrollY)
		).toBeLessThanOrEqual(1);
		const hpFontSize = await hpInput.evaluate((el) =>
			parseFloat(window.getComputedStyle(el).fontSize)
		);
		expect(
			hpFontSize,
			`Primitive input font size should be >= 16px, got ${hpFontSize}px`
		).toBeGreaterThanOrEqual(16);
		await page.getByRole('button', { name: 'Cancel', exact: true }).click();

		// 2. Add action dialog search input
		await page.getByRole('button', { name: 'Add action' }).click();
		const addActionDialog = page.getByRole('dialog', { name: 'Add action' });
		await expect(addActionDialog).toBeVisible();
		const searchInput = addActionDialog.getByRole('searchbox');
		const searchFontSize = await searchInput.evaluate((el) =>
			parseFloat(window.getComputedStyle(el).fontSize)
		);
		expect(
			searchFontSize,
			`Searchbox input font size should be >= 16px, got ${searchFontSize}px`
		).toBeGreaterThanOrEqual(16);
		await addActionDialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(addActionDialog).toBeHidden();

		// 3. StructuredForm inputs, textareas, selects inside item edit dialog
		const rowMenuTrigger = page.getByRole('button', { name: 'Card actions' }).first();
		await rowMenuTrigger.click();
		await page.getByRole('button', { name: 'Edit', exact: true }).click();
		const editDialog = page.getByRole('dialog', { name: 'Edit Fields' });
		await expect(editDialog).toBeVisible();

		const formControls = editDialog.locator(
			'input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, select'
		);
		const controlCount = await formControls.count();
		expect(controlCount).toBeGreaterThan(0);

		for (let i = 0; i < controlCount; i++) {
			const control = formControls.nth(i);
			const fontSize = await control.evaluate((el) =>
				parseFloat(window.getComputedStyle(el).fontSize)
			);
			const tagName = await control.evaluate((el) => el.tagName.toLowerCase());
			expect(
				fontSize,
				`Control ${tagName} at index ${i} should be >= 16px font-size on mobile, got ${fontSize}px`
			).toBeGreaterThanOrEqual(16);
		}

		await editDialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(editDialog).toBeHidden();
	});
});
