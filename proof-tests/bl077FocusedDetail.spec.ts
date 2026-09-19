import { expect, test } from '@playwright/test';

const proofUrl =
	'/iframe.html?id=organisms-unified-character-detail-workflow--three-tier-comparison&viewMode=story';

test.beforeEach(async ({ page }) => {
	await page.goto(proofUrl);
	await expect(
		page.getByRole('heading', { name: 'Three-tier read-first interaction comparison' })
	).toBeVisible();
});

test('keeps runtime editing stable and restores focus after cancel', async ({ page }) => {
	const edit = page.getByRole('button', { name: 'Edit Current HP' });
	await edit.click();
	const input = page.getByRole('spinbutton', { name: 'Edit Current HP' });
	await input.fill('37');
	await page.getByRole('button', { name: 'Cancel editing Current HP' }).click();

	await expect(page.getByText('41', { exact: true })).toBeVisible();
	await expect(edit).toBeFocused();

	await edit.click();
	await input.fill('37');
	await page.getByRole('button', { name: 'Confirm Current HP' }).click();
	await expect(page.getByText('37', { exact: true })).toBeVisible();
	await expect(edit).toBeFocused();

	const maximumHp = page.getByRole('button', { name: 'View Maximum HP details' });
	await maximumHp.click();
	const maximumHpDialog = page.getByRole('dialog', { name: 'Maximum HP' });
	await maximumHpDialog.getByRole('button', { name: 'Edit', exact: true }).click();
	await maximumHpDialog.getByRole('spinbutton', { name: 'Authored maximum hp' }).fill('52');
	await maximumHpDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await maximumHpDialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(
		page
			.getByRole('region', { name: 'Tier 1 · Quick Reference context' })
			.getByText('52', { exact: true })
	).toBeVisible();
	await expect(maximumHp).toBeFocused();
});

