import { expect, test } from '@playwright/test';
import { verifyRuntimeMultilineGeometry } from '../runtime-type-geometry';

for (const example of [
	{ id: 'systems-d-d-2014-character-sheet--bryltin', label: 'Inspiration' },
	{ id: 'systems-d-d-2024-character-sheet--representative', label: 'Heroic Inspiration' }
]) {
	test(`${example.label}: canonical sheet restores rejected checkbox without losing focus`, async ({
		page
	}) => {
		await page.goto(`/iframe.html?id=${example.id}&viewMode=story`);
		const flag = page.getByRole('checkbox', { name: example.label, exact: true });
		const initial = await flag.isChecked();
		await page.getByRole('checkbox', { name: 'Reject character saves' }).check();
		await flag.focus();
		await flag.press('Space');
		await expect(flag).toBeChecked({ checked: initial });
		await expect(flag).toBeFocused();
		await expect(page.getByRole('alert')).toContainText('rejects saves');
		await page.getByRole('checkbox', { name: 'Reject character saves' }).uncheck();
		await flag.press('Space');
		await expect(flag).toBeChecked({ checked: !initial });
		await page.getByRole('button', { name: 'Reset example', exact: true }).click();
		await expect(flag).toBeChecked({ checked: initial });
	});
}

test('2024 canonical Conditions retains a rejected draft through the real save adapter', async ({
	page
}) => {
	await page.goto(
		'/iframe.html?id=systems-d-d-2024-character-sheet--representative&viewMode=story'
	);
	await page.getByRole('checkbox', { name: 'Reject character saves' }).check();
	await page.getByRole('button', { name: 'Edit Conditions', exact: true }).click();
	const input = page.getByRole('textbox', { name: 'Conditions', exact: true });
	await input.fill('Prone\nKeep rejected text');
	await page.getByRole('button', { name: 'Confirm Conditions', exact: true }).click();
	await expect(input).toHaveValue('Prone\nKeep rejected text');
	await expect(page.getByRole('alert')).toContainText('rejects saves');
	await page.getByRole('checkbox', { name: 'Reject character saves' }).uncheck();
	await page.getByRole('button', { name: 'Confirm Conditions', exact: true }).click();
	await expect(page.getByRole('region', { name: 'Conditions text', exact: true })).toContainText(
		'Keep rejected text'
	);
});

test('generic text variants preserve IME, newlines, rejection and bounded long drafts', async ({
	page
}) => {
	const story =
		'/iframe.html?id=design-system-molecules-edit-first-fields-tier-1--default&viewMode=story';
	await page.goto(`${story}&args=kind:text;rejectSaves:true`);
	await page.getByRole('button', { name: 'Edit Nickname', exact: true }).click();
	const short = page.getByRole('textbox', { name: 'Nickname', exact: true });
	await short.fill('Keep my draft');
	await short.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
	await expect(short).toBeVisible();
	await short.press('Enter');
	await expect(short).toHaveValue('Keep my draft');
	await expect(page.getByRole('alert')).toContainText('rejects saves');
	await short.press('Escape');
	await expect(page.getByRole('button', { name: 'Edit Nickname', exact: true })).toBeFocused();
	await page.goto(`${story}&args=kind:text`);
	await page.getByRole('button', { name: 'Edit Nickname', exact: true }).click();
	await short.fill('New nickname');
	await short.press('Enter');
	await expect(page.getByText('New nickname', { exact: true })).toBeVisible();
	await page.goto(`${story}&args=kind:text;absent:true`);
	await page.getByRole('button', { name: 'Edit Nickname', exact: true }).click();
	await expect(short).toHaveValue('');
	await short.press('Enter');
	await expect(page.getByLabel('Last emitted patch')).toHaveText('No patch emitted');
	await page.goto(`${story}&args=kind:multiline;rejectSaves:true`);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.getByRole('button', { name: 'Edit Conditions', exact: true }).click();
	const input = page.getByRole('textbox', { name: 'Conditions', exact: true });
	const long = Array.from({ length: 30 }, (_, index) => `Condition line ${index}`).join('\n');
	await input.fill(long);
	const box = await input.boundingBox();
	expect(box?.height).toBeLessThanOrEqual(192);
	await page.getByRole('button', { name: 'Confirm Conditions', exact: true }).click();
	await expect(input).toHaveValue(long);
	await expect(page.getByRole('alert')).toContainText('rejects saves');
	await page.getByRole('button', { name: 'Cancel editing Conditions', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Edit Conditions', exact: true })).toBeFocused();
});

test('generic absent boolean is explicit, toggles once and preserves rejection state', async ({
	page
}) => {
	const story =
		'/iframe.html?id=design-system-molecules-edit-first-fields-tier-1--default&viewMode=story';
	await page.goto(`${story}&args=kind:boolean;absent:true`);
	const flag = page.getByRole('checkbox', { name: 'Ready', exact: true });
	await expect(flag).toHaveCSS('border-radius', '4px');
	await expect(flag).toHaveAccessibleDescription('Not recorded');
	await expect(page.getByLabel('Last emitted patch')).toHaveText('No patch emitted');
	await flag.check();
	await expect(flag).toBeChecked();
	await expect(flag).toHaveAccessibleDescription('');
	await expect(page.getByLabel('Last emitted patch')).toContainText('"op":"add"');
	await flag.press('Space');
	await expect(flag).not.toBeChecked();
	await expect(page.getByLabel('Last emitted patch')).toContainText('"op":"replace"');
	await page.goto(`${story}&args=kind:boolean;absent:true;rejectSaves:true`);
	await flag.focus();
	await flag.press('Space');
	await expect(flag).not.toBeChecked();
	await expect(flag).toBeFocused();
	await expect(flag).toHaveAccessibleDescription('Not recorded');
	await expect(page.getByRole('alert')).toContainText('rejects saves');
	await expect(page.getByLabel('Last emitted patch')).toHaveText('No patch emitted');
});

test('short text keeps its read/edit height at phone and desktop widths', async ({ page }) => {
	await page.goto(
		'/iframe.html?id=design-system-molecules-edit-first-fields-tier-1--default&viewMode=story&args=kind:text'
	);
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		const value = page.getByText('Sparky', { exact: true });
		await expect(value).toBeVisible();
		const readBox = await value.boundingBox();
		await page.getByRole('button', { name: 'Edit Nickname', exact: true }).click();
		const input = page.getByRole('textbox', { name: 'Nickname', exact: true });
		await expect(input).toBeVisible();
		const editBox = await input.boundingBox();
		expect(readBox).not.toBeNull();
		expect(editBox).not.toBeNull();
		expect(Math.abs(readBox!.height - editBox!.height)).toBeLessThanOrEqual(0.5);
		await input.press('Escape');
		await expect(value).toBeVisible();
	}
});

for (const host of [
	{
		name: 'shared story',
		url: '/iframe.html?id=design-system-molecules-edit-first-fields-tier-1--default&viewMode=story&args=kind:multiline'
	},
	{
		name: '2024 sheet',
		url: '/iframe.html?id=systems-d-d-2024-character-sheet--representative&viewMode=story'
	}
]) {
	for (const width of [390, 1280]) {
		test(`${host.name}: multiline read/edit geometry at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(host.url);
			await verifyRuntimeMultilineGeometry(page);
		});
	}
}
