import { test, expect } from '@playwright/test';

test('serves adopted SRDs locally without exposing local-only sources', async ({ page }) => {
	await page.goto('/');

	const srdLink = page.getByRole('link', { name: 'View SRD 5.1' });
	await expect(srdLink).toHaveAttribute('href', '/ez-chars/docs/ext/5e2014/SRD_CC_v5.1.pdf');

	for (const path of [
		'/ez-chars/docs/ext/5e2014/SRD_CC_v5.1.pdf',
		'/ez-chars/docs/ext/5e2024/SRD_CC_v5.2.1.pdf'
	]) {
		const response = await page.request.get(path);
		expect(response.ok()).toBe(true);
		expect(response.headers()['content-type']).toBe('application/pdf');
		expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
	}

	const localOnlyResponse = await page.request.get(
		'/ez-chars/docs/ext/local-only/Shadowdark_Player_Quickstart_-_Digital.pdf'
	);
	expect(localOnlyResponse.headers()['content-type']).not.toBe('application/pdf');
	expect((await localOnlyResponse.body()).subarray(0, 4).toString()).not.toBe('%PDF');
});

test('links third-party notices to the deployed Git revision', async ({ page }, testInfo) => {
	test.skip(
		testInfo.project.name === 'Mobile Chrome',
		'The notices link currently belongs to the desktop About dialog.'
	);
	await page.goto('/');

	await page.getByRole('button', { name: 'About ez-chars' }).click();
	await expect(page.getByRole('link', { name: 'THIRD_PARTY_NOTICES.md' })).toHaveAttribute(
		'href',
		/^https:\/\/github\.com\/kmfarley11\/ez-chars\/blob\/[0-9a-f]{7,40}\/THIRD_PARTY_NOTICES\.md$/
	);
});

test('native popover escape dismissal and focus restoration', async ({ page }) => {
	await page.goto('/');

	const createButton = page.getByRole('button', { name: 'Create Character' });
	await expect(createButton).toHaveAttribute('aria-expanded', 'false');

	await createButton.click();
	await expect(createButton).toHaveAttribute('aria-expanded', 'true');

	// Wait for the popover to actually render its contents visually.
	const firstMenuItem = page.getByRole('button', { name: 'Create New 2014 5e Character' });
	await expect(firstMenuItem).toBeVisible();

	// Programmatically focus the item to avoid Safari's platform-dependent Tab preference,
	// ensuring the cross-browser test remains focused on native Escape dismissal and trigger-focus restoration.
	await firstMenuItem.focus();
	await expect(firstMenuItem).toBeFocused();

	// Press Escape to natively dismiss the popover.
	await page.keyboard.press('Escape');

	// Verify the popover closed and focus returned to the trigger button.
	await expect(createButton).toHaveAttribute('aria-expanded', 'false');
	await expect(createButton).toBeFocused();
});
