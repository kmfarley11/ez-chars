import { expect, test, type Page } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import { e2eCharacter, e2eStoredCharacters } from './fixtures/characters';

const storageKey = 'ez-chars.characters.v1';
const childLandmarks = [
	'Meta / Top-level Info',
	'Quick Reference',
	'Actions / Runtime Summary',
	'Abilities & Proficiencies',
	'Features & Traits',
	'Spells',
	'Inventory / Equipment',
	'Background, Roleplay, & Notes'
] as const;

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: storageKey,
		value: e2eStoredCharacters
	});
});

test.afterEach(({ page }) => {
	expectNoBrowserErrors(page);
});

const openCharacter = async (page: Page) => {
	await page.goto('/');
	await page.getByRole('button', { name: `Open ${e2eCharacter.identity.name}` }).click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-character/);
	await expect(page.getByRole('main', { name: '2014 character sheet' })).toBeVisible();
};

test('exposes the approved landmark order and independently reveals hidden destinations', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await openCharacter(page);
	const navigation = page.getByRole('navigation', { name: 'Character sheet navigation' });
	for (const label of [
		'Overview',
		...childLandmarks.slice(0, 1),
		'Runtime',
		...childLandmarks.slice(1, 6),
		'Organizational',
		...childLandmarks.slice(6)
	]) {
		await expect(navigation.getByRole('button', { name: label, exact: true })).toBeVisible();
	}

	const runtime = page
		.getByRole('main', { name: '2014 character sheet' })
		.getByRole('button', { name: 'Runtime', exact: true });
	await runtime.click();
	await expect(runtime).toHaveAttribute('aria-expanded', 'false');
	await navigation.getByRole('button', { name: 'Features & Traits', exact: true }).click();
	await expect(runtime).toHaveAttribute('aria-expanded', 'true');
	const features = page.getByRole('button', { name: 'Collapse Features & Traits' });
	await expect(features).toBeFocused();
	await expect(page).toHaveURL(/#sheet-features-traits-heading$/);

	const abilities = page.getByRole('button', { name: 'Collapse Abilities & Proficiencies' });
	await features.click();
	await expect(page.getByRole('button', { name: 'Expand Features & Traits' })).toHaveAttribute(
		'aria-expanded',
		'false'
	);
	await expect(abilities).toHaveAttribute('aria-expanded', 'true');
	await abilities.click();
	await expect(page.getByRole('button', { name: 'Expand Features & Traits' })).toHaveAttribute(
		'aria-expanded',
		'false'
	);
	await expect(
		page.getByRole('button', { name: 'Expand Abilities & Proficiencies' })
	).toHaveAttribute('aria-expanded', 'false');
});

