// Real-route evidence complements the isolated production-backed catalog examples.
import { expect, test } from '@playwright/test';
import { e2eCharacter } from './fixtures/characters';
import {
	representativeCharacter5e2024,
	sparseCharacter5e2024,
	saturatedCharacter5e2024
} from '../src/fixtures/characters-5e2024';
import { installBrowserErrorGuard, expectNoBrowserErrors } from './browserTestGuards';

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(
		(characters) => {
			if (localStorage.getItem('ez-chars.characters.v1') === null)
				localStorage.setItem('ez-chars.characters.v1', JSON.stringify({ version: 1, characters }));
		},
		[e2eCharacter, representativeCharacter5e2024, sparseCharacter5e2024, saturatedCharacter5e2024]
	);
});
test.afterEach(({ page }) => expectNoBrowserErrors(page));

for (const { route, character, sheetName, characterName } of [
	{
		route: '5e',
		character: e2eCharacter,
		sheetName: '2014 character sheet',
		characterName: 'E2E Test Adventurer'
	},
	{
		route: '5e2024',
		character: representativeCharacter5e2024,
		sheetName: '2024 character sheet',
		characterName: 'Mira — 2024 Representative'
	}
]) {
	test(`direct sheet load and refresh preserves ${route} character selection`, async ({ page }) => {
		const path = `/ez-chars/charsheets/${route}?id=${character.meta.id}`;
		await page.goto(path);
		const sheet = page.getByRole('main', { name: sheetName, exact: true });
		await expect(sheet).toBeVisible();
		await expect(sheet.getByText(characterName, { exact: true })).toBeVisible();
		await page.reload();
		await expect(page).toHaveURL(new RegExp(`${path.replace('?', '\\?')}$`));
		await expect(sheet).toBeVisible();
		await expect(sheet.getByText(characterName, { exact: true })).toBeVisible();
	});
}

test('2024 compact classes retain notes and combined feats retain their own records', async ({
	page
}) => {
	await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-representative');
	const dialog = page.getByRole('dialog').filter({ visible: true });
	const classes = page.getByRole('region', { name: 'Classes', exact: true });
	await classes
		.getByRole('button', { name: /^Open Wizard(?:,|$)/ })
		.filter({ visible: true })
		.click();
	await dialog.getByRole('button', { name: 'Add note for Level', exact: true }).click();
	await dialog
		.getByRole('textbox', { name: 'Text (optional)', exact: true })
		.fill('Review next level');
	await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(
		classes.getByText('1 note', { exact: true }).filter({ visible: true })
	).toBeVisible();
	const features = page.getByRole('region', { name: 'Features & Feats', exact: true });
	await features.getByRole('button', { name: 'Add Features & Feats', exact: true }).click();
	await dialog
		.getByRole('combobox', { name: 'Record type', exact: true })
		.selectOption({ label: 'Feat' });
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Remembered feat');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await features
		.getByRole('button', { name: /^Pin Remembered feat/ })
		.filter({ visible: true })
		.click();
	await page.reload();
	await expect(
		features.getByRole('button', { name: /^Unpin Remembered feat/ }).filter({ visible: true })
	).toBeVisible();
	await classes
		.getByRole('button', { name: /^Open Wizard(?:,|$)/ })
		.filter({ visible: true })
		.click();
	await dialog.getByRole('button', { name: '1 note', exact: true }).click();
	await expect(dialog.getByText('Review next level', { exact: true })).toBeVisible();
});

