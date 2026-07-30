import { test, expect } from '@playwright/test';

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
