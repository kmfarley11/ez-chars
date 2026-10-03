import { expect, test } from '@playwright/test';
import { e2eCharacter } from './fixtures/characters';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import { saturatedStoredCharacters5e2014 } from '../src/fixtures/saturatedCharacter.5e2014';

test.beforeEach(async ({ page }) => {
	installBrowserErrorGuard(page);
	await page.addInitScript(
		(value) => {
			if (!localStorage.getItem('ez-chars.characters.v1'))
				localStorage.setItem('ez-chars.characters.v1', JSON.stringify(value));
		},
		{
			version: 1,
			characters: [
				{
					...e2eCharacter,
					identity: { ...e2eCharacter.identity, alignment: 'Neutral', appearance: 'Travel-worn' },
					systemData: {
						...e2eCharacter.systemData,
						spellcasting: {
							ability: 'int',
							spells: [
								{
									spellId: 'proof-spell',
									name: 'Proof Spell',
									level: 1,
									prepared: true,
									notes: 'Remember this detail',
									annotations: [
										{
											id: 'proof-source',
											origin: 'user',
											kind: 'note',
											text: 'Long reading context before this source. '.repeat(120),
											ref: { kind: 'pdf', sourceId: 'dnd5e-2014.srd-5-1', locator: { page: 1 } }
										}
									]
								}
							]
						}
					}
				}
			]
		}
	);
	await page.goto('/ez-chars/charsheets/5e?id=e2e-character');
	// Finish app bootstrap before a test replaces the fixture and navigates again.
	await expect(page.getByRole('button', { name: 'Edit Current HP', exact: true })).toBeVisible();
});
test.afterEach(({ page }) => expectNoBrowserErrors(page));

