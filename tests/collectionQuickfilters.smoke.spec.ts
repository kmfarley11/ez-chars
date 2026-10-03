import { expect, test, type Page } from '@playwright/test';
import { saturatedStoredCharacters5e2014 } from '../src/fixtures/saturatedCharacter.5e2014';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript((value) => {
		if (localStorage.getItem('ez-chars.characters.v1') === null)
			localStorage.setItem('ez-chars.characters.v1', JSON.stringify(value));
	}, saturatedStoredCharacters5e2014);
});
test.afterEach(({ page }) => expectNoBrowserErrors(page));

const openSheet = async (page: Page) => {
	await page.goto('/ez-chars/charsheets/5e?id=char-5e-2014-saturated');
	await expect(page.getByRole('main', { name: '2014 character sheet' })).toBeVisible();
};

test('action timing OR plus search, independent resets, pins and filtered edit return', async ({
	page
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await openSheet(page);
	const region = page.getByRole('region', { name: 'Runtime actions', exact: true });
	await expect(region.getByRole('button', { name: 'Clear all', exact: true })).toHaveCount(0);
	await expect(
		region.getByText('Quick filters: Timing', { exact: true }).filter({ visible: true })
	).toBeVisible();
	const reaction = region.getByRole('button', { name: 'Reaction', exact: true });
	await expect(reaction).toHaveText('Reaction');
	await reaction.scrollIntoViewIfNeeded();
	const initialSize = await reaction.boundingBox();
	await reaction.focus();
	await reaction.press('Space');
	await expect(reaction).toHaveAttribute('aria-pressed', 'true');
	const selectedSize = await reaction.boundingBox();
	expect(selectedSize?.width).toBe(initialSize?.width);
	expect(selectedSize?.height).toBe(initialSize?.height);
	await reaction.press('Enter');
	await expect(reaction).toHaveAttribute('aria-pressed', 'false');
	await expect(region.getByRole('button', { name: 'Reset timing' })).toBeDisabled();
	await reaction.click();
	await region.getByRole('button', { name: 'Action', exact: true }).click();
	await expect(region.getByRole('button', { name: 'Open Longsword attack' })).toBeVisible();
	const search = region.getByRole('searchbox');
	await search.fill('shield');
	await expect(region.getByRole('button', { name: 'Open Longsword attack' })).toHaveCount(0);
	await region.getByRole('button', { name: 'Reset timing' }).click();
	await expect(search).toHaveValue('shield');
	const pin = region.getByRole('button', { name: 'Pin Shield reaction', exact: true });
	await pin.click();
	await expect(
		region.getByRole('button', { name: 'Unpin Shield reaction', exact: true })
	).toBeFocused();
	await region.getByRole('button', { name: 'Reaction', exact: true }).click();
	await region.getByRole('button', { name: 'Open Shield reaction' }).click();
	const detail = page.getByRole('dialog', { name: 'Shield reaction', exact: true });
	await detail.getByRole('button', { name: 'Edit Timing', exact: true }).click();
	await detail.getByRole('combobox', { name: 'Timing', exact: true }).selectOption('free');
	await detail.getByRole('button', { name: 'Save Timing', exact: true }).click();
	await expect(detail).toBeVisible();
	await detail.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(region.getByRole('button', { name: 'Add action', exact: true })).toBeFocused();
	await expect(
		region
			.getByText('No runtime actions match the current search and filters.')
			.filter({ visible: true })
	).toBeVisible();
	await region.getByRole('button', { name: 'Clear all', exact: true }).first().click();
	await expect(
		region.getByRole('button', { name: 'Unpin Shield reaction', exact: true })
	).toBeVisible();
	await page.reload();
	await expect(region.getByRole('button', { name: 'Reaction', exact: true })).toHaveAttribute(
		'aria-pressed',
		'false'
	);
	await expect(
		region.getByRole('button', { name: 'Unpin Shield reaction', exact: true })
	).toBeVisible();
});

test('phone previews and focused browse use identical spell restrictions and survive detail exclusion', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openSheet(page);
	const spells = page.getByRole('region', { name: 'Spells', exact: true });
	await expect(
		spells
			.getByText('Quick filters: Spell level & preparedness', { exact: true })
			.filter({ visible: true })
	).toBeVisible();
	const filters = spells.getByRole('group', { name: 'Quick filters: Spell level & preparedness' });
	for (const name of ['Cantrip', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Prepared only']) {
		await expect(filters.getByRole('button', { name, exact: true })).toBeVisible();
	}
	const initialFilterSize = await filters.boundingBox();
	await spells.getByRole('button', { name: '1', exact: true }).click();
	await spells.getByRole('button', { name: '2', exact: true }).click();
	await spells.getByRole('button', { name: 'Prepared only', exact: true }).click();
	const selectedFilterSize = await filters.boundingBox();
	expect(selectedFilterSize?.height).toBe(initialFilterSize?.height);
	expect(selectedFilterSize?.width).toBe(initialFilterSize?.width);
	if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) {
		for (const name of ['1', '2', 'Prepared only']) {
			const bounds = await spells.getByRole('button', { name, exact: true }).evaluate((element) => {
				const rect = element.getBoundingClientRect();
				return rect ? { width: rect.width, height: rect.height } : undefined;
			});
			expect(bounds?.width).toBeGreaterThanOrEqual(44);
			expect(bounds?.height).toBeGreaterThanOrEqual(44);
		}
	}
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	const preview = spells.getByRole('list', { name: 'Spells preview' });
	await expect(preview.getByRole('button', { name: /^Open Practice spell 7,/ })).toBeVisible();
	await expect(preview.getByRole('button', { name: /^Open Practice spell 2,/ })).toHaveCount(0);
	await spells.getByRole('button', { name: /Browse .* matching items/ }).click();
	const browse = page.getByRole('dialog', { name: 'Spells', exact: true });
	await expect(browse.getByRole('button', { name: 'Prepared only' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await browse.getByRole('button', { name: /^Open Practice spell 7,/ }).click();
	const detail = page.getByRole('dialog', { name: 'Practice spell 7', exact: true });
	await detail.getByRole('button', { name: 'Edit Prepared', exact: true }).click();
	await detail.getByRole('checkbox', { name: 'Prepared', exact: true }).uncheck();
	await detail.getByRole('button', { name: 'Save Prepared', exact: true }).click();
	await expect(detail).toBeVisible();
	await detail.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(browse).toBeVisible();
	await expect(page.getByRole('dialog').filter({ visible: true })).toHaveCount(1);
	await expect(browse.getByRole('button', { name: /^Open Practice spell 7,/ })).toHaveCount(0);
	await expect(browse.getByRole('searchbox')).toBeFocused();
	await browse.getByRole('button', { name: 'Prepared only', exact: true }).click();
	await browse.getByRole('button', { name: 'Reset level', exact: true }).click();
	await expect(browse.getByRole('button', { name: /^Open Practice spell 7,/ })).toBeVisible();
});

test('phone action preview filters before slicing; reload resets temporary restrictions', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openSheet(page);
	const actions = page.getByRole('region', { name: 'Runtime actions', exact: true });
	await actions.getByRole('button', { name: 'Other', exact: true }).click();
	await actions.getByRole('searchbox').fill('reminder 8');
	await expect(
		actions
			.getByRole('list', { name: 'Runtime actions preview' })
			.getByRole('button', { name: 'Open Custom runtime action 8' })
	).toBeVisible();
	await actions.getByRole('button', { name: 'Browse 1 matching items' }).click();
	const browse = page.getByRole('dialog', { name: 'Runtime actions', exact: true });
	await expect(browse.getByRole('searchbox')).toHaveValue('reminder 8');
	await expect(browse.getByRole('button', { name: 'Other', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await page.reload();
	await expect(actions.getByRole('button', { name: 'Other', exact: true })).toHaveAttribute(
		'aria-pressed',
		'false'
	);
	await expect(actions.getByRole('button', { name: 'Browse all 10 items' })).toBeVisible();
});

test('unpinning out of phone previews restores a stable collection action', async ({ page }) => {
	await page.addInitScript((value) => {
		value.characters[0].systemData.collectionPins = {
			...value.characters[0].systemData.collectionPins,
			runtimeActions: ['saturated-custom-action-8'],
			spells: ['saturated-spell-5']
		};
		localStorage.setItem('ez-chars.characters.v1', JSON.stringify(value));
	}, saturatedStoredCharacters5e2014);
	await page.setViewportSize({ width: 390, height: 844 });
	await openSheet(page);
	const actions = page.getByRole('region', { name: 'Runtime actions', exact: true });
	await actions.getByRole('button', { name: 'Unpin Custom runtime action 8', exact: true }).click();
	await expect(actions.getByRole('button', { name: 'Open Custom runtime action 8' })).toHaveCount(
		0
	);
	await expect(actions.getByRole('button', { name: 'Add action', exact: true })).toBeFocused();
	const spells = page.getByRole('region', { name: 'Spells', exact: true });
	await spells.getByRole('button', { name: /^Unpin Practice spell 5,/ }).click();
	await expect(spells.getByRole('button', { name: /^Open Practice spell 5,/ })).toHaveCount(0);
	await expect(spells.getByRole('button', { name: 'Add Spells', exact: true })).toBeFocused();
});

test('short action filters survive Add and removal of the last matching record', async ({
	page
}) => {
	await page.addInitScript((value) => {
		value.characters[0].systemData.runtimeActions = [
			{ id: 'only-action', name: 'Only reaction', timing: 'reaction' }
		];
		localStorage.setItem('ez-chars.characters.v1', JSON.stringify(value));
	}, saturatedStoredCharacters5e2014);
	await openSheet(page);
	const actions = page.getByRole('region', { name: 'Runtime actions', exact: true });
	await actions.getByRole('button', { name: 'Reaction', exact: true }).click();
	await actions.getByRole('searchbox').fill('only');
	await actions.getByRole('button', { name: 'Add action', exact: true }).click();
	await page
		.getByRole('dialog', { name: 'Add action', exact: true })
		.getByRole('button', { name: 'Cancel', exact: true })
		.click();
	await expect(actions.getByRole('searchbox')).toHaveValue('only');
	await expect(actions.getByRole('button', { name: 'Reaction', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await actions.getByRole('button', { name: 'Pin Only reaction', exact: true }).click();
	await actions.getByRole('button', { name: 'Open Only reaction', exact: true }).click();
	const detail = page.getByRole('dialog', { name: 'Only reaction', exact: true });
	await detail.getByRole('button', { name: 'Remove action', exact: true }).click();
	await detail.getByRole('button', { name: 'Confirm removal', exact: true }).click();
	await expect(actions.getByRole('button', { name: 'Add action', exact: true })).toBeFocused();
	await expect(actions.getByRole('searchbox')).toHaveValue('only');
	await actions.getByRole('button', { name: 'Reset timing', exact: true }).click();
	await expect(actions.getByRole('searchbox')).toHaveValue('only');
	await actions.getByRole('button', { name: 'Clear search', exact: true }).click();
	await expect(actions.getByRole('searchbox')).toHaveCount(0);
	await expect(
		actions.getByText('No runtime actions yet.').filter({ visible: true })
	).toBeVisible();
});
