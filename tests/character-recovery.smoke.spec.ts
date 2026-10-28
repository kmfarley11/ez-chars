// Recovery uses a disposable browser collection, never the owner's saved characters.
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';

const storageKey = 'ez-chars.characters.v1';
const original = ' {"version":1,"characters":[{"reviewFixture":"unsupported-original"}]}\n';

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(
		({ key, raw }) => {
			// Seed once: reseeding on reload would conceal the very overwrite this tests.
			if (!sessionStorage.getItem('recovery-fixture-seeded')) {
				localStorage.setItem(key, raw);
				sessionStorage.setItem('recovery-fixture-seeded', 'yes');
			}
		},
		{ key: storageKey, raw: original }
	);
});

test.afterEach(({ page }) => expectNoBrowserErrors(page));

test('recovery protects repeated demo edits and offers exact download, cancel, and explicit reset', async ({
	page
}) => {
	await page.goto('/');
	const notice = page.getByRole('region', { name: 'Character data recovery' });
	await expect(notice).toContainText('changes are temporary');
	await expect(page.getByRole('button', { name: 'Import Characters', exact: true })).toBeDisabled();
	const createButton = page.getByRole('button', { name: 'Create Character', exact: true });
	await expect(createButton).toBeDisabled();
	await expect(
		page.getByText('Character creation is unavailable during data recovery.', { exact: false })
	).toBeVisible();
	const resetButton = notice.getByRole('button', { name: 'Reset stored data', exact: true });
	await resetButton.click();
	const dialog = page.getByRole('dialog', { name: 'Reset stored character data?' });
	await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(dialog).toBeHidden();
	await expect(resetButton).toBeFocused();
	await expect(createButton).toBeDisabled();
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(original);
	await page
		.getByRole('button', { name: 'Open Theren Vael', exact: true })
		.filter({ visible: true })
		.click();
	for (const hp of ['8', '9']) {
		await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
		await page.getByRole('spinbutton', { name: 'Current HP', exact: true }).fill(hp);
		await page.getByRole('button', { name: 'Confirm Current HP', exact: true }).click();
		await expect(page.getByText('Current HP', { exact: true }).locator('..')).toContainText(hp);
		expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(original);
	}
	await page.reload();
	await expect(notice).toBeVisible();
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(original);
	await expect(page.getByText('Current HP', { exact: true }).locator('..')).toContainText('17');

	const pendingDownload = page.waitForEvent('download');
	await notice.getByRole('button', { name: 'Download original data' }).click();
	const download = await pendingDownload;
	expect(download.suggestedFilename()).toBe('ez-chars-rejected-storage.txt');
	const downloadPath = await download.path();
	if (!downloadPath) throw new Error('Recovery download is unavailable');
	expect(await readFile(downloadPath, 'utf8')).toBe(original);
	await expect(notice).toBeVisible();

	await resetButton.click();
	await dialog.getByRole('button', { name: 'Confirm reset', exact: true }).click();
	await expect(dialog).toBeHidden();
	await expect(notice).toHaveCount(0);
	await expect(
		page.getByRole('status').filter({ hasText: 'Character storage reset.' })
	).toBeFocused();
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await page.getByRole('spinbutton', { name: 'Current HP', exact: true }).fill('10');
	await page.getByRole('button', { name: 'Confirm Current HP', exact: true }).click();
	await page.reload();
	await expect(page.getByText('Current HP', { exact: true }).locator('..')).toContainText('10');
	await expect(notice).toHaveCount(0);
	for (const edition of ['2024', '2014']) {
		await page.goto('/');
		await expect(createButton).toBeEnabled();
		await createButton.click();
		await page
			.getByRole('button', { name: `Create New ${edition} 5e Character`, exact: true })
			.click();
		await expect(page.getByRole('main', { name: `${edition} character sheet` })).toBeVisible();
		await expect(page).toHaveURL(edition === '2024' ? /\/5e2024\?id=/ : /\/5e\?id=/);
		await expect(notice).toHaveCount(0);
	}
});

test('failed reset keeps recovery open and original storage downloadable', async ({ page }) => {
	await page.goto('/');
	await page.evaluate((key) => {
		const write = Storage.prototype.setItem;
		Storage.prototype.setItem = function (name, value) {
			if (name === key) throw new DOMException('Test storage quota', 'QuotaExceededError');
			write.call(this, name, value);
		};
	}, storageKey);
	await page.getByRole('button', { name: 'Reset stored data', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Reset stored character data?' });
	await dialog.getByRole('button', { name: 'Confirm reset', exact: true }).click();
	await expect(dialog.getByRole('alert')).toContainText('Reset could not be saved');
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(original);
	await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Download original data' })).toBeEnabled();
	await expect(page.getByRole('button', { name: 'Import Characters', exact: true })).toBeDisabled();
	await expect(page.getByRole('button', { name: 'Create Character', exact: true })).toBeDisabled();
});
