import { expect, test, type Locator, type Page } from '@playwright/test';
import { saturatedStoredCharacters5e2014 } from '../src/fixtures/saturatedCharacter.5e2014';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';

const storageKey = 'ez-chars.characters.v1';
const characterId = 'char-5e-2014-saturated';

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(
		({ key, value }) => {
			if (localStorage.getItem(key) === null) {
				localStorage.setItem(key, JSON.stringify(value));
			}
		},
		{
			key: storageKey,
			value: saturatedStoredCharacters5e2014
		}
	);
});

test.afterEach(({ page }) => {
	expectNoBrowserErrors(page);
});

async function openSaturatedSheet(page: Page) {
	await page.goto('/');
	await page.getByRole('button', { name: 'Open Saturated Playtest Adventurer' }).click();
	await expect(page).toHaveURL(new RegExp(`/charsheets/5e\\?id=${characterId}`));
	await expect(page.getByText('Current HP:', { exact: false })).toBeVisible();
}

async function expectMinimumTouchTarget(locator: Locator, label: string) {
	const box = await locator.boundingBox();
	expect(box, `${label} should have a rendered touch target`).not.toBeNull();
	expect(box?.width, `${label} width`).toBeGreaterThanOrEqual(44);
	expect(box?.height, `${label} height`).toBeGreaterThanOrEqual(44);
}

test('Other Gear supports bounded search, stable row editing, notes, and bulk editing', async ({
	page
}, testInfo) => {
	test.setTimeout(20_000);
	test.skip(testInfo.project.name === 'Mobile Chrome', 'Desktop bounded-list behavior.');
	await openSaturatedSheet(page);
	for (const regionName of ['Overview', 'Runtime', 'Organizational']) {
		await expect(page.getByRole('button', { name: regionName, exact: true })).toBeVisible();
	}

	const region = page.getByRole('region', { name: 'Other inventory' });
	const results = region.getByRole('list', { name: 'Other Gear results' });
	const search = region.getByRole('searchbox', { name: 'Search Other Gear' });
	await expect(region.getByText('32 items', { exact: true }).first()).toBeVisible();
	await expect(region.getByRole('button', { name: 'Bulk Edit Other Gear' })).toBeVisible();
	await expect(results).toBeVisible();
	const dimensions = await results.evaluate((element) => ({
		clientHeight: element.clientHeight,
		scrollHeight: element.scrollHeight,
		overscrollBehaviorY: getComputedStyle(element).overscrollBehaviorY
	}));
	expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
	expect(dimensions.overscrollBehaviorY).toBe('auto');
	await expect(region.locator('[data-scroll-affordance="more-below"]')).toBeVisible();

	await search.fill('rope');
	await expect(region.getByText('2 of 32 items', { exact: true }).first()).toBeVisible();
	const firstRope = results.locator('[data-row-key="item:saturated-gear-1"]');
	const secondRope = results.locator('[data-row-key="item:saturated-gear-9"]');
	await expect(firstRope).toBeVisible();
	await expect(secondRope).toBeVisible();
	const secondRopeActions = secondRope.getByRole('button', { name: /Row actions for Rope/ });
	await secondRopeActions.click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	const editDialog = page.getByRole('dialog', { name: 'Edit Rope' });
	await editDialog.getByLabel('Detail', { exact: true }).fill('Priority climbing rope.');
	await editDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(secondRopeActions).toBeFocused();
	await expect(search).toHaveValue('rope');
	await expect(secondRope.getByText('Priority climbing rope.')).toBeVisible();

	await expect
		.poll(() =>
			page.evaluate((key) => {
				const character = JSON.parse(localStorage.getItem(key) ?? '{}').characters?.[0];
				return {
					first: character?.inventory?.find(
						(item: { id: string }) => item.id === 'saturated-gear-1'
					)?.notes,
					second: character?.inventory?.find(
						(item: { id: string }) => item.id === 'saturated-gear-9'
					)?.notes,
					linkedSource: character?.systemData?.runtimeActions?.find(
						(action: { id: string }) => action.id === 'saturated-linked-item-action'
					)?.source
				};
			}, storageKey)
		)
		.toEqual({
			first: 'Authored detail for campaign gear 1.',
			second: 'Priority climbing rope.',
			linkedSource: { kind: 'item', id: 'saturated-weapon-1' }
		});

	await search.fill('random rock');
	const rock = results.locator('[data-row-key="item:saturated-gear-3"]');
	const rockActions = rock.getByRole('button', { name: /Row actions for Random rock/ });
	await rockActions.click();
	await page.getByRole('button', { name: 'Notes', exact: true }).click();
	const notesDialog = page.getByRole('dialog', { name: 'Notes' });
	await notesDialog.getByRole('button', { name: 'Edit', exact: true }).click();
	await notesDialog.getByText('Annotations (1)').click();
	await notesDialog.getByText('Annotation 1').click();
	await notesDialog
		.getByRole('textbox', { name: 'Text (optional)' })
		.fill('Confirmed magical during the saturated rehearsal.');
	await notesDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await notesDialog.getByRole('button', { name: 'Close' }).click();
	await expect(rockActions).toBeFocused();
	await expect(rock.getByText('1 note')).toBeVisible();

	await search.fill('portable hole');
	await expect(region.getByText('0 of 32 items', { exact: true }).first()).toBeVisible();
	await expect(region.getByText(/No other gear match/).first()).toBeVisible();
	await region.getByRole('button', { name: 'Clear', exact: true }).first().click();
	await expect(search).toHaveValue('');

	await page.reload();
	const reloadedRegion = page.getByRole('region', { name: 'Other inventory' });
	await reloadedRegion.getByRole('searchbox', { name: 'Search Other Gear' }).fill('rope');
	await expect(
		reloadedRegion
			.locator('[data-row-key="item:saturated-gear-9"]')
			.getByText('Priority climbing rope.', { exact: true })
			.first()
	).toBeVisible();
});