test('keeps an invalid combined draft open without committing', async ({ page }) => {
	const invoker = page.getByRole('button', { name: 'View Background details' });
	await invoker.click();
	const dialog = page.getByRole('dialog', { name: 'Background' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Edit', exact: true }).click();

	const authored = page.getByLabel('Authored background');
	await authored.fill('');
	await page.getByRole('button', { name: 'Save', exact: true }).click();

	await expect(page.getByRole('alert')).toHaveText('Background cannot be empty.');
	await expect(authored).toHaveValue('');
	await expect(dialog).toBeVisible();

	await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(dialog.getByRole('heading', { name: 'Authored information' })).toBeVisible();
	await expect(dialog.getByRole('textbox', { name: 'Authored background' })).toHaveCount(0);
	await expect(dialog).toBeVisible();

	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(invoker).toBeFocused();
});

test('preserves collection query across detail and Back and restores row focus', async ({
	page
}) => {
	const browse = page.getByRole('button', { name: 'Open Features focused view' });
	await browse.click();
	const featuresDialog = page.getByRole('dialog', { name: 'Features' });
	const query = featuresDialog.getByRole('searchbox', { name: 'Find a feature', exact: true });
	await query.fill('General feature 2');
	const details = featuresDialog.getByRole('button', {
		name: 'View General feature 2 details'
	});
	await details.click();
	await expect(page.getByRole('heading', { name: 'General feature 2' })).toBeVisible();

	await page.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(query).toHaveValue('General feature 2');
	await expect(details).toBeFocused();
	await expect(page.getByRole('dialog')).toHaveCount(1);

	await page.getByRole('button', { name: 'Close' }).click();
	await expect(browse).toBeFocused();
});

test('updates bounded collection overflow cues at each scroll boundary', async ({ page }) => {
	for (const name of ['Features scrollable results', 'Spells scrollable results']) {
		const viewport = page.getByRole('region', { name });
		const frame = viewport.locator('..');
		const moreAbove = frame.locator('[data-scroll-affordance="more-above"]');
		const moreBelow = frame.locator('[data-scroll-affordance="more-below"]');

		await expect(moreAbove).toHaveCount(0);
		await expect(moreBelow).toBeVisible();

		await viewport.evaluate((element) => {
			element.scrollTop = element.scrollHeight;
			element.dispatchEvent(new Event('scroll'));
		});

		await expect(moreAbove).toBeVisible();
		await expect(moreBelow).toHaveCount(0);
	}
});

test('keeps collection priority immediate and first-class beside detail actions', async ({
	page
}) => {
	const inventoryPin = page.getByRole('button', { name: 'Unpin Random rock' });
	await expect(inventoryPin).toHaveAttribute('aria-pressed', 'true');
	await inventoryPin.click();
	await expect(page.getByRole('button', { name: 'Pin Random rock' })).toHaveAttribute(
		'aria-pressed',
		'false'
	);

	await page.getByRole('button', { name: 'Pin General feature 2' }).click();
	const featureUnpin = page.getByRole('button', { name: 'Unpin General feature 2' });
	await expect(featureUnpin).toHaveAttribute('aria-pressed', 'true');
	await expect(featureUnpin).toBeFocused();

	await page.getByRole('button', { name: 'Pin Practice spell 2 saturated-spell-2' }).click();
	const spellUnpin = page.getByRole('button', {
		name: 'Unpin Practice spell 2 saturated-spell-2'
	});
	await expect(spellUnpin).toHaveAttribute('aria-pressed', 'true');
	await expect(spellUnpin).toBeFocused();
});

test('keeps collection Add separate from focused eligible Remove', async ({ page }) => {
	const addOtherGear = page.getByRole('button', { name: 'Add Other Gear item' });
	await addOtherGear.click();
	const addDialog = page.getByRole('dialog', { name: 'Add Other Gear item' });
	await addDialog.getByRole('textbox', { name: 'Name' }).fill('Surveyor kit');
	await addDialog.getByRole('textbox', { name: 'Initial detail (optional)' }).fill('For ruins.');
	await addDialog.getByRole('button', { name: 'Add record' }).click();

	const detailDialog = page.getByRole('dialog', { name: 'Surveyor kit' });
	await expect(detailDialog.getByText('For ruins.')).toBeVisible();
	await detailDialog.getByRole('button', { name: 'Close' }).click();
	await expect(addOtherGear).toBeFocused();

	await page.getByRole('button', { name: 'View Surveyor kit details' }).click();
	await page
		.getByRole('dialog', { name: 'Surveyor kit' })
		.getByRole('button', { name: 'Remove item' })
		.click();
	await page
		.getByRole('dialog', { name: 'Surveyor kit' })
		.getByRole('button', { name: 'Confirm remove' })
		.click();
	await expect(page.getByText('Surveyor kit', { exact: true })).toHaveCount(0);
	await expect(addOtherGear).toBeFocused();

	await page.getByRole('button', { name: 'Open Features focused view' }).click();
	const featuresDialog = page.getByRole('dialog', { name: 'Features' });
	const featureQuery = featuresDialog.getByRole('searchbox', { name: 'Find a feature' });
	await featureQuery.fill('General feature 2');
	await featuresDialog.getByRole('button', { name: 'View General feature 2 details' }).click();
	await page
		.getByRole('dialog', { name: 'General feature 2' })
		.getByRole('button', { name: 'Remove feature' })
		.click();
	await page
		.getByRole('dialog', { name: 'General feature 2' })
		.getByRole('button', { name: 'Confirm remove' })
		.click();
	await expect(featuresDialog).toBeVisible();
	await expect(featureQuery).toHaveValue('General feature 2');
	await expect(featureQuery).toBeFocused();
	await featureQuery.fill('');
	const classFeatureDetails = featuresDialog.getByRole('button', {
		name: 'View Class feature 1 details'
	});
	await classFeatureDetails.click();
	await expect(
		page.getByRole('dialog', { name: 'Class feature 1' }).getByRole('button', {
			name: 'Remove feature'
		})
	).toHaveCount(0);
});
