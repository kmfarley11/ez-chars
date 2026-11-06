import { expect, test } from '@playwright/test';
import { e2eCharacter } from './fixtures/characters';
import { sparseCharacter5e2024 } from '../src/fixtures/characters-5e2024';
import { installBrowserErrorGuard, expectNoBrowserErrors } from './browserTestGuards';
import { verifyRuntimeMultilineGeometry } from './runtime-type-geometry';

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(
		(characters) => {
			if (!localStorage.getItem('ez-chars.characters.v1'))
				localStorage.setItem('ez-chars.characters.v1', JSON.stringify({ version: 1, characters }));
		},
		[e2eCharacter, sparseCharacter5e2024]
	);
});
test.afterEach(({ page }) => expectNoBrowserErrors(page));

test('Conditions: content-sized read/edit geometry on narrow and wide sheets', async ({ page }) => {
	await page.goto('/ez-chars/charsheets/5e2024?id=' + sparseCharacter5e2024.meta.id);
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await verifyRuntimeMultilineGeometry(page);
	}
});

for (const item of [
	{ route: '5e', id: e2eCharacter.meta.id, label: 'Inspiration' },
	{ route: '5e2024', id: sparseCharacter5e2024.meta.id, label: 'Heroic Inspiration' }
]) {
	test(`${item.label}: absent state, direct toggle, keyboard and reload`, async ({ page }) => {
		const url = `/ez-chars/charsheets/${item.route}?id=${item.id}`;
		await page.goto(url);
		await expect(page.getByRole('button', { name: 'Edit Current HP', exact: true })).toBeVisible();
		const checkbox = page.getByRole('checkbox', { name: item.label, exact: true });
		await expect(checkbox).toHaveCount(1);
		await expect(checkbox).toHaveAccessibleDescription('Not recorded');
		await page.reload();
		await expect(checkbox).toHaveAccessibleDescription('Not recorded');
		await expect(checkbox).not.toBeChecked();
		await checkbox.check();
		await expect(checkbox).toBeChecked();
		await checkbox.focus();
		await checkbox.press('Space');
		await expect(checkbox).not.toBeChecked();
		await expect(checkbox).toBeFocused();
		await page.reload();
		await expect(checkbox).not.toBeChecked();
		await expect(checkbox).toHaveAccessibleDescription('');
		await checkbox.check();
		await page.reload();
		await expect(checkbox).toBeChecked();
	});

	test(`${item.label}: notes preserve the flag through reload`, async ({ page }) => {
		const url = `/ez-chars/charsheets/${item.route}?id=${item.id}`;
		await page.goto(url);
		const checkbox = page.getByRole('checkbox', { name: item.label, exact: true });
		await checkbox.check();
		await page.getByRole('button', { name: `Add notes for ${item.label}`, exact: true }).click();
		const dialog = page.getByRole('dialog').filter({ visible: true });
		await expect(dialog).toBeVisible();
		await dialog.getByRole('button', { name: `Add note for ${item.label}`, exact: true }).click();
		await dialog
			.getByRole('textbox', { name: 'Text (optional)', exact: true })
			.fill('Keep this flag note');
		await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
		await page
			.getByRole('dialog')
			.filter({ visible: true })
			.getByRole('button', { name: 'Close', exact: true })
			.click();
		await expect(checkbox).toBeChecked();
		await page.reload();
		await expect(checkbox).toBeChecked();
		await page
			.getByRole('button', { name: `View notes for ${item.label}, 1 note`, exact: true })
			.click();
		await expect(dialog).toContainText('Keep this flag note');
		await dialog.getByRole('button', { name: 'Close', exact: true }).click();
		await page.goto(url);
		await expect(page.getByRole('button', { name: 'Edit Current HP', exact: true })).toBeVisible();
		await expect(checkbox).toBeChecked();
	});
}

test('Conditions: multiline draft, cancel, explicit save, clear and numeric regression', async ({
	page
}) => {
	await page.goto(`/ez-chars/charsheets/5e2024?id=${sparseCharacter5e2024.meta.id}`);
	const edit = page.getByRole('button', { name: 'Edit Conditions', exact: true });
	const input = page.getByRole('textbox', { name: 'Conditions', exact: true });
	await page.getByRole('button', { name: 'Add notes for Conditions', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Add note for Conditions', exact: true }).click();
	await dialog
		.getByRole('textbox', { name: 'Text (optional)', exact: true })
		.fill('Keep this condition note');
	await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await edit.click();
	await input.fill('Cancelled');
	await input.press('Escape');
	await expect(edit).toBeFocused();
	await edit.click();
	await expect(input).toHaveValue('');
	await input.fill('Prone');
	await expect(
		page.getByRole('button', { name: 'View notes for Conditions, 1 note', exact: true })
	).toHaveCount(0);
	await input.press('End');
	await input.press('Enter');
	await input.pressSequentially('Concentrating');
	await expect(input).toHaveValue('Prone\nConcentrating');
	await page.getByRole('button', { name: 'Confirm Conditions', exact: true }).click();
	await expect(edit).toBeFocused();
	await page.reload();
	await edit.click();
	await expect(input).toHaveValue('Prone\nConcentrating');
	await input.fill('');
	await page.getByRole('button', { name: 'Confirm Conditions', exact: true }).click();
	await page.reload();
	await edit.click();
	await expect(input).toHaveValue('');
	await input.press('Escape');
	await page
		.getByRole('button', { name: 'View notes for Conditions, 1 note', exact: true })
		.click();
	await expect(dialog).toContainText('Keep this condition note');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await page.getByRole('spinbutton', { name: 'Current HP', exact: true }).fill('8');
	await page.getByRole('button', { name: 'Confirm Current HP', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Edit Current HP', exact: true })).toBeFocused();
});