test('Weapons, Armor & Shields, and Spells share scoped discovery and focused identity', async ({
	page
}, testInfo) => {
	test.setTimeout(20_000);
	test.skip(testInfo.project.name === 'Mobile Chrome', 'Desktop collection rollout behavior.');
	await openSaturatedSheet(page);
	for (const regionName of ['Overview', 'Runtime', 'Organizational']) {
		await expect(page.getByRole('button', { name: regionName, exact: true })).toBeVisible();
	}

	const weapons = page.getByRole('region', { name: 'Weapons inventory' });
	const armor = page.getByRole('region', { name: 'Armor and shields inventory' });
	const spells = page.getByRole('region', { name: 'Spells collection' });
	await expect(weapons.getByText('9 items', { exact: true }).first()).toBeVisible();
	await expect(armor.getByText('7 items', { exact: true }).first()).toBeVisible();
	await expect(spells.getByText('28 items', { exact: true }).first()).toBeVisible();
	const spellsHeading = spells.getByRole('heading', { name: 'Spells', exact: true });
	await expect(spellsHeading.locator('..')).not.toContainText('28 items');
	await expect(weapons.getByRole('button', { name: 'Bulk Edit Weapons' })).toBeVisible();
	await expect(armor.getByRole('button', { name: 'Bulk Edit Armor & Shields' })).toBeVisible();

	const spellcasting = page.getByRole('region', { name: 'Spellcasting' });
	const spellSlots = page.getByRole('region', { name: 'Spell slots' });
	await expect(page.getByRole('heading', { name: 'Spellcasting', exact: true })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Spell Slots', exact: true })).toHaveCount(0);
	await expect(spellcasting).toContainText('Ability: int');
	await expect(spellSlots).toContainText('1st: 1 / 4');
	await expect(spellSlots).toContainText('9th: 0 / 0');
	await expect(spellSlots).not.toContainText('1st Used');
	const spellcastingBox = await spellcasting.boundingBox();
	const spellSlotsBox = await spellSlots.boundingBox();
	const spellCollectionBox = await spells.boundingBox();
	expect(spellcastingBox).not.toBeNull();
	expect(spellSlotsBox).not.toBeNull();
	expect(spellCollectionBox).not.toBeNull();
	expect(spellcastingBox!.y + spellcastingBox!.height).toBeLessThanOrEqual(spellSlotsBox!.y);
	expect(spellSlotsBox!.y + spellSlotsBox!.height).toBeLessThanOrEqual(spellCollectionBox!.y);

	await weapons.getByRole('searchbox', { name: 'Search Weapons' }).fill('longsword');
	await expect(weapons.getByText('1 of 9 items', { exact: true }).first()).toBeVisible();
	await expect(armor.getByText('7 items', { exact: true }).first()).toBeVisible();
	const runtimeActions = page.getByRole('list', { name: 'Runtime actions' });
	await weapons.getByRole('searchbox', { name: 'Search Weapons' }).fill('training sword');
	await runtimeActions.getByRole('button', { name: 'Source actions for Longsword attack' }).click();
	await runtimeActions.getByRole('button', { name: 'View Inventory · Longsword' }).click();
	await expect(weapons).toBeFocused();
	await expect(weapons.getByRole('searchbox', { name: 'Search Weapons' })).toHaveValue('');

	const spellSearch = spells.getByRole('searchbox', { name: 'Search Spells' });
	const bulkEditSpells = spells.getByRole('button', { name: 'Bulk Edit Spells' });
	await bulkEditSpells.click();
	const bulkDialog = page.getByRole('dialog', { name: 'Bulk Edit Spells' });
	await expect(bulkDialog.getByText('Cantrips', { exact: true }).first()).toBeVisible();
	await expect(bulkDialog.getByRole('button', { name: 'Add Cantrip' })).toBeVisible();
	await expect(bulkDialog.getByRole('button', { name: 'Add Spell' }).first()).toBeVisible();
	await bulkDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(bulkEditSpells).toBeFocused();

	await spellSearch.fill('shield');
	await expect(spells.getByText('2 of 28 items', { exact: true }).first()).toBeVisible();
	const spellResults = spells.getByRole('list', { name: 'Spells results' });
	await expect(spellResults.getByText('Spell', { exact: true })).toHaveCount(2);
	await expect(spellResults.getByRole('heading', { name: 'Cantrips' })).toBeVisible();
	await expect(spellResults.getByRole('heading', { name: '1st-level spells' })).toBeVisible();
	await expect(spellResults.getByText('Cantrip · Prepared', { exact: true })).toBeVisible();
	await expect(
		spellResults.getByText('Spell level 1 · Not prepared', { exact: true })
	).toBeVisible();

	const levelOneShield = spellResults.locator('[data-row-key="spell:saturated-spell-12"]');
	const levelOneActions = levelOneShield.getByRole('button', { name: /Row actions for Shield/ });
	await levelOneActions.click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	const editDialog = page.getByRole('dialog', { name: 'Edit Shield' });
	await editDialog.getByLabel('Notes', { exact: true }).fill('Priority level-one shield.');
	await editDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(levelOneActions).toBeFocused();
	await expect(spellSearch).toHaveValue('shield');

	await expect
		.poll(() =>
			page.evaluate((key) => {
				const character = JSON.parse(localStorage.getItem(key) ?? '{}').characters?.[0];
				const byId = new Map(
					(character?.systemData?.spellcasting?.spells ?? []).map(
						(spell: { spellId: string; notes?: string }) => [spell.spellId, spell.notes]
					)
				);
				return {
					linked: byId.get('saturated-spell-1'),
					edited: byId.get('saturated-spell-12'),
					source: character?.systemData?.runtimeActions?.find(
						(action: { id: string }) => action.id === 'saturated-linked-spell-action'
					)?.source
				};
			}, storageKey)
		)
		.toEqual({
			linked: 'Authored spell reminder 1.',
			edited: 'Priority level-one shield.',
			source: { kind: 'spell', id: 'saturated-spell-1' }
		});

	await spellSearch.fill('practice spell');
	await runtimeActions.getByRole('button', { name: 'Source actions for Shield reaction' }).click();
	await runtimeActions.getByRole('button', { name: 'View Spell · Shield' }).click();
	await expect(spells).toBeFocused();
	await expect(spellSearch).toHaveValue('');
});

test('phone previews expose five records and a modal complete collection with one scroll owner', async ({
	page
}, testInfo) => {
	test.skip(testInfo.project.name !== 'Mobile Chrome', 'Phone-specific dense collection behavior.');
	await openSaturatedSheet(page);
	for (const regionName of ['Overview', 'Runtime', 'Organizational']) {
		await expect(page.getByRole('button', { name: regionName, exact: true })).toBeVisible();
	}

	const phoneFamilies = [
		{ region: 'Weapons inventory', title: 'Weapons', count: 9 },
		{ region: 'Armor and shields inventory', title: 'Armor & Shields', count: 7 },
		{ region: 'Other inventory', title: 'Other Gear', count: 32 },
		{ region: 'Spells collection', title: 'Spells', count: 28 }
	] as const;
	for (const family of phoneFamilies) {
		const familyRegion = page.getByRole('region', { name: family.region });
		await expect(
			familyRegion.getByRole('list', { name: `${family.title} preview` }).getByRole('listitem')
		).toHaveCount(5);
		await expect(
			familyRegion.getByRole('button', { name: `Browse all ${family.count} items` })
		).toBeVisible();
		await expect(
			familyRegion.getByRole('button', { name: `Bulk Edit ${family.title}` })
		).toBeVisible();
	}

	const region = page.getByRole('region', { name: 'Other inventory' });
	const browse = region.getByRole('button', { name: 'Browse all 32 items' });
	await expectMinimumTouchTarget(browse, 'Other Gear browse action');
	await browse.click();
	const dialog = page.getByRole('dialog', { name: 'Other Gear' });
	await expect(dialog).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(() => ({
				html: getComputedStyle(document.documentElement).overflow,
				body: getComputedStyle(document.body).overflow
			}))
		)
		.toEqual({ html: 'hidden', body: 'hidden' });

	const search = dialog.getByRole('searchbox', { name: 'Search Other Gear' });
	await expectMinimumTouchTarget(search, 'Other Gear focused search');
	await search.fill('random rock');
	await expect(dialog.getByText('1 of 32 items', { exact: true })).toBeVisible();
	const row = dialog.locator('[data-row-key="item:saturated-gear-3"]');
	const rowActions = row.getByRole('button', { name: /Row actions for Random rock/ });
	await expectMinimumTouchTarget(rowActions, 'Other Gear row menu');
	await rowActions.click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	const editDialog = page.getByRole('dialog', { name: 'Edit Random rock' });
	await editDialog.getByLabel('Detail').fill('Phone rehearsal detail.');
	await editDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(rowActions).toBeFocused();
	await expect(search).toHaveValue('random rock');

	const close = dialog.getByRole('button', { name: 'Close Other Gear' });
	await expectMinimumTouchTarget(close, 'Other Gear close action');
	await close.click();
	await expect(dialog).not.toBeVisible();
	await expect(browse).toBeFocused();
});
