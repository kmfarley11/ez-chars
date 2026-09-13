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

async function expectVisibleKeyboardFocus(locator: Locator, label: string) {
	await expect(locator, `${label} should receive keyboard focus`).toBeFocused();
	const outline = await locator.evaluate((element) => {
		const styles = getComputedStyle(element);
		return {
			color: styles.outlineColor,
			style: styles.outlineStyle,
			width: Number.parseFloat(styles.outlineWidth)
		};
	});
	expect(outline.style, `${label} outline style`).not.toBe('none');
	expect(outline.color, `${label} outline color`).not.toBe('rgba(0, 0, 0, 0)');
	expect(outline.width, `${label} outline width`).toBeGreaterThanOrEqual(2);
}

test('Other Gear supports bounded search, stable row editing, notes, and bulk editing', async ({
	page
}, testInfo) => {
	test.setTimeout(20_000);
	test.skip(testInfo.project.name === 'Mobile Chrome', 'Desktop bounded-list behavior.');
	await openSaturatedSheet(page);
	const sheet = page.getByRole('main', { name: '2014 character sheet' });
	for (const regionName of ['Overview', 'Runtime', 'Organizational']) {
		await expect(sheet.getByRole('button', { name: regionName, exact: true })).toBeVisible();
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
	const firstRope = results
		.getByRole('listitem')
		.filter({ hasText: 'Authored detail for campaign gear 1.' });
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

	await secondRopeActions.click();
	await page.getByRole('button', { name: 'Pin', exact: true }).click();
	await expect(secondRopeActions).toBeFocused();
	await expect(secondRope.getByTitle('Pinned')).toBeVisible();
	await secondRopeActions.click();
	await page.getByRole('button', { name: 'Unpin', exact: true }).click();
	await expect(secondRopeActions).toBeFocused();
	await expect(secondRope.getByTitle('Pinned')).toHaveCount(0);

	const managePins = region.getByRole('button', { name: 'Manage Pins' });
	await expect(managePins).toBeVisible();
	await managePins.click();
	const managePinsDialog = page.getByRole('dialog', { name: 'Manage Pins' });
	await expect(managePinsDialog).toBeVisible();
	await expect(managePinsDialog.getByRole('searchbox')).toHaveValue('rope');

	await managePinsDialog
		.getByRole('checkbox', { name: /Authored detail for campaign gear 1\./ })
		.check();
	await managePinsDialog.getByRole('button', { name: 'Save Pins', exact: true }).click();
	await expect(managePinsDialog).not.toBeVisible();
	await expect(managePins).toBeFocused();
	await expect(search).toHaveValue('rope');

	await search.fill('');
	await expect(firstRope.getByTitle('Pinned')).toBeVisible();
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
					)?.source,
					inventoryPins: character?.systemData?.collectionPins?.inventory
				};
			}, storageKey)
		)
		.toEqual({
			first: 'Authored detail for campaign gear 1.',
			second: 'Priority climbing rope.',
			linkedSource: { kind: 'item', id: 'saturated-weapon-1' },
			inventoryPins: ['saturated-gear-1', 'saturated-gear-3', 'saturated-weapon-1']
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
	await expect(
		reloadedRegion
			.getByRole('listitem')
			.filter({ hasText: 'Authored detail for campaign gear 1.' })
			.getByTitle('Pinned')
	).toBeVisible();
});

