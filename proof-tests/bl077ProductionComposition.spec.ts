import { expect, test } from '@playwright/test';

test('keeps a rejected focused primitive save open with its draft', async ({ page }) => {
	await page.goto(
		'/iframe.html?id=organisms-dnd5e2014abilitiesandproficiencies--rejected-focused-save&viewMode=story'
	);

	const detail = page.getByRole('button', { name: 'View Prof. Bonus details' });
	await expect(detail).toHaveCount(1);
	await detail.click();
	const dialog = page.getByRole('dialog', { name: 'Prof. Bonus' });
	await dialog.getByRole('button', { name: 'Edit', exact: true }).click();
	const input = dialog.getByRole('spinbutton', { name: 'Authored prof. bonus' });
	await input.fill('4');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();

	await expect(dialog).toBeVisible();
	await expect(input).toHaveValue('4');
	await expect(dialog.getByRole('alert')).toHaveText(
		'Could not save these changes. Review the edited values and try again.'
	);
});

test('keeps a rejected dense-record removal open and retains the row', async ({ page }) => {
	await page.goto(
		'/iframe.html?id=organisms-dnd5e2014densecollectioncard--rejected-record-removal&viewMode=story'
	);

	await page.getByRole('button', { name: /^View Dagger.*details$/ }).click();
	const dialog = page.getByRole('dialog', { name: 'Dagger' });
	await dialog.getByRole('button', { name: 'Remove item' }).click();
	await dialog.getByRole('button', { name: 'Confirm remove' }).click();

	await expect(dialog).toBeVisible();
	await expect(
		dialog.getByRole('alert').filter({ hasText: 'The record could not be removed.' })
	).toHaveText('The record could not be removed. Review it and try again.');
	await expect(page.getByRole('listitem').filter({ hasText: 'Dagger' })).toBeVisible();
});