test('2024 optional regions support focused authorship, spell sources and reload', async ({
	page
}) => {
	await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-sparse');
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await page.getByRole('button', { name: 'Add Classes', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Wizard');
	await dialog.getByRole('spinbutton', { name: 'Level', exact: true }).fill('3');
	await dialog.getByRole('textbox', { name: 'Subclass', exact: true }).fill('Evoker');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await page.getByRole('button', { name: 'View INT', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Score', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Score', exact: true }).fill('16');
	await dialog.getByRole('button', { name: 'Save Score', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Arcana: Proficiency', exact: true }).click();
	await dialog
		.getByRole('combobox', { name: 'Arcana: Proficiency', exact: true })
		.selectOption('Expertise');
	await dialog.getByRole('button', { name: 'Save Arcana: Proficiency', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page.getByRole('img', { name: 'Arcana: Expertise', exact: true })).toBeVisible();
	await expect(page.getByText('Expertise (×2, skills only)', { exact: false })).toBeVisible();
	const slot = page.getByRole('region', { name: 'Level 1 spell slots', exact: true });
	await slot.getByRole('button', { name: 'View Level 1', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Max', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Max', exact: true }).fill('2');
	await dialog.getByRole('button', { name: 'Save Max', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.getByRole('button', { name: 'Add Spells', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Test ward');
	await dialog.getByRole('spinbutton', { name: 'Level', exact: true }).fill('1');
	await dialog.getByRole('checkbox', { name: 'Prepared', exact: true }).check();
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await page.getByRole('button', { name: 'Add Runtime Actions', exact: true }).click();
	await dialog.getByRole('button', { name: /^Open Test ward(?:,|$)/ }).click();
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Ward response');
	await dialog.getByRole('button', { name: 'Confirm Action', exact: true }).click();
	await page.reload();
	await page
		.getByRole('button', { name: /^Open Ward response(?:,|$)/ })
		.filter({ visible: true })
		.click();
	await dialog.getByRole('button', { name: 'View source', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Level', exact: true }).click();
	await expect(dialog.getByRole('spinbutton', { name: 'Level', exact: true })).toHaveValue('1');
	await dialog.getByRole('button', { name: 'Cancel Level edit', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page.getByText('Evoker', { exact: true }).filter({ visible: true })).toBeVisible();
	await slot.getByRole('button', { name: 'View Max', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Max', exact: true }).click();
	await expect(dialog.getByRole('spinbutton', { name: 'Max', exact: true })).toHaveValue('2');
});

test('2024 saturated spells compose level, Prepared and text filters within phone bounds', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-saturated');
	const spells = page.getByRole('region', { name: 'Spells', exact: true });
	await spells
		.getByRole('button', { name: 'Level 2', exact: true })
		.filter({ visible: true })
		.click();
	await spells
		.getByRole('button', { name: 'Prepared only', exact: true })
		.filter({ visible: true })
		.click();
	await spells
		.getByRole('searchbox', { name: 'Search Spells', exact: true })
		.filter({ visible: true })
		.fill('Practice spell 13');
	await expect(
		spells.getByRole('button', { name: /^Open Practice spell 13(?:,|$)/ }).filter({ visible: true })
	).toBeVisible();
	await expect(
		spells.getByRole('button', { name: /^Open Practice spell 28(?:,|$)/ }).filter({ visible: true })
	).toHaveCount(0);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
});

for (const example of [
	{
		route: '5e?id=e2e-character',
		action: 'Longsword attack',
		source: 'Longsword',
		detail: 'Detail'
	},
	{
		route: '5e2024?id=char-5e-2024-representative',
		action: 'Quarterstaff strike',
		source: 'Quarterstaff',
		detail: 'Description'
	}
]) {
	test(`source Detail navigation protects edits on ${example.route}`, async ({ page }) => {
		await page.goto(`/ez-chars/charsheets/${example.route}`);
		const dialog = page.getByRole('dialog').filter({ visible: true });
		const entry = page
			.getByRole('button', { name: new RegExp(`^Open ${example.action}(?:,|$)`) })
			.filter({ visible: true });
		await entry.click();
		const source = dialog.getByRole('region', { name: 'Source', exact: true });
		await expect(source).toContainText(example.source);
		await expect(
			source.getByRole('button', { name: 'Refresh from source', exact: true })
		).toBeVisible();
		await dialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
		await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Unsaved action');
		await source.getByRole('button', { name: 'View source', exact: true }).click();
		await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
		await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
			'Unsaved action'
		);
		await source.getByRole('button', { name: 'View source', exact: true }).click();
		await dialog.getByRole('button', { name: 'Discard and continue', exact: true }).click();
		await expect(dialog).toHaveCount(1);
		await expect(dialog.getByRole('heading', { name: example.source, exact: true })).toBeVisible();
		await expect(dialog.getByRole('button', { name: /^Remove / })).toHaveCount(0);
		await dialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
		await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('');
		await dialog.getByRole('button', { name: 'Back', exact: true }).click();
		await dialog.getByRole('button', { name: 'Save and continue', exact: true }).click();
		await expect(dialog.getByRole('alert')).toBeVisible();
		await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('');
		await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
		await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Updated source');
		await dialog.getByRole('button', { name: 'Back', exact: true }).click();
		await dialog.getByRole('button', { name: 'Save and continue', exact: true }).click();
		await expect(dialog.getByRole('heading', { name: example.action, exact: true })).toBeVisible();
		await expect(source).toContainText('Updated source');
		await expect(source.getByRole('button', { name: 'View source', exact: true })).toBeFocused();
		await source.getByRole('button', { name: 'Refresh from source', exact: true }).click();
		await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
		await expect(dialog.getByRole('heading', { name: example.action, exact: true })).toBeVisible();
		await source.getByRole('button', { name: 'Refresh from source', exact: true }).click();
		await dialog.getByRole('button', { name: 'Confirm refresh', exact: true }).click();
		await expect(
			dialog.getByRole('heading', { name: 'Updated source', exact: true })
		).toBeVisible();
		await source.getByRole('button', { name: 'View source', exact: true }).click();
		await dialog.getByRole('button', { name: `Edit ${example.detail}`, exact: true }).click();
		await dialog
			.getByRole('textbox', { name: example.detail, exact: true })
			.fill('Do not save this');
		await dialog.getByRole('button', { name: 'Close', exact: true }).click();
		await dialog.getByRole('button', { name: 'Discard and continue', exact: true }).click();
		await expect(dialog).toHaveCount(0);
		await expect(
			page
				.getByRole('button', { name: /^Open Updated source(?:,|$)/ })
				.filter({ visible: true })
				.first()
		).toBeVisible();
	});
}

test('2024 inventory action snapshots refresh explicitly and survive source deletion', async ({
	page
}) => {
	await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-representative');
	const actions = page.getByRole('region', { name: 'Runtime Actions', exact: true });
	const inventory = page.getByRole('region', { name: 'Weapons', exact: true });
	const add = page.getByRole('button', { name: 'Add Runtime Actions', exact: true });
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await add.click();
	await dialog
		.getByRole('searchbox', { name: 'Search Action sources', exact: true })
		.fill('Quarterstaff');
	await dialog.getByRole('button', { name: /^Open Quarterstaff(?:,|$)/ }).click();
	await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
		'Quarterstaff'
	);
	await expect(dialog.getByRole('textbox', { name: 'Description', exact: true })).toHaveValue(
		'Walking stick and reliable backup.'
	);
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Staff response');
	await dialog.getByRole('combobox', { name: 'Timing', exact: true }).selectOption('Reaction');
	// Back and selecting the same source preserves the reviewed draft.
	await dialog.getByRole('button', { name: 'Back', exact: true }).click();
	await dialog.getByRole('button', { name: /^Open Quarterstaff(?:,|$)/ }).click();
	await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
		'Staff response'
	);
	await dialog.getByRole('button', { name: 'Confirm Action', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await expect(add).toBeFocused();
	await actions
		.getByRole('button', { name: /^Pin Staff response/ })
		.filter({ visible: true })
		.click();
	await actions
		.getByRole('button', { name: /^Open Staff response/ })
		.filter({ visible: true })
		.click();
	await dialog.getByRole('button', { name: 'Add note for Name', exact: true }).click();
	await dialog
		.getByRole('textbox', { name: 'Text (optional)', exact: true })
		.fill('Keep my reminder');
	await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await inventory
		.getByRole('button', { name: /^Open Quarterstaff(?:,|$)/ })
		.filter({ visible: true })
		.click();
	await dialog.getByRole('button', { name: 'Edit Description', exact: true }).click();
	await dialog
		.getByRole('textbox', { name: 'Description', exact: true })
		.fill('Revised source description');
	await dialog.getByRole('button', { name: 'Save Description', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await actions
		.getByRole('button', { name: /^Open Staff response/ })
		.filter({ visible: true })
		.click();
	await expect(dialog.getByRole('region', { name: 'Description', exact: true })).toContainText(
		'Walking stick and reliable backup.'
	);
	await dialog.getByRole('button', { name: 'Refresh from source', exact: true }).click();
	await expect(dialog.getByText(/overwrites direct edits and clears Description/)).toBeVisible();
	await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Name', exact: true })).toContainText(
		'Staff response'
	);
	await dialog.getByRole('button', { name: 'Refresh from source', exact: true }).click();
	await dialog.getByRole('button', { name: 'Confirm refresh', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Name', exact: true })).toContainText(
		'Quarterstaff'
	);
	await expect(dialog.getByRole('region', { name: 'Description', exact: true })).toContainText(
		'Revised source description'
	);
	await expect(dialog.getByRole('region', { name: 'Timing', exact: true })).toContainText(
		'Reaction'
	);
	await dialog.getByRole('button', { name: '1 note', exact: true }).click();
	await expect(dialog.getByText('Keep my reminder', { exact: true })).toBeVisible();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await inventory
		.getByRole('button', { name: /^Open Quarterstaff(?:,|$)/ })
		.filter({ visible: true })
		.click();
	await dialog.getByRole('button', { name: 'Remove item', exact: true }).click();
	await dialog.getByRole('button', { name: 'Confirm removal', exact: true }).click();
	await page.reload();
	await expect(inventory.getByRole('button', { name: /^Open Quarterstaff(?:,|$)/ })).toHaveCount(0);
	await expect(
		actions.getByRole('button', { name: /^Unpin Quarterstaff/ }).filter({ visible: true })
	).toBeVisible();
	await actions
		.getByRole('button', { name: /^Open Quarterstaff(?:,|$)/ })
		.filter({ visible: true })
		.click();
	await expect(
		dialog.getByRole('button', { name: 'Refresh from source', exact: true })
	).toHaveCount(0);
	await expect(dialog.getByRole('region', { name: 'Description', exact: true })).toContainText(
		'Revised source description'
	);
	await dialog.getByRole('button', { name: '1 note', exact: true }).click();
	await expect(dialog.getByText('Keep my reminder', { exact: true })).toBeVisible();
});

for (const example of [
	{ edition: '2014', route: '5e', id: e2eCharacter.meta.id },
	{ edition: '2024', route: '5e2024', id: 'char-5e-2024-representative' }
]) {
	test(`${example.edition} read-first notes use count badges and field Detail consistently`, async ({
		page
	}) => {
		await page.goto(`/ez-chars/charsheets/${example.route}?id=${example.id}`);
		const entry = page.getByRole('button', { name: 'View Background', exact: true }).first();
		await expect(entry).toBeVisible();
		const badges = page.getByText('1 note', { exact: true }).filter({ visible: true });
		const initialCount = await badges.count();
		await entry.click();
		const dialog = page.getByRole('dialog').filter({ visible: true });
		await dialog.getByRole('button', { name: 'Add note for Background', exact: true }).click();
		await dialog
			.getByRole('textbox', { name: 'Text (optional)', exact: true })
			.fill('Background reminder');
		await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
		await dialog.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(entry).toBeFocused();
		await expect(badges).toHaveCount(initialCount + 1);
		await expect(
			page.getByRole('button', { name: 'View notes for Background', exact: true })
		).toHaveCount(0);
		await page.reload();
		await expect(entry).toBeVisible();
		await expect(badges).toHaveCount(initialCount + 1);
		await entry.click();
		await dialog
			.getByRole('region', { name: 'Background', exact: true })
			.getByRole('button', { name: '1 note', exact: true })
			.click();
		await expect(dialog.getByText('Background reminder', { exact: true })).toBeVisible();
	});
}

test('2024 sheet keeps read-first notes with their field without obsolete proof notices', async ({
	page
}) => {
	for (const width of [1280, 390]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-representative');
		const species = page.getByRole('button', { name: 'View Species', exact: true });
		await expect(species).toBeVisible();
		// Compact read-first groups keep label, value, then count without a second note entry.
		await expect(
			page.getByRole('button', { name: 'View notes for Species', exact: true })
		).toHaveCount(0);
		const origin = page.getByRole('region').filter({ has: species });
		await expect(origin.getByText('1 note', { exact: true })).toBeVisible();
		await expect(origin).toContainText(/Species\s*:\s*Human\s*1 note/);
		const labelBox = await species.boundingBox();
		const valueBox = await origin.getByText('Human', { exact: true }).boundingBox();
		expect(labelBox).not.toBeNull();
		expect(valueBox).not.toBeNull();
		expect(valueBox!.x).toBeGreaterThanOrEqual(labelBox!.x + labelBox!.width - 1);
		expect(valueBox!.y).toBeLessThan(labelBox!.y + labelBox!.height);
		await expect(page.getByRole('note', { name: '2024 proof status' })).toHaveCount(0);
		await expect(
			page.getByRole('alert', { name: 'Pre-Release Playtest', exact: true })
		).toBeVisible();
		await expect(page.getByRole('button', { name: 'View Max HP', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'View Armor Class', exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'View Species', exact: true }).click();
		const dialog = page.getByRole('dialog').filter({ visible: true });
		await dialog
			.getByRole('region', { name: 'Species', exact: true })
			.getByRole('button', { name: '1 note', exact: true })
			.click();
		await expect(dialog.getByText('Character species:', { exact: true })).toBeVisible();
		await dialog.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(page.getByRole('button', { name: 'View Species', exact: true })).toBeFocused();
	}
});

test('mixed list dispatches safely and both creation choices retain their edition', async ({
	page
}) => {
	await page.goto('/');
	await page
		.getByRole('button', { name: 'Open Mira — 2024 Representative', exact: true })
		.filter({ visible: true })
		.click();
	await expect(page).toHaveURL(/\/charsheets\/5e2024\?id=char-5e-2024-representative/);
	await expect(page.getByRole('main', { name: '2024 character sheet' })).toBeVisible();
	await page.goto('/ez-chars/charsheets/5e?id=char-5e-2024-representative');
	await expect(page.getByRole('heading', { name: 'Different character system.' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Edit Current HP' })).toHaveCount(0);
	await page.getByRole('link', { name: 'Open matching sheet' }).click();
	await expect(page.getByRole('main', { name: '2024 character sheet' })).toBeVisible();
	await page.goto(`/ez-chars/charsheets/5e2024?id=${e2eCharacter.meta.id}`);
	await expect(page.getByRole('heading', { name: 'Different character system.' })).toBeVisible();
	await page.getByRole('link', { name: 'Open matching sheet' }).click();
	await expect(page.getByRole('main', { name: '2014 character sheet' })).toBeVisible();
	await page.goto('/ez-chars/charsheets/5e2024?id=missing');
	await expect(page.getByRole('heading', { name: 'Character not found.' })).toBeVisible();
	for (const edition of ['2024', '2014']) {
		await page.goto('/');
		await page.getByRole('button', { name: 'Create Character', exact: true }).click();
		await page
			.getByRole('button', { name: `Create New ${edition} 5e Character`, exact: true })
			.click();
		await expect(page.getByRole('main', { name: `${edition} character sheet` })).toBeVisible();
		await expect(page).toHaveURL(edition === '2024' ? /\/5e2024\?id=/ : /\/5e\?id=/);
	}
});

test('2024 fields save independently and survive reload without changing a 2014 character', async ({
	page
}) => {
	await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-representative');
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await page.getByRole('spinbutton', { name: 'Current HP', exact: true }).fill('-2');
	await page.getByRole('button', { name: 'Confirm Current HP', exact: true }).click();
	await expect(
		page.getByRole('alert').filter({ hasText: 'expected number to be >=0' })
	).toBeVisible();
	await expect(page.getByRole('spinbutton', { name: 'Current HP', exact: true })).toHaveValue('-2');
	await page.getByRole('spinbutton', { name: 'Current HP', exact: true }).fill('19');
	await page.getByRole('button', { name: 'Confirm Current HP', exact: true }).click();
	await page.getByRole('button', { name: 'View Species', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await expect(dialog.getByRole('region', { name: 'Species', exact: true })).toHaveAttribute(
		'aria-current',
		'location'
	);
	await dialog.getByRole('button', { name: 'Edit Species', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Species', exact: true }).fill('Elf');
	await dialog.getByRole('button', { name: 'Save Species', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Background', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Background', exact: true }).fill('Do not save');
	await dialog.getByRole('button', { name: 'Cancel Background edit', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.reload();
	await expect(page.getByText('Elf', { exact: true }).filter({ visible: true })).toBeVisible();
	await expect(page.getByText('Sage', { exact: true }).filter({ visible: true })).toBeVisible();
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await expect(page.getByRole('spinbutton', { name: 'Current HP', exact: true })).toHaveValue('19');
	await page.goto(`/ez-chars/charsheets/5e?id=${e2eCharacter.meta.id}`);
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await expect(page.getByRole('spinbutton', { name: 'Current HP', exact: true })).toHaveValue(
		String(e2eCharacter.systemData.combat.hitPoints.current)
	);
});

test('2024 collection creation, pinning, timing, category and removal use shared interaction controls', async ({
	page
}) => {
	await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-sparse');
	await page.getByRole('button', { name: 'Add Other Gear', exact: true }).click();
	let dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Sword-shaped keepsake');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await page
		.getByRole('button', { name: /^Pin Sword-shaped keepsake/ })
		.filter({ visible: true })
		.click();
	await page
		.getByRole('button', { name: /^Open Sword-shaped keepsake/ })
		.filter({ visible: true })
		.click();
	dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Edit Category', exact: true }).click();
	await dialog.getByRole('combobox', { name: 'Category', exact: true }).selectOption('Weapons');
	await dialog.getByRole('button', { name: 'Save Category', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(
		page.getByRole('button', { name: /^Unpin Sword-shaped keepsake/ }).filter({ visible: true })
	).toBeVisible();
	await page.getByRole('button', { name: 'Add Runtime Actions', exact: true }).click();
	dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Create custom action', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Spear reaction');
	await dialog.getByRole('combobox', { name: 'Timing', exact: true }).selectOption('Reaction');
	await dialog.getByRole('button', { name: 'Confirm Action', exact: true }).click();
	await page
		.getByRole('button', { name: 'Reaction', exact: true })
		.filter({ visible: true })
		.click();
	await page
		.getByRole('searchbox', { name: 'Search Runtime Actions', exact: true })
		.filter({ visible: true })
		.fill('spear');
	await expect(
		page.getByRole('button', { name: /^Open Spear thrust/ }).filter({ visible: true })
	).toHaveCount(0);
	await expect(
		page.getByRole('button', { name: /^Open Spear reaction/ }).filter({ visible: true })
	).toBeVisible();
	await page
		.getByRole('button', { name: /^Open Sword-shaped keepsake/ })
		.filter({ visible: true })
		.click();
	dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Remove item', exact: true }).click();
	await dialog.getByRole('button', { name: 'Confirm removal', exact: true }).click();
	await expect(page.getByRole('button', { name: /^Open Sword-shaped keepsake/ })).toHaveCount(0);
	await page.getByRole('button', { name: 'Add Quick Notes', exact: true }).click();
	dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog
		.getByRole('textbox', { name: 'Note', exact: true })
		.fill('Leave a message at the bridge.');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(
		page.getByText('Leave a message at the bridge.', { exact: true }).filter({ visible: true })
	).toBeVisible();
});

test('2024 reader uses its source and closes without undoing background sheet navigation', async ({
	page
}) => {
	test.setTimeout(30_000);
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/ez-chars/charsheets/5e2024?id=char-5e-2024-representative');
	const nav = page.getByRole('navigation', { name: 'Character sheet navigation' });
	await nav.getByRole('button', { name: 'Quick Reference', exact: true }).click();
	await page.getByRole('button', { name: 'Rules', exact: true }).click();
	const reader = page.getByRole('dialog', { name: 'Rules reference', exact: true });
	await expect(
		reader.getByRole('heading', { name: 'System Reference Document 5.2.1', exact: true })
	).toBeVisible();
	await expect(reader.getByLabel('Selectable text for page 1')).not.toBeEmpty();
	await nav.getByRole('button', { name: 'Inventory & Equipment', exact: true }).click();
	await reader.getByRole('button', { name: 'Close rules reference', exact: true }).click();
	await expect(page).toHaveURL(/5e2024\?id=char-5e-2024-representative#sheet-inventory-heading$/);
	await expect(reader).not.toBeVisible();
	await page.getByRole('button', { name: 'References: equipment', exact: true }).click();
	await expect(reader.getByLabel('PDF page 89, current page')).toBeVisible();
	await page.goBack();
	await expect(reader).not.toBeVisible();
});

test('2024 references reject a 2014 locator and preserve a dirty note through the matching in-app source', async ({
	page
}) => {
	test.setTimeout(30_000);
	await page.goto(
		'/ez-chars/charsheets/5e2024?id=char-5e-2024-representative&reference=dnd5e-2014.srd-5-1.equipment'
	);
	const reader = page.getByRole('dialog', { name: 'Rules reference', exact: true });
	await expect(reader.getByText('This reference cannot open in the in-app viewer.')).toBeVisible();
	await reader.getByRole('button', { name: 'Close rules reference', exact: true }).click();
	await page.getByRole('button', { name: 'View Species', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Add note for Species', exact: true }).click();
	const text = dialog.getByText('Text (optional)').locator('..').getByRole('textbox');
	await text.fill('Unsaved 2024 note');
	await dialog.getByLabel('SRD 5.2.1: Character origins', { exact: true }).click();
	await dialog
		.getByLabel('SRD 5.2.1: Character origins', { exact: true })
		.locator('../..')
		.getByRole('button', { name: '(view in app)' })
		.click();
	await expect(dialog.getByLabel('Selectable text for page 83')).not.toBeEmpty();
	await dialog.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(text).toHaveValue('Unsaved 2024 note');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(dialog.getByRole('group', { name: 'Unsaved changes' })).toBeVisible();
	await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
	await expect(text).toHaveValue('Unsaved 2024 note');
});

for (const edition of ['2014', '2024'] as const) {
	test(`${edition} authored notes open the other edition's known PDF without a URL`, async ({
		page
	}) => {
		const other = edition === '2014' ? '2024' : '2014';
		const sourceId = other === '2024' ? 'dnd5e-2024.srd-5-2-1' : 'dnd5e-2014.srd-5-1';
		const note = {
			id: 'cross-edition-reference',
			name: 'Intentional alternate source',
			origin: 'user',
			kind: 'reference',
			ref: { sourceId, kind: 'pdf', locator: { page: 4 } }
		};
		const character =
			edition === '2014'
				? {
						...e2eCharacter,
						systemData: {
							...e2eCharacter.systemData,
							annotations: { identity: { name: { _annotations: { alternate: note } } } }
						}
					}
				: {
						...representativeCharacter5e2024,
						systemData: {
							...representativeCharacter5e2024.systemData,
							fieldNotes: { '/systemData/identity/name': [note] }
						}
					};
		await page.addInitScript((character) => {
			if (!sessionStorage.getItem('cross-edition-seeded')) {
				localStorage.setItem(
					'ez-chars.characters.v1',
					JSON.stringify({ version: 1, characters: [character] })
				);
				sessionStorage.setItem('cross-edition-seeded', 'yes');
			}
		}, character);
		const route = edition === '2014' ? '5e' : '5e2024';
		await page.goto(`/ez-chars/charsheets/${route}?id=${character.meta.id}`);
		await page.getByRole('button', { name: 'View Name', exact: true }).click();
		const dialog = page.getByRole('dialog').filter({ visible: true });
		await dialog
			.getByRole('region', { name: 'Name', exact: true })
			.getByRole('button', { name: '1 note', exact: true })
			.click();
		const reference = dialog.getByRole('button', {
			name: `Open ${sourceId} (pdf) - page 4 in app`,
			exact: true
		});
		await reference.click();
		await expect(dialog.getByLabel('Selectable text for page 4')).not.toBeEmpty();
		await expect(
			dialog.getByRole('heading', {
				name: `System Reference Document ${other === '2024' ? '5.2.1' : '5.1'}`,
				exact: true
			})
		).toBeVisible();
		await dialog.getByRole('button', { name: 'Back', exact: true }).click();
		await expect(reference).toBeFocused();
		await expect(dialog.getByText('Intentional alternate source:', { exact: true })).toBeVisible();
		await dialog.getByRole('button', { name: 'Close', exact: true }).click();
		// An explicit alternate reference never replaces this sheet's automatic default.
		await page.getByRole('button', { name: 'Rules', exact: true }).click();
		await expect(
			page.getByRole('dialog', { name: 'Rules reference', exact: true }).getByRole('heading', {
				name: `System Reference Document ${edition === '2024' ? '5.2.1' : '5.1'}`,
				exact: true
			})
		).toBeVisible();
	});
}