test('selective centered currency keeps its read and edit alignment without changing HP', async ({
	page
}, testInfo) => {
	const goldLabel = page.getByText('GP', { exact: true });
	await goldLabel.scrollIntoViewIfNeeded();
	await expect(goldLabel).toHaveCSS('text-align', 'center');
	const before = await goldLabel.boundingBox();
	await page.getByRole('button', { name: 'Edit GP', exact: true }).click();
	const goldInput = page.getByRole('spinbutton', { name: 'GP', exact: true });
	await expect(goldInput).toHaveCSS('text-align', 'center');
	const inputBox = await goldInput.boundingBox();
	const editing = await goldLabel.boundingBox();
	expect(before).not.toBeNull();
	expect(inputBox).not.toBeNull();
	expect(editing).not.toBeNull();
	if (before && editing && inputBox) {
		expect(Math.abs(before.width - editing.width)).toBeLessThanOrEqual(1);
		expect(Math.abs(before.x - editing.x)).toBeLessThanOrEqual(1);
		expect(
			Math.abs(editing.x + editing.width / 2 - inputBox.x - inputBox.width / 2)
		).toBeLessThanOrEqual(1);
	}
	await goldInput.fill('23');
	await page.getByRole('button', { name: 'Confirm GP', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Edit GP', exact: true })).toBeFocused();
	await page.reload();
	await page.getByRole('button', { name: 'Edit GP', exact: true }).click();
	await expect(goldInput).toHaveValue('23');
	await page.getByRole('button', { name: 'Cancel editing GP', exact: true }).click();
	await testInfo.attach('centered-currency', {
		body: await page.screenshot({ path: testInfo.outputPath('centered-currency.png') }),
		contentType: 'image/png'
	});
	await page.getByRole('button', { name: 'Edit Current HP', exact: true }).click();
	await expect(page.getByRole('spinbutton', { name: 'Current HP', exact: true })).toHaveCSS(
		'text-align',
		'left'
	);
	await page.getByRole('button', { name: 'Cancel editing Current HP', exact: true }).click();
	const summary = page.getByRole('region', { name: 'Spellcasting summary', exact: true });
	await summary.scrollIntoViewIfNeeded();
	await testInfo.attach('centered-spellcasting', {
		body: await page.screenshot({ path: testInfo.outputPath('centered-spellcasting.png') }),
		contentType: 'image/png'
	});
});

test('name and class labels expose independent editing and coherent creation', async ({ page }) => {
	await page.getByRole('button', { name: 'View Name', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await expect(dialog.getByRole('region', { name: 'Name', exact: true })).toHaveAttribute(
		'aria-current',
		'location'
	);
	await dialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Renamed Hero');
	await dialog.getByRole('button', { name: 'Save Name', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.getByRole('button', { name: 'View Class Levels', exact: true }).click();
	await dialog.getByRole('button', { name: 'Add Class', exact: true }).click();
	const creation = dialog.getByRole('group', { name: 'Add Class', exact: true });
	await creation.getByRole('textbox', { name: 'Name', exact: true }).fill('Wizard');
	await creation.getByRole('button', { name: 'Add Class', exact: true }).click();
	await expect(
		dialog.getByRole('button', { name: 'Edit Class 1 Level', exact: true })
	).toBeVisible();
	await dialog.getByRole('button', { name: 'Edit Class 1 Level', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Class 1 Level', exact: true }).fill('2');
	await dialog.getByRole('button', { name: 'Save Class 1 Level', exact: true }).click();
	await dialog.getByRole('button', { name: /Remove Class 1:/ }).click();
	await dialog.getByRole('button', { name: 'Confirm removal', exact: true }).click();
	await expect(dialog.getByRole('button', { name: 'Edit Class 1 Level', exact: true })).toHaveCount(
		0
	);
});

test('pending class removal cannot retarget a shifted class after Save and continue', async ({
	page
}) => {
	await page.getByRole('button', { name: 'View Class Levels', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	for (const name of ['Fighter', 'Wizard', 'Rogue']) {
		await dialog.getByRole('button', { name: 'Add Class', exact: true }).click();
		const creation = dialog.getByRole('group', { name: 'Add Class', exact: true });
		await creation.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
		await creation.getByRole('button', { name: 'Add Class', exact: true }).click();
	}
	await dialog.getByRole('button', { name: 'Remove Class 1: Fighter', exact: true }).click();
	await dialog.getByRole('button', { name: 'Remove Class 2: Wizard', exact: true }).click();
	await dialog.getByRole('button', { name: 'Save and continue', exact: true }).click();
	await dialog.getByRole('button', { name: 'Confirm removal', exact: true }).click();
	await expect(dialog.getByRole('alert')).toContainText('changed or was removed');
	await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Class 1 Name', exact: true })).toContainText(
		'Wizard'
	);
	await expect(dialog.getByRole('region', { name: 'Class 2 Name', exact: true })).toContainText(
		'Rogue'
	);
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.reload();
	await page.getByRole('button', { name: 'View Class Levels', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Class 1 Name', exact: true })).toContainText(
		'Wizard'
	);
	await expect(dialog.getByRole('region', { name: 'Class 2 Name', exact: true })).toContainText(
		'Rogue'
	);
});

test('runtime action names use the existing detail entry with independent source commands', async ({
	page
}) => {
	const trigger = page.getByRole('button', { name: 'Open Longsword attack', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await expect(dialog).toContainText('Seeded item detail.');
	await dialog.getByRole('button', { name: 'Edit Target', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Target', exact: true }).fill('Two creatures');
	await dialog.getByRole('button', { name: 'Save Target', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Target', exact: true })).toContainText(
		'Two creatures'
	);
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(trigger).toBeFocused();
});

test('spell level is editable without losing notes or the pinned record', async ({ page }) => {
	await page.getByRole('button', { name: /^Pin Proof Spell/ }).click();
	await page.getByRole('button', { name: /^Open Proof Spell/ }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Edit Level', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Level', exact: true }).fill('10');
	await dialog.getByRole('button', { name: 'Save Level', exact: true }).click();
	await expect(dialog.getByRole('alert')).toContainText('0 (cantrip) to 9');
	await dialog.getByRole('spinbutton', { name: 'Level', exact: true }).fill('3');
	await dialog.getByRole('button', { name: 'Save Level', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Level', exact: true })).toContainText('3');
	await expect(dialog).toContainText('Remember this detail');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.reload();
	await expect(page.getByRole('button', { name: /^Unpin Proof Spell/ })).toBeVisible();
	await page.getByRole('button', { name: /^Open Proof Spell/ }).click();
	await expect(dialog.getByRole('region', { name: 'Level', exact: true })).toContainText('3');
});

test('read-first slots target Used and Max independently', async ({ page }, testInfo) => {
	const slots = page.getByRole('region', { name: 'Spell slots', exact: true });
	const level = slots.getByRole('region').first();
	await expect(level).toContainText(/1st:\s*0\s*Used\s*\/\s*0\s*Max/);
	await level.getByRole('button', { name: 'View Used', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await expect(dialog.getByRole('region', { name: 'Used', exact: true })).toHaveAttribute(
		'aria-current',
		'location'
	);
	await dialog.getByRole('button', { name: 'Edit Used', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Used', exact: true }).fill('1');
	await dialog.getByRole('button', { name: 'Save Used', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Max', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Max', exact: true }).fill('2');
	await dialog.getByRole('button', { name: 'Cancel Max edit', exact: true }).click();
	await dialog.getByRole('button', { name: 'Add note for Used', exact: true }).click();
	await dialog
		.getByRole('textbox', { name: 'Text (optional)', exact: true })
		.fill('Track expended slots');
	await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.reload();
	await expect(level).toContainText('1');
	await level.getByRole('button', { name: 'View notes for Used', exact: true }).click();
	await expect(dialog).toContainText('Track expended slots');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await level.getByRole('button', { name: 'View Max', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Max', exact: true })).toHaveAttribute(
		'aria-current',
		'location'
	);
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await slots.scrollIntoViewIfNeeded();
	await testInfo.attach('read-first-slots', {
		body: await page.screenshot({ path: testInfo.outputPath('read-first-slots.png') }),
		contentType: 'image/png'
	});
});

test('label buttons consistently reveal and identify their field without starting an edit', async ({
	page,
	isMobile
}, testInfo) => {
	const dialog = page.getByRole('dialog').filter({ visible: true });
	for (const [label, index, field] of [
		['Score', 0, 'Score'],
		['Modifier', 0, 'Modifier'],
		['Save', 2, 'Save'],
		['Prof. Bonus', 0, 'Prof. Bonus']
	] as const) {
		const trigger = page.getByRole('button', { name: `View ${label}`, exact: true }).nth(index);
		if (isMobile) {
			const bounds = await trigger.boundingBox();
			expect(bounds?.width).toBeGreaterThanOrEqual(44);
			expect(bounds?.height).toBeGreaterThanOrEqual(44);
		}
		await trigger.click();
		const region = dialog.getByRole('region', { name: field, exact: true });
		await expect(region).toHaveAttribute('aria-current', 'location');
		await expect(region.getByRole('heading', { name: field, exact: true })).toBeFocused();
		await expect(
			region.getByRole('button', { name: `Edit ${field}`, exact: true })
		).toBeInViewport();
		await expect(dialog.getByRole('spinbutton')).toHaveCount(0);
		if (label === 'Save')
			await testInfo.attach('targeted-field', {
				body: await page.screenshot({ path: testInfo.outputPath('targeted-field.png') }),
				contentType: 'image/png'
			});
		await dialog.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(trigger).toBeFocused();
	}
	await expect(
		page.getByRole('button', { name: 'View STR ability and skills', exact: true })
	).toHaveCount(0);
	await expect(
		page.getByRole('button', { name: 'View Prof. Bonus details', exact: true })
	).toHaveCount(0);
});

test('collection name opens the same record while Pin remains a separate command', async ({
	page
}) => {
	const name = page.getByRole('button', { name: /^Open Proof Spell/ });
	await expect(page.getByRole('button', { name: /^View Proof Spell.*details/ })).toHaveCount(0);
	await name.click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await expect(dialog).toContainText('Remember this detail');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(name).toBeFocused();
	await page.getByRole('button', { name: /^Pin Proof Spell/ }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByRole('button', { name: /^Unpin Proof Spell/ })).toBeVisible();
});

test('Tier 1 notes stay independent of HP and label entry retains complete group detail', async ({
	page
}) => {
	const notes = page.getByRole('button', { name: 'Add notes for Current HP', exact: true });
	await notes.click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Add note for Current HP', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Text (optional)', exact: true }).fill('Unsaved');
	await dialog.getByRole('button', { name: 'Cancel note edit', exact: true }).click();
	await expect(dialog).not.toContainText('Unsaved');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(notes).toBeFocused();
	await page.getByRole('button', { name: 'View Score', exact: true }).first().click();
	await expect(dialog.getByRole('button', { name: 'Edit Athletics', exact: true })).toBeVisible();
});

test('scratchpad lifecycle and roleplay notes use independent edits without nested dialogs', async ({
	page
}) => {
	await page.getByRole('button', { name: 'View Misc. Notes & Scratchpad', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Add Note', exact: true }).click();
	const creation = dialog.getByRole('group', { name: 'Add Note', exact: true });
	await creation.getByRole('textbox', { name: 'Title', exact: true }).fill('Session clue');
	await creation.getByRole('textbox', { name: 'Body', exact: true }).fill('Look under the bridge.');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
	await expect(creation.getByRole('textbox', { name: 'Body', exact: true })).toHaveValue(
		'Look under the bridge.'
	);
	await creation.getByRole('button', { name: 'Add Note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Note 1 Body', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Note 1 Body', exact: true }).fill('Do not save this');
	await dialog.getByRole('button', { name: 'Cancel Note 1 Body edit', exact: true }).click();
	await expect(dialog).toContainText('Look under the bridge.');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.reload();
	await page.getByRole('button', { name: 'View Misc. Notes & Scratchpad', exact: true }).click();
	await expect(dialog).toContainText('Look under the bridge.');
	await dialog.getByRole('button', { name: 'Remove Note 1: Session clue', exact: true }).click();
	await dialog.getByRole('button', { name: 'Confirm removal', exact: true }).click();
	await expect(dialog).not.toContainText('Look under the bridge.');
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.getByRole('button', { name: 'View Motives', exact: true }).click();
	await dialog.getByRole('button', { name: 'Add note for Motives', exact: true }).click();
	await dialog
		.getByRole('textbox', { name: 'Text (optional)', exact: true })
		.fill('Optional motivation context');
	await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await page.getByRole('button', { name: 'View notes for Motives', exact: true }).click();
	await expect(dialog).toContainText('Optional motivation context');
	await expect(page.getByRole('dialog').filter({ visible: true })).toHaveCount(1);
});

test('target switching rejects invalid Save and continue, then commits only a valid edit', async ({
	page
}) => {
	await page.getByRole('button', { name: 'View Athletics', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Edit Score', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Score', exact: true }).fill('');
	await dialog.getByRole('button', { name: 'Edit Modifier', exact: true }).click();
	await dialog.getByRole('button', { name: 'Save and continue', exact: true }).click();
	await expect(dialog.getByRole('alert')).toContainText('finite number');
	await expect(dialog.getByRole('spinbutton', { name: 'Score', exact: true })).toHaveValue('');
	await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Score', exact: true }).fill('14');
	await dialog.getByRole('button', { name: 'Edit Modifier', exact: true }).click();
	await dialog.getByRole('button', { name: 'Save and continue', exact: true }).click();
	await expect(dialog.getByRole('spinbutton', { name: 'Modifier', exact: true })).toBeFocused();
	await dialog.getByRole('button', { name: 'Cancel Modifier edit', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Score', exact: true })).toContainText('14');
});

test('saturated collection keeps query and identity when a local rename stops matching', async ({
	page
}, testInfo) => {
	await page.addInitScript(
		(value) => localStorage.setItem('ez-chars.characters.v1', JSON.stringify(value)),
		saturatedStoredCharacters5e2014
	);
	await page.goto('/ez-chars/charsheets/5e?id=char-5e-2014-saturated');
	const spells = page.getByRole('region', { name: 'Spells collection', exact: true });
	let collection = spells;
	let query = collection.getByRole('searchbox', { name: 'Search Spells', exact: true });
	const browse = spells.getByRole('button', { name: /Browse all/ });
	// Search is present in both layouts; a visible Browse distinguishes the phone workflow.
	await expect(query).toBeVisible();
	await testInfo.attach('whole-sheet-proof', {
		body: await page.screenshot({ fullPage: true, path: testInfo.outputPath('whole-sheet.png') }),
		contentType: 'image/png'
	});
	const browsing = await browse.isVisible();
	if (browsing) {
		await browse.click();
		collection = page.getByRole('dialog', { name: 'Spells', exact: true });
		query = collection.getByRole('searchbox', { name: 'Search Spells', exact: true });
	}
	await query.fill('Practice spell 5');
	await collection.getByRole('button', { name: /Open Practice spell 5.*/ }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Unmatched rename');
	await dialog.getByRole('button', { name: 'Save Name', exact: true }).click();
	await expect(dialog).toContainText('Authored spell reminder 5.');
	await dialog.getByRole('button', { name: '1 note', exact: true }).click();
	await expect(dialog).toContainText('Review the area wording before play.');
	await testInfo.attach('small-edit-detail', {
		body: await page.screenshot({ path: testInfo.outputPath('detail.png') }),
		contentType: 'image/png'
	});
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(query).toHaveValue('Practice spell 5');
	if (browsing)
		await expect(collection.getByRole('button', { name: /Close Spells/ })).toBeVisible();
	else await expect(spells.getByRole('button', { name: 'Add Spells', exact: true })).toBeFocused();
	await query.fill('Unmatched rename');
	await expect(collection.getByRole('button', { name: /Open Unmatched rename.*/ })).toBeVisible();
});

test('group entry and explicit optional clearing keep the other field unchanged', async ({
	page
}) => {
	await page.getByRole('button', { name: 'View Alignment', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Alignment and appearance', exact: true });
	await dialog.getByRole('button', { name: 'Edit Alignment', exact: true }).click();
	await dialog.getByRole('button', { name: 'Clear Alignment', exact: true }).click();
	await dialog.getByRole('button', { name: 'Save Alignment', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Alignment', exact: true })).toContainText('—');
	await expect(dialog.getByRole('region', { name: 'Appearance', exact: true })).toContainText(
		'Travel-worn'
	);
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page.getByRole('button', { name: 'View Alignment', exact: true })).toBeFocused();
});

test('spell renaming preserves detail, note source inspection returns within one dialog', async ({
	page
}) => {
	test.setTimeout(25_000);
	await page.getByRole('button', { name: /Open Proof Spell.*/ }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Edit Name', exact: true }).click();
	await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Renamed proof');
	await dialog.getByRole('button', { name: 'Save Name', exact: true }).click();
	await expect(dialog).toContainText('Remember this detail');
	await dialog.getByRole('button', { name: '1 note', exact: true }).click();
	const source = dialog.getByRole('button', { name: /^Open .* in app$/ });
	await source.scrollIntoViewIfNeeded();
	await expect(source).toBeInViewport();
	await source.click();
	await expect(page.getByRole('dialog').filter({ visible: true })).toHaveCount(1);
	await expect(
		dialog.getByRole('heading', { name: 'System Reference Document 5.1', exact: true }).first()
	).toBeVisible();
	await dialog.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(source).toBeFocused();
	await expect(source).toBeInViewport();
	await expect(dialog.getByRole('region', { name: 'Name', exact: true })).toContainText(
		'Renamed proof'
	);
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page.getByRole('button', { name: /Open Renamed proof.*/ })).toBeFocused();
});

test('targeted skill entry and independent saves protect dirty Close, Back and Escape', async ({
	page
}) => {
	await page.getByRole('button', { name: 'View Athletics', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await expect(dialog.getByRole('heading', { name: 'Athletics', exact: true })).toBeFocused();
	await dialog.getByRole('button', { name: 'Edit Score', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Score', exact: true }).fill('15');
	await dialog.getByRole('button', { name: 'Save Score', exact: true }).click();
	await dialog.getByRole('button', { name: 'Edit Athletics', exact: true }).click();
	await dialog.getByRole('checkbox', { name: 'Athletics', exact: true }).check();
	await dialog.getByRole('button', { name: 'Close', exact: true }).click();
	await expect(dialog.getByRole('group', { name: 'Unsaved changes' })).toBeVisible();
	await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
	await dialog.getByRole('button', { name: 'Back', exact: true }).click();
	await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
	await page.keyboard.press('Escape');
	await dialog.getByRole('button', { name: 'Discard and continue', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'View Athletics', exact: true })).toBeFocused();
	await page.reload();
	await page.getByRole('button', { name: 'View Athletics', exact: true }).click();
	await expect(dialog.getByRole('region', { name: 'Score', exact: true })).toContainText('15');
	await expect(dialog.getByRole('region', { name: 'Athletics', exact: true })).toContainText('No');
});

test('notes save separately and removal supports Undo before confirmation', async ({ page }) => {
	await page.getByRole('button', { name: 'View Athletics', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	const athletics = dialog.getByRole('region', { name: 'Athletics', exact: true });
	await athletics.getByRole('button', { name: 'Add note for Athletics', exact: true }).click();
	await dialog
		.getByRole('textbox', { name: 'Text (optional)', exact: true })
		.fill('Keep this note');
	await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
	await expect(athletics).toContainText('Keep this note');
	await athletics.getByRole('button', { name: 'Edit note 1', exact: true }).click();
	await dialog.getByRole('button', { name: 'Remove note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Undo', exact: true }).click();
	await expect(dialog.getByRole('textbox', { name: 'Text (optional)', exact: true })).toHaveValue(
		'Keep this note'
	);
	await dialog.getByRole('button', { name: 'Cancel note edit', exact: true }).click();
	await athletics.getByRole('button', { name: 'Edit note 1', exact: true }).click();
	await dialog.getByRole('button', { name: 'Remove note', exact: true }).click();
	await dialog.getByRole('button', { name: 'Confirm note removal', exact: true }).click();
	await expect(athletics).not.toContainText('Keep this note');
	await expect(
		athletics.getByRole('button', { name: 'Add note for Athletics', exact: true })
	).toBeVisible();
});

test('invalid local save retains raw draft and clean local Cancel returns to reading', async ({
	page
}) => {
	await page.getByRole('button', { name: 'View Athletics', exact: true }).click();
	const dialog = page.getByRole('dialog').filter({ visible: true });
	await dialog.getByRole('button', { name: 'Edit Score', exact: true }).click();
	await dialog.getByRole('spinbutton', { name: 'Score', exact: true }).fill('');
	await dialog.getByRole('button', { name: 'Save Score', exact: true }).click();
	await expect(dialog.getByRole('alert')).toContainText('finite number');
	await expect(dialog.getByRole('spinbutton', { name: 'Score', exact: true })).toHaveValue('');
	await dialog.getByRole('button', { name: 'Cancel Score edit', exact: true }).click();
	await expect(dialog.getByRole('heading', { name: 'Score', exact: true })).toBeFocused();
	await expect(dialog).toBeVisible();
});
