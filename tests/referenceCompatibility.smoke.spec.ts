import { expect, test } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import { e2eStoredCharacters } from './fixtures/characters';

// Targeted capability removal, not an emulation or certification of any iOS release.
test('reads and searches the SRD without ReadableStream async iteration', async ({ page }) => {
	test.setTimeout(60_000);
	installBrowserErrorGuard(page);
	await page.addInitScript((characters) => {
		localStorage.setItem('ez-chars.characters.v1', JSON.stringify(characters));
		Object.defineProperty(ReadableStream.prototype, Symbol.asyncIterator, {
			configurable: true,
			value: undefined
		});
	}, e2eStoredCharacters);
	await page.goto('/ez-chars/charsheets/5e?id=e2e-character');
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	await expect(reference.getByLabel('Selectable text for page 1')).toContainText(
		'System Reference',
		{
			timeout: 15_000
		}
	);
	await expect(reference.getByRole('alert')).toHaveCount(0);
	await reference.getByRole('button', { name: 'Find', exact: true }).first().click();
	await reference.getByRole('searchbox').fill('armor');
	await reference.getByRole('button', { name: 'Find', exact: true }).last().click();
	await expect(reference.getByText(/^\d+ matches on \d+ pages\.$/)).toBeVisible({
		timeout: 30_000
	});
	const result = reference.getByRole('button', { name: /^Page \d+ \(/ }).first();
	await expect(result).toBeVisible();
	await result.click();
	await expect(reference.getByLabel(/PDF page \d+, current page/)).toBeVisible();
	expectNoBrowserErrors(page);
});
