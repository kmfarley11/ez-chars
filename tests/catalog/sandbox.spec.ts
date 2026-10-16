import { expect, test } from '@playwright/test';

test('read-first sandbox shows values and supports independent editing', async ({ page }) => {
	await page.goto(
		'/iframe.html?id=design-system-organisms-read-first-detail--independent-edits&viewMode=story'
	);
	await expect(page.getByText('Travel pack', { exact: true }).first()).toBeVisible();
	// A host-background mismatch can leave DOM-visible text visually unreadable.
	// The app surface must own its foreground even with a dark browser preference.
	await expect(page.getByText('Travel pack', { exact: true }).first()).toHaveCSS(
		'color',
		'rgb(15, 23, 42)'
	);
	await expect(page.getByRole('checkbox', { name: 'Reject example saves' })).toBeVisible();
	await page.getByRole('button', { name: 'View Name', exact: true }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Edit Name', exact: true }).click();
	await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Trail supplies');
	await page.getByRole('button', { name: 'Save Name', exact: true }).click();
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page.getByText('Trail supplies', { exact: true }).first()).toBeVisible();
	await expect(page.getByText('(km; optional context)', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'View Ready', exact: true }).click();
	await page.getByRole('button', { name: 'Edit Ready', exact: true }).click();
	await page.getByRole('dialog').getByRole('checkbox', { name: 'Ready', exact: true }).uncheck();
	await page.getByRole('button', { name: 'Save Ready', exact: true }).click();
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(
		page.getByRole('checkbox', { name: 'Ready: disabled', exact: true })
	).not.toBeChecked();
	await page.getByRole('button', { name: 'View Quantity', exact: true }).click();
	await page.getByRole('button', { name: 'Edit Quantity', exact: true }).click();
	await page.getByRole('spinbutton', { name: 'Quantity', exact: true }).fill('4');
	await page.getByRole('button', { name: 'Save Quantity', exact: true }).click();
	await page.getByRole('button', { name: 'Edit Capacity', exact: true }).click();
	await expect(page.getByRole('spinbutton', { name: 'Capacity', exact: true })).toHaveValue('8');
	await page.getByRole('button', { name: 'Cancel Capacity edit', exact: true }).click();
	await page.getByRole('button', { name: 'Edit Quantity', exact: true }).click();
	await expect(page.getByRole('spinbutton', { name: 'Quantity', exact: true })).toHaveValue('4');
});

test('canonical sandbox supports runtime save and reset', async ({ page }) => {
	await page.goto('/iframe.html?id=systems-d-d-2014-character-sheet--saturated&viewMode=story');
	await expect(page.getByRole('heading', { name: 'Weapons', exact: true })).toHaveCSS(
		'color',
		'rgb(15, 23, 42)'
	);
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	const input = page.getByRole('spinbutton', { name: 'Current HP', exact: true });
	await expect(input).toBeVisible();
	const initial = await input.inputValue();
	await input.fill('17');
	await page.getByRole('button', { name: 'Confirm Current HP', exact: true }).click();
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await expect(input).toHaveValue('17');
	await page.getByRole('button', { name: 'Cancel editing Current HP', exact: true }).click();
	await page.getByRole('button', { name: 'Reset example', exact: true }).click();
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await expect(input).toHaveValue(initial);
});

test('canonical reset closes the reader without navigating or changing stored characters', async ({
	page
}) => {
	const storageKey = 'ez-chars.characters.v1';
	const sentinel = 'untouched application character data';
	await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
		key: storageKey,
		value: sentinel
	});
	await page.goto('/iframe.html?id=systems-d-d-2014-character-sheet--saturated&viewMode=story');
	const originalUrl = page.url();
	const originalHistoryLength = await page.evaluate(() => history.length);
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await page.getByRole('spinbutton', { name: 'Current HP', exact: true }).fill('17');
	await page.getByRole('button', { name: 'Confirm Current HP', exact: true }).click();
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	const reader = page.getByRole('dialog', { name: 'Rules reference', exact: true });
	await expect(reader).toBeVisible();
	await page.getByRole('checkbox', { name: 'Reject character saves' }).check();
	await page.getByRole('button', { name: 'Reset example', exact: true }).click();
	await expect(reader).toBeHidden();
	await expect(page.getByRole('checkbox', { name: 'Reject character saves' })).not.toBeChecked();
	// Reopening proves the replacement instance still owns working reader controls.
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	await expect(reader).toBeVisible();
	await reader.getByRole('button', { name: 'Close rules reference', exact: true }).click();
	await expect(reader).toBeHidden();
	await expect(page).toHaveURL(originalUrl);
	expect(await page.evaluate(() => history.length)).toBe(originalHistoryLength);
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(sentinel);
});