test('Weapons, Armor & Shields, and Spells share scoped discovery and focused identity', async ({
	page
}, testInfo) => {
	test.setTimeout(30_000);
	test.skip(testInfo.project.name === 'Mobile Chrome', 'Desktop collection rollout behavior.');
	await openSaturatedSheet(page);
	const sheet = page.getByRole('main', { name: '2014 character sheet' });
	for (const regionName of ['Overview', 'Runtime', 'Organizational']) {
		await expect(sheet.getByRole('button', { name: regionName, exact: true })).toBeVisible();
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
	for (const collection of [
		{ region: weapons, title: 'Weapons', target: /Training sword 2/ },
		{ region: armor, title: 'Armor & Shields', target: /Armor set 2/ }
	]) {
		const managePins = collection.region.getByRole('button', { name: 'Manage Pins' });
		await managePins.click();
		const dialog = page.getByRole('dialog', {
			name: `Manage Pins · ${collection.title}`,
			exact: true
		});
		await expect(dialog.getByRole('searchbox')).toBeVisible();
		await dialog.getByRole('checkbox', { name: collection.target }).check();
		await dialog.getByRole('button', { name: 'Save Pins', exact: true }).click();
		await expect(dialog).not.toBeVisible();
		await expect(managePins).toBeFocused();
		await expect(
			collection.region
				.getByRole('listitem')
				.filter({ hasText: collection.target })
				.getByTitle('Pinned')
		).toBeVisible();
	}

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
	await expect(spellResults.getByText('Pinned spells', { exact: true })).toBeVisible();
	await expect(spellResults.getByText('Cantrips', { exact: true })).toHaveCount(0);
	await expect(spellResults.getByText('1st-level spells', { exact: true })).toHaveCount(0);
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
	await levelOneActions.click();
	await page.getByRole('button', { name: 'Unpin', exact: true }).click();
	await expect(levelOneActions).toBeFocused();
	await expect(levelOneShield.getByTitle('Pinned')).toHaveCount(0);
	await expect(spellResults.getByText('Pinned spells', { exact: true })).toBeVisible();
	await expect(spellResults.getByText('1st-level spells', { exact: true })).toBeVisible();
	await levelOneActions.click();
	await page.getByRole('button', { name: 'Pin', exact: true }).click();
	await expect(levelOneActions).toBeFocused();
	await expect(levelOneShield.getByTitle('Pinned')).toBeVisible();
	await expect(spellResults.getByText('1st-level spells', { exact: true })).toHaveCount(0);

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

	await spellSearch.fill('practice spell 5');
	const manageSpellPins = spells.getByRole('button', { name: 'Manage Pins' });
	await manageSpellPins.click();
	const manageSpellPinsDialog = page.getByRole('dialog', {
		name: 'Manage Pins · Spells',
		exact: true
	});
	await expect(manageSpellPinsDialog.getByRole('searchbox')).toHaveValue('practice spell 5');
	await manageSpellPinsDialog.getByRole('checkbox', { name: /Practice spell 5/ }).check();
	await manageSpellPinsDialog.getByRole('button', { name: 'Save Pins', exact: true }).click();
	await expect(manageSpellPinsDialog).not.toBeVisible();
	await expect(manageSpellPins).toBeFocused();
	await spellSearch.fill('');
	const higherLevelPinnedSpell = spellResults.locator('[data-row-key="spell:saturated-spell-5"]');
	await expect(higherLevelPinnedSpell.getByTitle('Pinned')).toBeVisible();
	await expect(higherLevelPinnedSpell).toContainText('Spell level 4 · Not prepared');
	await expect(spellResults.getByText('Pinned spells', { exact: true })).toBeVisible();

	await page.reload();
	const reloadedSpells = page.getByRole('region', { name: 'Spells collection' });
	await expect(
		reloadedSpells.locator('[data-row-key="spell:saturated-spell-5"]').getByTitle('Pinned').first()
	).toBeVisible();

	const reloadedSpellSearch = reloadedSpells.getByRole('searchbox', { name: 'Search Spells' });
	await reloadedSpellSearch.fill('practice spell');
	await runtimeActions.getByRole('button', { name: 'Source actions for Shield reaction' }).click();
	await runtimeActions.getByRole('button', { name: 'View Spell · Shield' }).click();
	await expect(reloadedSpells).toBeFocused();
	await expect(reloadedSpellSearch).toHaveValue('');
});

test('Runtime Actions and supporting collections honor their distinct density limits', async ({
	page
}, testInfo) => {
	test.setTimeout(30_000);
	test.skip(testInfo.project.name === 'Mobile Chrome', 'Desktop bounded-list behavior.');
	await openSaturatedSheet(page);

	const runtimeActions = page.getByRole('region', { name: 'Runtime actions', exact: true });
	const runtimeSearch = runtimeActions.getByRole('searchbox', { name: 'Search Runtime actions' });
	await expect(runtimeActions.getByText('10 items', { exact: true }).first()).toBeVisible();
	await expect(runtimeSearch).toBeVisible();
	await expect(
		runtimeActions.getByRole('region', { name: 'Runtime actions scrollable results' })
	).toBeVisible();
	await runtimeSearch.fill('runtime reminder 8');
	await expect(runtimeActions.getByText('1 of 10 items', { exact: true }).first()).toBeVisible();
	await expect(runtimeActions.getByText('Custom runtime action 8', { exact: true })).toBeVisible();

	const features = page.getByRole('region', { name: 'Features', exact: true });
	const featureSearch = features.getByRole('searchbox', { name: 'Search Features' });
	await expect(features.getByText('18 items', { exact: true }).first()).toBeVisible();
	await featureSearch.fill('class feature 10');
	await expect(features.getByText('1 of 18 items', { exact: true }).first()).toBeVisible();
	await expect(features.getByText('Class feature 10', { exact: true }).first()).toBeVisible();

	const featureActions = features.getByRole('button', { name: 'Card actions' });
	await featureActions.click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	const editDialog = page.getByRole('dialog', { name: 'Edit Fields' });
	await expect(editDialog).toBeVisible();
	await editDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(featureActions).toBeFocused();
	await expect(featureSearch).toHaveValue('class feature 10');

	await featureActions.click();
	await page.getByRole('button', { name: 'Notes', exact: true }).click();
	const notesDialog = page.getByRole('dialog', { name: 'Notes' });
	await notesDialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(featureActions).toBeFocused();

	await featureActions.click();
	await page
		.locator('[popover]:popover-open')
		.getByRole('button', { name: 'Manage Pins', exact: true })
		.click();
	const managePinsDialog = page.getByRole('dialog', { name: 'Manage Pins' });
	await expect(managePinsDialog).toBeVisible();
	await expect(managePinsDialog.getByRole('searchbox')).toHaveValue('class feature 10');
	await managePinsDialog.getByRole('checkbox', { name: /Class feature 10/ }).check();
	await managePinsDialog.getByRole('button', { name: 'Save Pins', exact: true }).click();
	await expect(managePinsDialog).not.toBeVisible();
	await expect(featureActions).toBeFocused();
	await expect(featureSearch).toHaveValue('class feature 10');

	await featureSearch.fill('');
	const pinnedItem = features.getByRole('listitem').filter({ hasText: 'Class feature 10' }).first();
	await expect(pinnedItem.getByTitle('Pinned')).toBeVisible();

	const shortCollections = [
		{ name: 'Traits', count: 7, target: /Ancestry trait 2/ },
		{ name: 'Prof. Languages', count: 5, target: /Draconic/ },
		{ name: 'Prof. Tools', count: 7, target: /Tool proficiency 3/ }
	] as const;
	for (const collection of shortCollections) {
		const region = page.getByRole('region', { name: collection.name, exact: true });
		await expect(
			region.getByText(`${collection.count} items`, { exact: true }).first()
		).toBeVisible();
		await expect(region.getByRole('searchbox')).toHaveCount(0);
		await expect(region.getByRole('button', { name: /Browse all/ })).toHaveCount(0);
		const cardActions = region.getByRole('button', { name: 'Card actions' });
		await cardActions.click();
		await page
			.locator('[popover]:popover-open')
			.getByRole('button', { name: 'Manage Pins', exact: true })
			.click();
		const dialog = page.getByRole('dialog', {
			name: `Manage Pins · ${collection.name}`,
			exact: true
		});
		await expect(dialog.getByRole('searchbox')).toHaveCount(0);
		await dialog.getByRole('checkbox', { name: collection.target }).check();
		await dialog.getByRole('button', { name: 'Save Pins', exact: true }).click();
		await expect(dialog).not.toBeVisible();
		await expect(cardActions).toBeFocused();
		await expect(
			region.getByRole('listitem').filter({ hasText: collection.target }).getByTitle('Pinned')
		).toBeVisible();
	}

	await page.reload();
	await expect(page.getByText('Current HP:', { exact: false })).toBeVisible();
	for (const collection of [
		{ name: 'Features', target: /Class feature 10/ },
		...shortCollections
	]) {
		await expect(
			page
				.getByRole('region', { name: collection.name, exact: true })
				.getByRole('listitem')
				.filter({ hasText: collection.target })
				.getByTitle('Pinned')
		).toBeVisible();
	}
});

test('supporting collection actions and Save Pins expose visible keyboard focus', async ({
	page
}, testInfo) => {
	test.skip(
		testInfo.project.name !== 'chromium',
		'Canonical keyboard traversal is covered in Chromium; WebKit button tabbing follows host preferences.'
	);
	await openSaturatedSheet(page);

	const features = page.getByRole('region', { name: 'Features', exact: true });
	const featureSearch = features.getByRole('searchbox', { name: 'Search Features' });
	const featureActions = features.getByRole('button', { name: 'Card actions' });
	await featureSearch.fill('class feature 10');

	await page.keyboard.press('Shift+Tab');
	await expectVisibleKeyboardFocus(featureActions, 'Supporting Collection Card actions');
	await page.keyboard.press('Enter');

	const menu = page.locator('[popover]:popover-open');
	await page.keyboard.press('Tab');
	await expect(menu.getByRole('button', { name: 'Edit', exact: true })).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(menu.getByRole('button', { name: 'Notes', exact: true })).toBeFocused();
	await page.keyboard.press('Tab');
	const managePins = menu.getByRole('button', { name: 'Manage Pins', exact: true });
	await expect(managePins).toBeFocused();
	await page.keyboard.press('Enter');

	const dialog = page.getByRole('dialog', { name: 'Manage Pins · Features', exact: true });
	await expect(
		dialog.getByRole('heading', { name: 'Manage Pins · Features', exact: true })
	).toBeFocused();
	await page.keyboard.press('Tab');
	const dialogSearch = dialog.getByRole('searchbox', { name: 'Search Features' });
	await expect(dialogSearch).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(dialog.getByRole('button', { name: 'Clear search' })).toBeFocused();
	await page.keyboard.press('Tab');
	const checkbox = dialog.getByRole('checkbox', { name: /Class feature 10/ });
	await expect(checkbox).toBeFocused();
	await page.keyboard.press('Space');
	await page.keyboard.press('Tab');
	await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
	await page.keyboard.press('Tab');
	const savePins = dialog.getByRole('button', { name: 'Save Pins', exact: true });
	await expectVisibleKeyboardFocus(savePins, 'Save Pins');
	await page.keyboard.press('Enter');

	await expect(dialog).not.toBeVisible();
	await expectVisibleKeyboardFocus(featureActions, 'Restored Supporting Collection Card actions');

	await page.keyboard.press('Enter');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	const reopenedDialog = page.getByRole('dialog', {
		name: 'Manage Pins · Features',
		exact: true
	});
	const reopenedCheckbox = reopenedDialog.getByRole('checkbox', { name: /Class feature 10/ });
	await expect(reopenedCheckbox).toBeChecked();
	await reopenedCheckbox.focus();
	await page.keyboard.press('Space');
	await expect(reopenedCheckbox).not.toBeChecked();
	await page.keyboard.press('Escape');
	await expect(reopenedDialog).not.toBeVisible();
	await expect(featureActions).toBeFocused();

	await featureActions.click();
	await page
		.locator('[popover]:popover-open')
		.getByRole('button', { name: 'Manage Pins', exact: true })
		.click();
	const retainedDialog = page.getByRole('dialog', {
		name: 'Manage Pins · Features',
		exact: true
	});
	await expect(retainedDialog.getByRole('checkbox', { name: /Class feature 10/ })).toBeChecked();
	await retainedDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(retainedDialog).not.toBeVisible();
	await expect(featureActions).toBeFocused();
});

test('saturated priority state survives application JSON export and replacement restore', async ({
	page
}, testInfo) => {
	test.setTimeout(20_000);
	test.skip(
		testInfo.project.name !== 'chromium',
		'One Chromium black-box backup proof is sufficient.'
	);
	await openSaturatedSheet(page);

	const languages = page.getByRole('region', { name: 'Prof. Languages', exact: true });
	const languageActions = languages.getByRole('button', { name: 'Card actions' });
	await languageActions.click();
	await page
		.locator('[popover]:popover-open')
		.getByRole('button', { name: 'Manage Pins', exact: true })
		.click();
	let dialog = page.getByRole('dialog', {
		name: 'Manage Pins · Prof. Languages',
		exact: true
	});
	const draconicChoice = dialog.getByRole('checkbox', { name: /Draconic/ });
	await draconicChoice.check();
	await dialog.getByRole('button', { name: 'Save Pins', exact: true }).click();
	await expect(
		languages.getByRole('listitem').filter({ hasText: 'Draconic' }).getByTitle('Pinned')
	).toBeVisible();

	await page.goto('/');
	await page.getByRole('button', { name: 'Export Characters' }).click();
	const exportDialog = page.getByRole('dialog', { name: 'Export Characters' });
	const downloadPromise = page.waitForEvent('download');
	await exportDialog.getByRole('button', { name: 'Export' }).click();
	const download = await downloadPromise;
	const backupPath = testInfo.outputPath('saturated-priority-backup.json');
	await download.saveAs(backupPath);

	await page.getByRole('button', { name: 'Open Saturated Playtest Adventurer' }).click();
	const changedLanguages = page.getByRole('region', { name: 'Prof. Languages', exact: true });
	await changedLanguages.getByRole('button', { name: 'Card actions' }).click();
	await page
		.locator('[popover]:popover-open')
		.getByRole('button', { name: 'Manage Pins', exact: true })
		.click();
	dialog = page.getByRole('dialog', {
		name: 'Manage Pins · Prof. Languages',
		exact: true
	});
	await dialog.getByRole('checkbox', { name: /Draconic/ }).uncheck();
	await dialog.getByRole('button', { name: 'Save Pins', exact: true }).click();
	await expect(
		changedLanguages.getByRole('listitem').filter({ hasText: 'Draconic' }).getByTitle('Pinned')
	).toHaveCount(0);

	await page.goto('/');
	const fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles(backupPath);
	const importDialog = page.getByRole('dialog', { name: 'Import Characters' });
	await expect(importDialog.getByText('Ready to import 1 character')).toBeVisible();
	await importDialog.getByRole('button', { name: 'Replace All' }).click();
	await expect(
		importDialog.getByText('Replaced local characters with 1 imported character')
	).toBeVisible();
	await importDialog.getByRole('button', { name: 'Done' }).click();

	await page.getByRole('button', { name: 'Open Saturated Playtest Adventurer' }).click();
	await expect(
		page
			.getByRole('region', { name: 'Prof. Languages', exact: true })
			.getByRole('listitem')
			.filter({ hasText: 'Draconic' })
			.getByTitle('Pinned')
	).toBeVisible();
});

test('phone previews expose domain-specific limits and focused collections with one scroll owner', async ({
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

	const spellsRegion = page.getByRole('region', { name: 'Spells collection' });
	const browseSpells = spellsRegion.getByRole('button', { name: 'Browse all 28 items' });
	await browseSpells.click();
	const spellsDialog = page.getByRole('dialog', { name: 'Spells', exact: true });
	const spellsDialogSearch = spellsDialog.getByRole('searchbox', { name: 'Search Spells' });
	await spellsDialogSearch.fill('practice spell 5');
	const higherLevelSpell = spellsDialog.locator('[data-row-key="spell:saturated-spell-5"]');
	const higherLevelSpellActions = higherLevelSpell.getByRole('button', {
		name: /Row actions for Practice spell 5/
	});
	await higherLevelSpellActions.click();
	const pinHigherLevelSpell = page.getByRole('button', { name: 'Pin', exact: true });
	await expectMinimumTouchTarget(pinHigherLevelSpell, 'Spell row Pin command');
	await pinHigherLevelSpell.click();
	await expect(higherLevelSpellActions).toBeFocused();
	await expect(higherLevelSpell.getByTitle('Pinned')).toBeVisible();
	await spellsDialog.getByRole('button', { name: 'Close Spells' }).click();
	await expect(browseSpells).toBeFocused();
	await expect(
		spellsRegion
			.getByRole('list', { name: 'Spells preview' })
			.locator('[data-row-key="spell:saturated-spell-5"]')
			.getByTitle('Pinned')
	).toBeVisible();

	const runtimeActions = page.getByRole('region', { name: 'Runtime actions', exact: true });
	await expect(
		runtimeActions.getByRole('list', { name: 'Runtime actions preview' }).getByRole('listitem')
	).toHaveCount(5);
	const browseRuntimeActions = runtimeActions.getByRole('button', {
		name: 'Browse all 10 items'
	});
	await browseRuntimeActions.click();
	const runtimeDialog = page.getByRole('dialog', { name: 'Runtime actions' });
	const runtimeDialogSearch = runtimeDialog.getByRole('searchbox', {
		name: 'Search Runtime actions'
	});
	await expect(runtimeDialog.getByRole('button', { name: 'Add action' })).toBeVisible();
	await runtimeDialogSearch.fill('runtime reminder 8');
	await expect(runtimeDialog.getByText('Custom runtime action 8', { exact: true })).toBeVisible();
	const focusedRuntimeActions = runtimeDialog.getByRole('button', { name: 'Card actions' });
	await focusedRuntimeActions.click();
	await page.getByRole('button', { name: 'Notes', exact: true }).click();
	const runtimeNotes = page.getByRole('dialog', { name: 'Notes' });
	await runtimeNotes.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(focusedRuntimeActions).toBeFocused();
	await expect(runtimeDialogSearch).toHaveValue('runtime reminder 8');

	await runtimeDialogSearch.fill('longsword');
	await runtimeDialog.getByRole('button', { name: 'Source actions for Longsword attack' }).click();
	await runtimeDialog.getByRole('button', { name: 'View Inventory · Longsword' }).click();
	await expect(runtimeDialog).not.toBeVisible();
	await expect(page.getByRole('region', { name: 'Weapons inventory' })).toBeFocused();

	const features = page.getByRole('region', { name: 'Features', exact: true });
	await expect(
		features.getByRole('list', { name: 'Features preview' }).getByRole('listitem')
	).toHaveCount(7);
	const browseFeatures = features.getByRole('button', { name: 'Browse all 18 items' });
	await browseFeatures.click();
	const featuresDialog = page.getByRole('dialog', { name: 'Features' });
	const featuresSearch = featuresDialog.getByRole('searchbox', { name: 'Search Features' });
	await featuresSearch.fill('wizard class feature 10');
	await expect(featuresDialog.getByText('Class feature 10', { exact: true })).toBeVisible();
	const focusedFeatureActions = featuresDialog.getByRole('button', { name: 'Card actions' });
	await focusedFeatureActions.click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	const focusedEditDialog = page.getByRole('dialog', { name: 'Edit Fields' });
	await focusedEditDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(focusedFeatureActions).toBeFocused();
	await expect(featuresSearch).toHaveValue('wizard class feature 10');
	await featuresDialog.getByRole('button', { name: 'Close Features' }).click();
	await expect(browseFeatures).toBeFocused();
});

test('structured form modal editing supports external form submission, array item addition, and array item removal', async ({
	page
}, testInfo) => {
	test.skip(testInfo.project.name === 'Mobile Chrome', 'Desktop collection editing behavior.');

	await openSaturatedSheet(page);
	const region = page.getByRole('region', { name: 'Prof. Languages', exact: true });
	await expect(region.getByText('5 items', { exact: true }).first()).toBeVisible();

	const cardActions = region.getByRole('button', { name: 'Card actions' });
	await cardActions.click();
	await page
		.locator('[popover]:popover-open')
		.getByRole('button', { name: 'Edit', exact: true })
		.click();

	const editDialog = page.getByRole('dialog', { name: 'Edit Fields' });
	await expect(editDialog).toBeVisible();

	// Verify external form submission association
	const saveBtn = editDialog.getByRole('button', { name: 'Save', exact: true });
	await expect(saveBtn).toHaveAttribute('form', 'structured-edit-form');

	// Verify array item addition
	const addBtn = editDialog.getByRole('button', { name: 'Add Language' });
	await expect(addBtn).toBeVisible();
	const inputs = editDialog.getByRole('textbox', { name: 'Languages Name' });
	await expect(inputs).toHaveCount(5);

	await addBtn.click();
	await expect(inputs).toHaveCount(6);
	await inputs.nth(5).fill('Deep Speech');

	// Save via external form submission button
	await saveBtn.click();
	await expect(editDialog).not.toBeVisible();
	await expect(cardActions).toBeFocused();
	await expect(region.getByText('6 items', { exact: true }).first()).toBeVisible();
	await expect(region.getByText('Deep Speech', { exact: true }).first()).toBeVisible();

	// Verify array item removal
	await cardActions.click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	await expect(editDialog).toBeVisible();

	const removeBtns = editDialog.getByRole('button', { name: 'Remove' });
	await expect(removeBtns).toHaveCount(6);
	await removeBtns.nth(5).click();
	await expect(editDialog.getByRole('textbox', { name: 'Languages Name' })).toHaveCount(5);

	// Save again
	await editDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(editDialog).not.toBeVisible();
	await expect(cardActions).toBeFocused();
	await expect(region.getByText('5 items', { exact: true }).first()).toBeVisible();
	await expect(region.getByText('Deep Speech', { exact: true })).toHaveCount(0);
});
