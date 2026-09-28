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
	await expect(page.getByText('Current HP', { exact: true }).first()).toBeVisible();
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

test('Other Gear supports bounded search, focused editing, notes, and priority', async ({
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
	await expect(region.getByRole('button', { name: 'Add Other Gear' })).toBeVisible();
	await expect(region.getByRole('button', { name: 'Bulk Edit Other Gear' })).toHaveCount(0);
	await expect(results).toBeVisible();
	const scrollRegion = region.getByRole('region', { name: 'Other Gear scrollable results' });
	const dimensions = await scrollRegion.evaluate((element) => ({
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
	const secondRopeDetail = secondRope.getByRole('button', { name: /^View Rope.*details$/ });
	await secondRopeDetail.click();
	const ropeDialog = page.getByRole('dialog', { name: 'Rope', exact: true });
	await ropeDialog.getByRole('button', { name: 'Edit Detail', exact: true }).click();
	await ropeDialog
		.getByRole('textbox', { name: 'Detail', exact: true })
		.fill('Priority climbing rope.');
	await ropeDialog.getByRole('button', { name: 'Save Detail', exact: true }).click();
	await expect(ropeDialog.getByRole('region', { name: 'Detail', exact: true })).toContainText(
		'Priority climbing rope.'
	);
	await ropeDialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(secondRopeDetail).toBeFocused();
	await expect(search).toHaveValue('rope');
	await expect(secondRope.getByText('Priority climbing rope.')).toBeVisible();

	const pinSecondRope = secondRope.getByRole('button', { name: /^Pin Rope/ });
	await pinSecondRope.click();
	const unpinSecondRope = secondRope.getByRole('button', { name: /^Unpin Rope/ });
	await expect(unpinSecondRope).toBeFocused();
	await expect(secondRope.getByTitle('Pinned')).toBeVisible();
	await unpinSecondRope.click();
	await expect(secondRope.getByRole('button', { name: /^Pin Rope/ })).toBeFocused();
	await expect(secondRope.getByTitle('Pinned')).toHaveCount(0);

	await expect(region.getByRole('button', { name: 'Manage Pins' })).toHaveCount(0);
	const pinFirstRope = firstRope.getByRole('button', { name: /^Pin Rope/ });
	await pinFirstRope.click();
	await expect(firstRope.getByRole('button', { name: /^Unpin Rope/ })).toBeFocused();
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
	const rockDetail = rock.getByRole('button', { name: /^View Random rock.*details$/ });
	await rockDetail.click();
	const rockDialog = page.getByRole('dialog', { name: 'Random rock', exact: true });
	await rockDialog.getByRole('button', { name: '1 note', exact: true }).click();
	await rockDialog.getByRole('button', { name: /^Edit note/ }).click();
	await rockDialog
		.getByRole('textbox', { name: 'Text (optional)' })
		.fill('Confirmed magical during the saturated rehearsal.');
	await rockDialog.getByRole('button', { name: 'Save note', exact: true }).click();
	await expect(
		rockDialog.getByText('Confirmed magical during the saturated rehearsal.')
	).toBeVisible();
	await rockDialog.getByRole('button', { name: 'Close' }).click();
	await expect(rockDetail).toBeFocused();
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
	await expect(weapons.getByRole('button', { name: 'Add Weapons' })).toBeVisible();
	await expect(armor.getByRole('button', { name: 'Add Armor & Shields' })).toBeVisible();
	await expect(weapons.getByRole('button', { name: 'Bulk Edit Weapons' })).toHaveCount(0);
	await expect(armor.getByRole('button', { name: 'Bulk Edit Armor & Shields' })).toHaveCount(0);
	for (const collection of [
		{ region: weapons, target: /Training sword 2/, pinName: /^Pin Training sword 2/ },
		{ region: armor, target: /Armor set 2/, pinName: /^Pin Armor set 2/ }
	]) {
		await expect(collection.region.getByRole('button', { name: 'Manage Pins' })).toHaveCount(0);
		const row = collection.region.getByRole('listitem').filter({ hasText: collection.target });
		await row.getByRole('button', { name: collection.pinName }).click();
		await expect(row.getByTitle('Pinned')).toBeVisible();
	}

	const spellcasting = page.getByRole('region', { name: 'Spellcasting summary' });
	const spellSlots = page.getByRole('region', { name: 'Spell slots', exact: true });
	await expect(page.getByRole('heading', { name: 'Spellcasting', exact: true })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Spell Slots', exact: true })).toHaveCount(0);
	await expect(spellcasting).toContainText(/Ability\s+int.*Save DC\s+16.*Attack Bonus\s+8/i);
	await expect(
		spellSlots.getByRole('region', { name: '1st spell slots', exact: true })
	).toBeVisible();
	await expect(
		spellSlots.getByRole('region', { name: '9th spell slots', exact: true })
	).toBeVisible();
	await expect(spellSlots).toContainText('1 Used');
	await expect(spellSlots).toContainText('4 Max');
	await expect(spellSlots).toContainText('0 Used');
	await expect(spellSlots).toContainText('0 Max');
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
	const addSpell = spells.getByRole('button', { name: 'Add Spells' });
	await addSpell.click();
	const addDialog = page.getByRole('dialog', { name: 'Add Spells' });
	await expect(addDialog.getByLabel('Name', { exact: true })).toBeVisible();
	await addDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(addSpell).toBeFocused();

	await spellSearch.fill('shield');
	await expect(spells.getByText('2 of 28 items', { exact: true }).first()).toBeVisible();
	const spellResults = spells.getByRole('list', { name: 'Spells results' });
	await expect(spellResults.locator('[data-row-key^="spell:"]')).toHaveCount(2);
	await expect(spellResults.getByText('Pinned spells', { exact: true })).toBeVisible();
	await expect(spellResults.getByText('Cantrips', { exact: true })).toHaveCount(0);
	await expect(spellResults.getByText('1st-level spells', { exact: true })).toHaveCount(0);
	await expect(spellResults.getByText('Cantrip', { exact: true })).toBeVisible();
	await expect(spellResults.getByText('Prepared', { exact: true })).toBeVisible();
	await expect(spellResults.getByText('Spell level 1', { exact: true })).toBeVisible();

	const levelOneShield = spellResults.locator('[data-row-key="spell:saturated-spell-12"]');
	const levelOneDetail = levelOneShield.getByRole('button', { name: /^View Shield.*details$/ });
	await levelOneDetail.click();
	const shieldDialog = page.getByRole('dialog', { name: 'Shield', exact: true });
	await shieldDialog.getByRole('button', { name: 'Edit Authored detail', exact: true }).click();
	await shieldDialog
		.getByRole('textbox', { name: 'Authored detail', exact: true })
		.fill('Priority level-one shield.');
	await shieldDialog.getByRole('button', { name: 'Save Authored detail', exact: true }).click();
	await shieldDialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(levelOneDetail).toBeFocused();
	await expect(spellSearch).toHaveValue('shield');
	const unpinLevelOneShield = levelOneShield.getByRole('button', { name: /^Unpin Shield/ });
	await unpinLevelOneShield.click();
	await expect(levelOneShield.getByRole('button', { name: /^Pin Shield/ })).toBeFocused();
	await expect(levelOneShield.getByTitle('Pinned')).toHaveCount(0);
	await expect(spellResults.getByText('Pinned spells', { exact: true })).toBeVisible();
	await expect(spellResults.getByText('1st-level spells', { exact: true })).toBeVisible();
	await levelOneShield.getByRole('button', { name: /^Pin Shield/ }).click();
	await expect(levelOneShield.getByRole('button', { name: /^Unpin Shield/ })).toBeFocused();
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
	const higherLevelPinnedSpell = spellResults.locator('[data-row-key="spell:saturated-spell-5"]');
	await higherLevelPinnedSpell.getByRole('button', { name: /^Pin Practice spell 5/ }).click();
	await expect(
		higherLevelPinnedSpell.getByRole('button', { name: /^Unpin Practice spell 5/ })
	).toBeFocused();
	await expect(spellSearch).toHaveValue('practice spell 5');
	await spellSearch.fill('');
	await expect(higherLevelPinnedSpell.getByTitle('Pinned')).toBeVisible();
	await expect(higherLevelPinnedSpell).toContainText('Spell level 4');
	await expect(higherLevelPinnedSpell.getByText('Prepared', { exact: true })).toHaveCount(0);
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
	await expect(page.getByRole('region', { name: 'Spellcasting section' })).toBeFocused();
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

	const featureRow = features.getByRole('listitem').filter({ hasText: 'Class feature 10' }).first();
	const featureDetail = featureRow.getByRole('button', { name: 'View Class feature 10 details' });
	await featureDetail.click();
	const featureDialog = page.getByRole('dialog', { name: 'Class feature 10', exact: true });
	await expect(
		featureDialog.getByRole('button', { name: 'Add note for Name', exact: true })
	).toBeVisible();
	await featureDialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
	await featureDialog.getByRole('button', { name: 'Cancel Name edit', exact: true }).click();
	await expect(featureDialog.getByRole('region', { name: 'Name', exact: true })).toContainText(
		'Class feature 10'
	);
	await featureDialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(featureDetail).toBeFocused();
	await expect(featureSearch).toHaveValue('class feature 10');

	await expect(features.getByRole('button', { name: 'Manage Pins' })).toHaveCount(0);
	await featureRow.getByRole('button', { name: 'Pin Class feature 10' }).click();
	await expect(featureRow.getByRole('button', { name: 'Unpin Class feature 10' })).toBeFocused();
	await expect(featureSearch).toHaveValue('class feature 10');

	await featureSearch.fill('');
	const pinnedItem = features.getByRole('listitem').filter({ hasText: 'Class feature 10' }).first();
	await expect(pinnedItem.getByTitle('Pinned')).toBeVisible();

	const shortCollections = [
		{ name: 'Traits', count: 7, target: /Ancestry trait 2/ },
		{ name: 'Prof. Languages', count: 5, target: /Draconic/ },
		{ name: 'Prof. Tools', count: 7, target: /Tool proficiency 3/ }
	] as const;
	for (const name of ['Traits', 'Prof. Languages', 'Prof. Tools']) {
		await expect(
			page.getByRole('region', { name, exact: true }).getByRole('button', { name: `Add ${name}` })
		).toBeVisible();
	}
	for (const collection of shortCollections) {
		const region = page.getByRole('region', { name: collection.name, exact: true });
		await expect(
			region.getByText(`${collection.count} items`, { exact: true }).first()
		).toBeVisible();
		await expect(region.getByRole('searchbox')).toHaveCount(0);
		await expect(region.getByRole('button', { name: /Browse all/ })).toHaveCount(0);
		await expect(region.getByRole('button', { name: 'Manage Pins' })).toHaveCount(0);
		const row = region.getByRole('listitem').filter({ hasText: collection.target });
		await row.getByRole('button', { name: /^Pin / }).click();
		await expect(row.getByTitle('Pinned')).toBeVisible();
	}

	await page.reload();
	await expect(page.getByText('Current HP', { exact: true }).first()).toBeVisible();
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

test('supporting collection row-level Pin exposes visible keyboard focus', async ({
	page
}, testInfo) => {
	test.skip(
		testInfo.project.name !== 'chromium',
		'Canonical keyboard traversal is covered in Chromium; WebKit button tabbing follows host preferences.'
	);
	await openSaturatedSheet(page);

	const features = page.getByRole('region', { name: 'Features', exact: true });
	const featureSearch = features.getByRole('searchbox', { name: 'Search Features' });
	await featureSearch.fill('class feature 10');
	await expect(features.getByRole('button', { name: 'Manage Pins' })).toHaveCount(0);
	const featureRow = features.getByRole('listitem').filter({ hasText: 'Class feature 10' });
	const pin = featureRow.getByRole('button', { name: 'Pin Class feature 10' });
	await pin.focus();
	await expectVisibleKeyboardFocus(pin, 'Supporting Collection Pin');
	await page.keyboard.press('Enter');
	const unpin = featureRow.getByRole('button', { name: 'Unpin Class feature 10' });
	await expectVisibleKeyboardFocus(unpin, 'Supporting Collection Unpin after movement');
	await page.keyboard.press('Enter');
	await expectVisibleKeyboardFocus(
		featureRow.getByRole('button', { name: 'Pin Class feature 10' }),
		'Restored Supporting Collection Pin after movement'
	);
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
	const draconicRow = languages.getByRole('listitem').filter({ hasText: 'Draconic' });
	await draconicRow.getByRole('button', { name: 'Pin Draconic' }).click();
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
	await changedLanguages
		.getByRole('listitem')
		.filter({ hasText: 'Draconic' })
		.getByRole('button', { name: 'Unpin Draconic' })
		.click();
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
		await expect(familyRegion.getByRole('button', { name: `Add ${family.title}` })).toBeVisible();
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
	const rowDetail = row.getByRole('button', { name: /^View Random rock.*details$/ });
	await expectMinimumTouchTarget(rowDetail, 'Other Gear row detail');
	await rowDetail.click();
	const detailDialog = page.getByRole('dialog', { name: 'Random rock', exact: true });
	await detailDialog.getByRole('button', { name: 'Edit Detail', exact: true }).click();
	await detailDialog
		.getByRole('textbox', { name: 'Detail', exact: true })
		.fill('Phone rehearsal detail.');
	await detailDialog.getByRole('button', { name: 'Save Detail', exact: true }).click();
	await detailDialog.getByRole('button', { name: 'Back' }).click();
	await expect(dialog).toBeVisible();
	await expect(rowDetail).toBeFocused();
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
	const pinHigherLevelSpell = higherLevelSpell.getByRole('button', {
		name: /^Pin Practice spell 5/
	});
	await expectMinimumTouchTarget(pinHigherLevelSpell, 'Spell row Pin command');
	await pinHigherLevelSpell.click();
	await expect(
		higherLevelSpell.getByRole('button', { name: /^Unpin Practice spell 5/ })
	).toBeFocused();
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
	const runtimeDetail = runtimeDialog.getByRole('button', {
		name: 'View Custom runtime action 8 details'
	});
	await runtimeDetail.click();
	const runtimeDetailDialog = page.getByRole('dialog', {
		name: 'Custom runtime action 8',
		exact: true
	});
	await expect(
		runtimeDetailDialog.getByRole('button', { name: 'Add note for Name', exact: true })
	).toBeVisible();
	await runtimeDetailDialog.getByRole('button', { name: 'Back' }).click();
	await expect(runtimeDetail).toBeFocused();
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
	const focusedFeatureDetail = featuresDialog.getByRole('button', {
		name: 'View Class feature 10 details'
	});
	await focusedFeatureDetail.click();
	const focusedFeatureDialog = page.getByRole('dialog', {
		name: 'Class feature 10',
		exact: true
	});
	await focusedFeatureDialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
	await focusedFeatureDialog.getByRole('button', { name: 'Cancel Name edit', exact: true }).click();
	await focusedFeatureDialog.getByRole('button', { name: 'Back' }).click();
	await expect(focusedFeatureDetail).toBeFocused();
	await expect(featuresSearch).toHaveValue('wizard class feature 10');
	await featuresDialog.getByRole('button', { name: 'Close Features' }).click();
	await expect(browseFeatures).toBeFocused();
});

test('supporting collections add, edit, and remove one focused record at a time', async ({
	page
}, testInfo) => {
	test.setTimeout(30_000);
	test.skip(testInfo.project.name === 'Mobile Chrome', 'Desktop focused-record behavior.');

	await openSaturatedSheet(page);
	const region = page.getByRole('region', { name: 'Prof. Languages', exact: true });
	await expect(region.getByText('5 items', { exact: true }).first()).toBeVisible();

	const addLanguage = region.getByRole('button', { name: 'Add Prof. Languages' });
	await addLanguage.click();
	const addDialog = page.getByRole('dialog', { name: 'Add Prof. Languages' });
	await addDialog.getByLabel('Name', { exact: true }).fill('Deep Speech');
	await addDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(addDialog).not.toBeVisible();
	await expect(addLanguage).toBeFocused();
	await expect(region.getByText('6 items', { exact: true }).first()).toBeVisible();
	await expect(region.getByText('Deep Speech', { exact: true }).first()).toBeVisible();

	let row = region.getByRole('listitem').filter({ hasText: 'Deep Speech' }).first();
	let detail = row.getByRole('button', { name: 'View Deep Speech details' });
	await detail.click();
	let detailDialog = page.getByRole('dialog', { name: 'Deep Speech', exact: true });
	await detailDialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
	await detailDialog
		.getByRole('textbox', { name: 'Name', exact: true })
		.fill('Deep Speech Revised');
	await detailDialog.getByRole('button', { name: 'Save Name', exact: true }).click();
	detailDialog = page.getByRole('dialog', { name: 'Deep Speech Revised', exact: true });
	await detailDialog.getByRole('button', { name: 'Close', exact: true }).click();

	row = region.getByRole('listitem').filter({ hasText: 'Deep Speech Revised' }).first();
	detail = row.getByRole('button', { name: 'View Deep Speech Revised details' });
	await expect(detail).toBeFocused();
	await detail.click();
	detailDialog = page.getByRole('dialog', { name: 'Deep Speech Revised', exact: true });
	await detailDialog.getByRole('button', { name: 'Remove Deep Speech Revised' }).click();
	await detailDialog.getByRole('button', { name: 'Confirm removal', exact: true }).click();
	await expect(detailDialog).not.toBeVisible();
	await expect(addLanguage).toBeFocused();
	await expect(region.getByText('5 items', { exact: true }).first()).toBeVisible();
	await expect(region.getByText('Deep Speech Revised', { exact: true })).toHaveCount(0);

	const traits = page.getByRole('region', { name: 'Traits', exact: true });
	const addTrait = traits.getByRole('button', { name: 'Add Traits' });
	await addTrait.click();
	const addTraitDialog = page.getByRole('dialog', { name: 'Add Traits' });
	await addTraitDialog.getByLabel('Name', { exact: true }).fill('Keen Senses');
	await addTraitDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(addTraitDialog).not.toBeVisible();
	await expect(addTrait).toBeFocused();
	await traits.getByRole('searchbox', { name: 'Search Traits' }).fill('Keen Senses');
	const traitRow = traits.getByRole('listitem').filter({ hasText: 'Keen Senses' });
	await traitRow.getByRole('button', { name: 'View Keen Senses details' }).click();
	const traitDialog = page.getByRole('dialog', { name: 'Keen Senses', exact: true });
	await expect(traitDialog.getByRole('button', { name: /Remove/ })).toHaveCount(0);
});
