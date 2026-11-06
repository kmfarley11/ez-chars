import { expect, type Page } from '@playwright/test';

// Shared black-box geometry contract for the actual sheet and catalog hosts.
export const verifyRuntimeMultilineGeometry = async (page: Page) => {
	const edit = page.getByRole('button', { name: 'Edit Conditions', exact: true });
	const input = page.getByRole('textbox', { name: 'Conditions', exact: true });
	const content =
		'Prone\nConcentrating on a spell with a long name that wraps in a narrow field\nPoisoned\n';
	await edit.click();
	await input.fill(content);
	await page.getByRole('button', { name: 'Confirm Conditions', exact: true }).click();
	const reading = page.getByRole('region', { name: 'Conditions text', exact: true });
	const readBox = await reading.boundingBox();
	expect(readBox).not.toBeNull();
	await edit.click();
	await expect(input).toHaveValue(content);
	await expect
		.poll(async () => (await input.boundingBox())?.height)
		.toBeCloseTo(readBox!.height, 0);
	const editBox = await input.boundingBox();
	expect(editBox!.width).toBeCloseTo(readBox!.width, 0);
	expect(editBox!.height).toBeGreaterThan(70);
	expect(editBox!.height).toBeLessThanOrEqual(192);
	await input.fill('Prone');
	await expect
		.poll(async () => (await input.boundingBox())?.height ?? 0)
		.toBeLessThan(editBox!.height);
	await input.fill(Array.from({ length: 30 }, (_, index) => 'Line ' + index).join('\n'));
	await expect.poll(async () => (await input.boundingBox())?.height).toBe(192);
	// fill leaves the caret at the end; arrow navigation reveals it without
	// depending on platform-specific document-end shortcuts (notably WebKit/macOS).
	await input.press('ArrowUp');
	await input.press('ArrowDown');
	await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
	await page.getByRole('button', { name: 'Confirm Conditions', exact: true }).click();
	await expect.poll(async () => (await reading.boundingBox())?.height).toBe(192);
	await reading.focus();
	await reading.press('End');
	await expect.poll(() => reading.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
	await expect(page.locator('body')).toHaveJSProperty('scrollWidth', page.viewportSize()!.width);
};