test('deduplicates explicit fragments and resolves Back, Forward, and Rules history focus', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await openCharacter(page);
	const navigation = page.getByRole('navigation', { name: 'Character sheet navigation' });
	const quickReferenceJump = navigation.getByRole('button', {
		name: 'Quick Reference',
		exact: true
	});
	const featuresJump = navigation.getByRole('button', { name: 'Features & Traits', exact: true });

	await quickReferenceJump.click();
	await expect(page).toHaveURL(/#sheet-quick-reference-heading$/);
	await featuresJump.click();
	await expect(page).toHaveURL(/#sheet-features-traits-heading$/);
	const historyLength = await page.evaluate(() => history.length);
	await featuresJump.click();
	await expect.poll(() => page.evaluate(() => history.length)).toBe(historyLength);

	const runtime = page
		.getByRole('main', { name: '2014 character sheet' })
		.getByRole('button', { name: 'Runtime', exact: true });
	await runtime.click();
	await expect(runtime).toHaveAttribute('aria-expanded', 'false');
	await page.evaluate(() => history.back());
	await expect(page).toHaveURL(/#sheet-quick-reference-heading$/);
	await expect(runtime).toHaveAttribute('aria-expanded', 'true');
	await expect(page.getByRole('button', { name: 'Collapse Quick Reference' })).toBeFocused();
	await page.evaluate(() => history.forward());
	await expect(page).toHaveURL(/#sheet-features-traits-heading$/);
	await expect(page.getByRole('button', { name: 'Collapse Features & Traits' })).toBeFocused();

	const fragmentBeforeScroll = new URL(page.url()).hash;
	await page
		.getByRole('main', { name: '2014 character sheet' })
		.getByRole('button', { name: 'Organizational', exact: true })
		.scrollIntoViewIfNeeded();
	expect(new URL(page.url()).hash).toBe(fragmentBeforeScroll);

	const rules = page.getByRole('button', { name: 'Rules', exact: true });
	await rules.click();
	const reference = page.getByRole('complementary', { name: 'Rules reference' });
	await expect(reference).toBeVisible();
	await expect(page).toHaveURL(/#sheet-features-traits-heading$/);
	await reference.getByRole('button', { name: 'Close rules reference' }).click();
	await expect(reference).not.toBeVisible();
	await expect(rules).toBeFocused();
	await expect(page).toHaveURL(/#sheet-features-traits-heading$/);
	await page.evaluate(() => history.back());
	await expect(page).toHaveURL(/#sheet-quick-reference-heading$/);
	await expect(page.getByRole('button', { name: 'Collapse Quick Reference' })).toBeFocused();
});

test('keeps a fixed phone rail, labeled recovery outline, and document width', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openCharacter(page);
	const navigation = page.getByRole('navigation', { name: 'Character sheet navigation' });
	const buttons = navigation.getByRole('button');
	await expect(buttons).toHaveCount(9);
	for (let index = 0; index < (await buttons.count()); index += 1) {
		const box = await buttons.nth(index).boundingBox();
		expect(box).not.toBeNull();
		expect(box!.width).toBeGreaterThanOrEqual(44);
		expect(box!.height).toBeGreaterThanOrEqual(44);
		if (index > 0) {
			const previousBox = await buttons.nth(index - 1).boundingBox();
			expect(previousBox).not.toBeNull();
			expect(previousBox!.y + previousBox!.height).toBeLessThanOrEqual(box!.y);
		}
	}
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);

	const outlineTrigger = navigation.getByRole('button', { name: 'Show labeled sheet outline' });
	await outlineTrigger.focus();
	await page.keyboard.press('Enter');
	const dialog = page.getByRole('dialog', { name: 'Sheet outline' });
	await expect(dialog).toBeVisible();
	for (const label of ['Overview', 'Runtime', 'Organizational', ...childLandmarks]) {
		await expect(dialog.getByRole('button', { name: label, exact: true })).toBeVisible();
	}
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(outlineTrigger).toBeFocused();

	await outlineTrigger.click();
	await dialog.getByRole('button', { name: 'Inventory / Equipment', exact: true }).click();
	await expect(dialog).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'Collapse Inventory / Equipment' })).toBeFocused();
	await expect(page).toHaveURL(/#sheet-inventory-heading$/);
});

test('switches at the approved viewport threshold and preserves manual minification', async ({
	page
}) => {
	await page.setViewportSize({ width: 1279, height: 900 });
	await openCharacter(page);
	const navigation = page.getByRole('navigation', { name: 'Character sheet navigation' });
	await expect(
		navigation.getByRole('button', { name: 'Show labeled sheet outline' })
	).toBeVisible();
	await expect(navigation.getByRole('button', { name: 'Minify sheet outline' })).toHaveCount(0);

	await page.setViewportSize({ width: 1280, height: 900 });
	const minify = navigation.getByRole('button', { name: 'Minify sheet outline' });
	await expect(minify).toBeVisible();
	await minify.click();
	await expect(
		navigation.getByRole('button', { name: 'Show labeled sheet outline' })
	).toBeVisible();
	await expect(navigation.getByRole('button', { name: 'Quick Reference' })).toBeVisible();
});
