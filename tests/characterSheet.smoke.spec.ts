import { expect, test, type Page } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import {
	e2eCharacter,
	e2eOutdatedStoredCharacters,
	e2eRuntimeActionLinkCharacter,
	e2eRuntimeActionLinkStoredCharacters,
	e2eStoredCharacters
} from './fixtures/characters';

const storageKey = 'ez-chars.characters.v1';

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
			value: e2eStoredCharacters
		}
	);
});

test.afterEach(({ page }) => {
	expectNoBrowserErrors(page);
});

async function openSeededCharacter(page: Page) {
	await page.goto('/');
	await page
		.locator('tbody tr')
		.filter({ hasText: e2eCharacter.identity.name })
		.locator('td')
		.first()
		.click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-character/);
	await expect(page.getByText('Current HP:', { exact: false })).toBeVisible();
}

test('navigates to a seeded character, adjusts viewport, collapses a region, and edits Current HP', async ({
	page
}) => {
	await openSeededCharacter(page);

	await page.setViewportSize({ width: 390, height: 844 });
	const runtimeToggle = page.getByRole('button', { name: 'Runtime', exact: true });
	await runtimeToggle.click();
	await expect(runtimeToggle).toHaveAttribute('aria-expanded', 'false');
	await runtimeToggle.click();

	await page.getByRole('button', { name: 'Edit Current HP' }).click();
	await page.getByLabel('Current HP').fill('9');
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(page.getByText(/Current HP:\s*9/)).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters[0].systemData.combat.hitPoints.current : undefined;
			}, storageKey)
		)
		.toBe(9);
});

test('adds a D&D Beyond note annotation and exposes its reference link', async ({ page }) => {
	await openSeededCharacter(page);

	await page.getByRole('button', { name: 'Add annotations for Current HP' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByRole('button', { name: 'Add' }).click();
	await dialog.getByText('Annotations (0)').click();
	await dialog.getByRole('button', { name: 'Add' }).click();
	await dialog.locator('input[data-annotation-name-input]').fill('HP rule');
	await dialog.locator('textarea').fill('Use the current value during play.');
	await dialog.getByLabel('D&D Beyond Basic Rules (2014)').check();
	await dialog.getByRole('button', { name: 'Save' }).click();

	const reference = dialog.getByRole('link', { name: /dndbeyond-basic-rules-2014/ });
	await expect(reference).toHaveAttribute('href', /dndbeyond\.com/);
});

test('adds a structured runtime action and preserves it after reload', async ({ page }) => {
	await openSeededCharacter(page);

	const runtimeActionList = page.getByRole('list', { name: 'Runtime actions' });
	await expect(runtimeActionList.getByText('Longsword attack', { exact: true })).toBeVisible();
	await expect(runtimeActionList.getByText('Improvise', { exact: true })).toBeVisible();
	await expect(
		runtimeActionList.getByRole('button', { name: 'Source actions for Longsword attack' })
	).toBeVisible();
	await expect(
		runtimeActionList.getByRole('button', { name: 'Source actions for Improvise' })
	).toHaveCount(0);

	const actionsGroup = page
		.getByRole('button', { name: 'Collapse Actions / Runtime Summary' })
		.locator('../..');
	const cardActions = actionsGroup.getByRole('button', { name: 'Card actions' });
	await cardActions.click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();

	const dialog = page.getByRole('dialog').filter({ hasText: 'Runtime Actions' });
	await dialog.getByRole('button', { name: 'Add Action' }).click();
	await dialog.getByLabel('Runtime Actions Name').last().fill('Dash');
	await dialog.getByLabel('Runtime Actions Timing').last().selectOption('action');
	await dialog.getByLabel('Runtime Actions Category').last().selectOption('effect');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(cardActions).toBeFocused();

	await cardActions.click();
	await page.getByRole('button', { name: 'Notes', exact: true }).click();
	const notesDialog = page.getByRole('dialog', { name: 'Notes' });
	await notesDialog.getByRole('button', { name: 'Close' }).click();
	await expect(cardActions).toBeFocused();

	await expect(runtimeActionList.getByText('Dash', { exact: true })).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				const actions = raw ? JSON.parse(raw).characters[0].systemData.runtimeActions : [];
				return actions.find((action: { name: string }) => action.name === 'Dash');
			}, storageKey)
		)
		.toMatchObject({ name: 'Dash' });

	await page.reload();
	await expect(runtimeActionList.getByText('Dash', { exact: true })).toBeVisible();
});

test('links an inventory suggestion through resync and source deletion fallback', async ({
	page
}) => {
	test.setTimeout(30_000);
	await page.addInitScript(
		({ characterId, key, value }) => {
			const raw = localStorage.getItem(key);
			const storedCharacterId = raw ? JSON.parse(raw).characters?.[0]?.meta?.id : undefined;
			if (storedCharacterId !== characterId) localStorage.setItem(key, JSON.stringify(value));
		},
		{
			characterId: e2eRuntimeActionLinkCharacter.meta.id,
			key: storageKey,
			value: e2eRuntimeActionLinkStoredCharacters
		}
	);
	await page.goto('/');
	await page
		.locator('tbody tr')
		.filter({ hasText: e2eRuntimeActionLinkCharacter.identity.name })
		.locator('td')
		.first()
		.click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-runtime-action-link/);

	await page.getByRole('button', { name: 'Add action' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add action' });
	await expect(dialog).toBeVisible();

	// Check filtering and back behavior
	await dialog.getByRole('searchbox').fill('Unknown');
	await expect(dialog.getByText('No action sources match these filters.')).toBeVisible();
	await dialog.getByRole('searchbox').clear();

	await dialog.getByRole('button', { name: /Longsword/ }).click();
	await expect(page.getByRole('dialog', { name: 'Review action' })).toBeVisible();

	await page.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(dialog).toBeVisible();

	await dialog.getByRole('button', { name: /Longsword/ }).click();
	await page.getByRole('button', { name: 'Confirm Action' }).click();
	const runtimeActionList = page.getByRole('list', { name: 'Runtime actions' });
	await expect(runtimeActionList.getByText('Original item notes.')).toBeVisible();
	await expect(
		runtimeActionList.getByRole('button', { name: 'Source actions for Longsword' })
	).toBeVisible();
	await expect(page.getByText('Linked to Longsword')).toHaveCount(0);
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters[0].systemData.runtimeActions[0] : undefined;
			}, storageKey)
		)
		.toMatchObject({
			name: 'Longsword',
			notes: 'Original item notes.',
			source: { kind: 'item', id: 'e2e-longsword' }
		});

	const actionsGroup = page
		.getByRole('button', { name: 'Collapse Actions / Runtime Summary' })
		.locator('../..');
	await actionsGroup.getByRole('button', { name: 'Card actions' }).click();
	await page.getByRole('button', { name: 'Notes', exact: true }).click();
	const notesDialog = page.getByRole('dialog').filter({ hasText: 'Notes' });
	await expect(notesDialog).toBeVisible();
	await notesDialog.getByRole('button', { name: 'Close' }).click();

	await page.reload();
	await expect(runtimeActionList.getByText('Original item notes.')).toBeVisible();
	const weaponsRegion = page.getByRole('region', { name: 'Weapons inventory' });
	await runtimeActionList.getByRole('button', { name: 'Source actions for Longsword' }).click();
	await runtimeActionList.getByRole('button', { name: 'View Inventory · Longsword' }).click();
	await expect(weaponsRegion).toBeFocused();

	await weaponsRegion.getByRole('button', { name: 'Card actions' }).click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	let inventoryDialog = page.getByRole('dialog');
	await inventoryDialog.getByLabel('Weapons Detail').first().fill('Updated item notes.');
	await inventoryDialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(weaponsRegion.getByRole('button', { name: 'Card actions' })).toBeFocused();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				if (!raw) return undefined;
				const character = JSON.parse(raw).characters[0];
				return {
					itemNotes: character.inventory[0].notes,
					actionNotes: character.systemData.runtimeActions[0].notes
				};
			}, storageKey)
		)
		.toEqual({ itemNotes: 'Updated item notes.', actionNotes: 'Original item notes.' });

	await runtimeActionList.getByRole('button', { name: 'Source actions for Longsword' }).click();
	page.once('dialog', async (confirmation) => {
		expect(confirmation.message()).toContain('Source-owned name and detail may overwrite');
		await confirmation.dismiss();
	});
	await runtimeActionList.getByRole('button', { name: 'Resync from source' }).click();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters[0].systemData.runtimeActions[0].notes : undefined;
			}, storageKey)
		)
		.toBe('Original item notes.');

	await runtimeActionList.getByRole('button', { name: 'Source actions for Longsword' }).click();
	page.once('dialog', async (confirmation) => {
		expect(confirmation.message()).toContain('Source-owned name and detail may overwrite');
		await confirmation.accept();
	});
	await runtimeActionList.getByRole('button', { name: 'Resync from source' }).click();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters[0].systemData.runtimeActions[0].notes : undefined;
			}, storageKey)
		)
		.toBe('Updated item notes.');

	await weaponsRegion.getByRole('button', { name: 'Card actions' }).click();
	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	inventoryDialog = page.getByRole('dialog');
	await inventoryDialog.getByRole('button', { name: 'Remove' }).first().click();
	await inventoryDialog.getByRole('button', { name: 'Save', exact: true }).click();

	await expect(runtimeActionList.getByText('Updated item notes.')).toBeVisible();
	await expect(page.getByText('Custom action', { exact: true })).toHaveCount(0);
	await expect(
		runtimeActionList.getByRole('button', { name: 'Source actions for Longsword' })
	).toHaveCount(0);
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				if (!raw) return undefined;
				const character = JSON.parse(raw).characters[0];
				return {
					inventoryCount: character.inventory.length,
					action: character.systemData.runtimeActions[0]
				};
			}, storageKey)
		)
		.toMatchObject({
			inventoryCount: 1,
			action: { name: 'Longsword', notes: 'Updated item notes.' }
		});
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				const action = raw ? JSON.parse(raw).characters[0].systemData.runtimeActions[0] : undefined;
				return action ? 'source' in action : undefined;
			}, storageKey)
		)
		.toBe(false);
});

test('creates and navigates spell, feature, trait, and custom runtime actions', async ({
	page
}) => {
	test.setTimeout(20_000);
	await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: storageKey,
		value: e2eRuntimeActionLinkStoredCharacters
	});
	await page.goto('/');
	await page
		.locator('tbody tr')
		.filter({ hasText: e2eRuntimeActionLinkCharacter.identity.name })
		.locator('td')
		.first()
		.click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-runtime-action-link/);

	const addLinkedAction = async (
		category: 'Spells' | 'Features' | 'Traits',
		sourceName: string
	) => {
		await page.getByRole('button', { name: 'Add action' }).click();
		const selection = page.getByRole('dialog', { name: 'Add action' });
		await selection.getByRole('button', { name: category }).click();
		await selection.getByRole('button', { name: new RegExp(sourceName) }).click();
		const review = page.getByRole('dialog', { name: 'Review action' });
		await expect(review.getByRole('textbox', { name: 'Name' })).toHaveValue(sourceName);
		await review.getByRole('button', { name: 'Confirm Action' }).click();
	};

	await addLinkedAction('Spells', 'Shield');
	await addLinkedAction('Features', 'Arcane Recovery');
	await addLinkedAction('Traits', 'Darkvision');

	await page.getByRole('button', { name: 'Add action' }).click();
	let dialog = page.getByRole('dialog', { name: 'Add action' });
	await dialog.getByRole('button', { name: /Create custom action/ }).click();
	dialog = page.getByRole('dialog', { name: 'Review action' });
	await dialog.getByRole('textbox', { name: 'Name' }).fill('Distract');
	await dialog.getByRole('button', { name: 'Confirm Action' }).click();

	const actions = page.getByRole('list', { name: 'Runtime actions' });
	for (const actionName of ['Shield', 'Arcane Recovery', 'Darkvision', 'Distract']) {
		await expect(actions.getByText(actionName, { exact: true })).toBeVisible();
	}
	await expect(actions.getByRole('button', { name: 'Source actions for Distract' })).toHaveCount(0);
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw
					? JSON.parse(raw).characters[0].systemData.runtimeActions.map(
							(action: { name: string; source?: { kind: string; id: string } }) => ({
								name: action.name,
								source: action.source
							})
						)
					: [];
			}, storageKey)
		)
		.toEqual([
			{ name: 'Shield', source: { kind: 'spell', id: 'e2e-shield-spell' } },
			{
				name: 'Arcane Recovery',
				source: { kind: 'feature', id: 'e2e-arcane-recovery' }
			},
			{ name: 'Darkvision', source: { kind: 'feature', id: 'e2e-darkvision' } },
			{ name: 'Distract' }
		]);

	await actions.getByRole('button', { name: 'Source actions for Shield' }).click();
	await actions.getByRole('button', { name: 'View Spell · Shield' }).click();
	await expect(page.getByRole('region', { name: '1st spells' })).toBeFocused();

	await actions.getByRole('button', { name: 'Source actions for Arcane Recovery' }).click();
	await actions.getByRole('button', { name: 'View Feature · Arcane Recovery' }).click();
	await expect(page.getByRole('region', { name: 'Features' })).toBeFocused();

	await actions.getByRole('button', { name: 'Source actions for Darkvision' }).click();
	await actions.getByRole('button', { name: 'View Trait · Darkvision' }).click();
	await expect(page.getByRole('region', { name: 'Traits' })).toBeFocused();
});

test('dialog interaction behavior: cancellation, filtered selection retention, and focus restoration', async ({
	page
}) => {
	await page.addInitScript(
		({ characterId, key, value }) => {
			const raw = localStorage.getItem(key);
			const storedCharacterId = raw ? JSON.parse(raw).characters?.[0]?.meta?.id : undefined;
			if (storedCharacterId !== characterId) localStorage.setItem(key, JSON.stringify(value));
		},
		{
			characterId: e2eRuntimeActionLinkCharacter.meta.id,
			key: storageKey,
			value: e2eRuntimeActionLinkStoredCharacters
		}
	);
	await page.goto('/');
	await page
		.locator('tbody tr')
		.filter({ hasText: e2eRuntimeActionLinkCharacter.identity.name })
		.locator('td')
		.first()
		.click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-runtime-action-link/);

	const triggerButton = page.getByRole('button', { name: 'Add action' });
	await triggerButton.click();

	// Record scroll position after Playwright scrolls the button into view
	const initialScrollY = await page.evaluate(() => window.scrollY);

	const dialog = page.getByRole('dialog', { name: 'Add action' });
	await expect(dialog).toBeVisible();

	// Assert scroll locking and position preservation
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
	await page.mouse.wheel(0, 500); // Attempt to scroll via wheel
	await page.waitForTimeout(100);
	expect(await page.evaluate(() => window.scrollY)).toBe(initialScrollY);

	// Test filtered-selection retention
	const searchInput = dialog.getByRole('searchbox');
	await searchInput.fill('sword');
	await expect(dialog.getByRole('button', { name: /Longsword/ })).toBeVisible();

	await dialog.getByRole('button', { name: /Longsword/ }).click();
	const customizeDialog = page.getByRole('dialog', { name: 'Review action' });
	await expect(customizeDialog).toBeVisible();

	// Assert focus shifted to the heading
	await expect(customizeDialog.getByRole('heading', { name: 'Review action' })).toBeFocused();

	// Go back, change the query so the selected item is filtered out, and retain it.
	await page.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(dialog).toBeVisible();

	// Assert focus shifted back to the heading
	await expect(dialog.getByRole('heading', { name: 'Add action' })).toBeFocused();
	await expect(searchInput).toHaveValue('sword');
	await searchInput.fill('rope');
	await expect(dialog.getByRole('button', { name: /Rope/ })).toBeVisible();
	await expect(dialog.getByText('Selected (filtered)')).toBeVisible();
	await expect(dialog.getByRole('button', { name: /Longsword/ })).toBeVisible();

	// Proceed and cancel to verify no mutation and focus restoration
	await dialog.getByRole('button', { name: /Longsword/ }).click();
	await expect(customizeDialog).toBeVisible();

	// Modify draft slightly before cancelling to ensure it's not saved
	await customizeDialog.getByRole('textbox', { name: 'Target' }).fill('Nothing');

	await page.getByRole('button', { name: 'Cancel' }).click();
	await expect(dialog).not.toBeVisible();
	await expect(customizeDialog).not.toBeVisible();

	await expect(triggerButton).toBeFocused();

	// Verify scroll is restored and position is initially preserved
	await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
	expect(await page.evaluate(() => window.scrollY)).toBe(initialScrollY);

	// Verify scrolling is permitted again
	await page.mouse.wheel(0, 500);
	await page.waitForTimeout(100);
	expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(initialScrollY);

	// Verify no action was added
	const runtimeActionList = page.getByRole('list', { name: 'Runtime actions' });
	await expect(runtimeActionList.getByText('Longsword')).toHaveCount(0);
});

test('exports and imports the seeded character backup with dialogs', async ({ page }, testInfo) => {
	let downloadCount = 0;
	page.on('download', () => {
		downloadCount++;
	});

	await page.addInitScript(() => {
		const originalText = File.prototype.text;
		(window as any).__slowTextResolvers = [];
		File.prototype.text = function () {
			if (this.name === 'slow.json') {
				return new Promise((resolve) =>
					(window as any).__slowTextResolvers.push(() => resolve('not json'))
				);
			}
			return originalText.call(this);
		};
	});

	await page.goto('/');

	// 1. Export Flow: Cancellation
	await page.getByRole('button', { name: 'Export Characters' }).click();
	const exportDialog = page.getByRole('dialog', { name: 'Export Characters' });
	await expect(exportDialog).toBeVisible();
	await exportDialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(exportDialog).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'Export Characters' })).toBeFocused();
	expect(downloadCount).toBe(0);

	// 2. Export Flow: Success
	await page.getByRole('button', { name: 'Export Characters' }).click();
	await expect(exportDialog).toBeVisible();
	const downloadPromise = page.waitForEvent('download');
	await exportDialog.getByRole('button', { name: 'Export' }).click();
	const download = await downloadPromise;
	const backupPath = testInfo.outputPath('ez-chars-backup.json');
	await download.saveAs(backupPath);
	await expect(exportDialog).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'Export Characters' })).toBeFocused();
	expect(downloadCount).toBe(1);

	// 3. Import Flow: Invalid JSON
	let fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	let fileChooser = await fileChooserPromise;
	await fileChooser.setFiles({
		name: 'invalid.json',
		mimeType: 'application/json',
		buffer: Buffer.from('not json')
	});
	const importDialog = page.getByRole('dialog', { name: 'Import Characters' });
	await expect(importDialog).toBeVisible();
	await expect(importDialog.getByText('That file is not valid JSON.')).toBeVisible();
	await importDialog.getByRole('button', { name: 'Cancel' }).click();

	// 4. Import Flow: Unsupported data
	fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	fileChooser = await fileChooserPromise;
	await fileChooser.setFiles({
		name: 'unsupported.json',
		mimeType: 'application/json',
		buffer: Buffer.from('{"foo":"bar"}')
	});
	await expect(importDialog).toBeVisible();
	await expect(importDialog.getByText('not a supported ez-chars character export')).toBeVisible();
	await importDialog.getByRole('button', { name: 'Cancel' }).click();

	// 5. Import Flow: Merge New with duplicates
	fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	fileChooser = await fileChooserPromise;
	await fileChooser.setFiles(backupPath);
	await expect(importDialog).toBeVisible();
	await expect(importDialog.getByText('Ready to import 1 character')).toBeVisible();
	await expect(
		importDialog.getByText('Destructive. Discards your current local list entirely.')
	).toBeVisible();
	await importDialog.getByRole('button', { name: 'Merge New' }).click();
	await expect(
		importDialog.getByText('Merged 0 new characters and skipped 1 duplicate character')
	).toBeVisible();
	await importDialog.getByRole('button', { name: 'Done' }).click();
	await expect(importDialog).not.toBeVisible();

	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters.length : undefined;
			}, storageKey)
		)
		.toBe(1);

	// 6. Import Flow: Cancellation explicitly preserving data
	fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	fileChooser = await fileChooserPromise;
	await fileChooser.setFiles(backupPath);
	await expect(importDialog).toBeVisible();

	const preCancelStorage = await page.evaluate((key) => localStorage.getItem(key), storageKey);

	// Immediate cancel simulates cancellation while a read remains pending or completes
	await importDialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(importDialog).not.toBeVisible();

	const postCancelStorage = await page.evaluate((key) => localStorage.getItem(key), storageKey);
	expect(postCancelStorage).toBe(preCancelStorage);

	await page.evaluate((key) => localStorage.removeItem(key), storageKey);
	await expect(page.evaluate((key) => localStorage.getItem(key), storageKey)).resolves.toBeNull();

	// 7. Import Flow: Selecting the same file again
	fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	fileChooser = await fileChooserPromise;
	await fileChooser.setFiles(backupPath); // Same file!

	await expect(importDialog).toBeVisible();
	await expect(importDialog.getByText('Ready to import 1 character')).toBeVisible();

	// 3. Import Flow: Replace All and Success State
	await importDialog.getByRole('button', { name: 'Replace All' }).click();
	await expect(
		importDialog.getByText('Replaced local characters with 1 imported character')
	).toBeVisible();
	await importDialog.getByRole('button', { name: 'Done' }).click();

	await expect(importDialog).not.toBeVisible();
	await expect(page.getByRole('button', { name: 'Import Characters' })).toBeFocused();

	const seededRow = page.locator('tbody tr').filter({ hasText: e2eCharacter.identity.name });
	await expect(seededRow).toHaveCount(1);
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters[0].meta.schemaVersion : undefined;
			}, storageKey)
		)
		.toBe('dnd5e-2014.schema.v0');

	// 9. Import Flow: Cancellation/reselection while a read remains pending
	fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	fileChooser = await fileChooserPromise;
	await fileChooser.setFiles({
		name: 'slow.json',
		mimeType: 'application/json',
		buffer: Buffer.from('')
	});

	await expect(importDialog).toBeVisible();
	await expect(importDialog.getByText('Reading import file...')).toBeVisible();
	await importDialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(importDialog).not.toBeVisible();

	// Proceed to start a new import
	fileChooserPromise = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: 'Import Characters' }).click();
	fileChooser = await fileChooserPromise;
	await fileChooser.setFiles({
		name: 'unsupported.json',
		mimeType: 'application/json',
		buffer: Buffer.from('{"foo":"bar"}')
	});

	await expect(importDialog).toBeVisible();
	await expect(importDialog.getByText('not a supported ez-chars character export')).toBeVisible();

	// Now resolve the stale read
	await page.evaluate(() => {
		(window as any).__slowTextResolvers.forEach((r: () => void) => r());
	});

	// Verify the dialog hasn't changed its state
	await expect(importDialog.getByText('not a supported ez-chars character export')).toBeVisible();
	await expect(importDialog.getByText('That file is not valid JSON.')).toHaveCount(0);
	await importDialog.getByRole('button', { name: 'Cancel' }).click();
});

test('preserves rejected outdated local data and offers non-destructive recovery', async ({
	page
}) => {
	await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: storageKey,
		value: e2eOutdatedStoredCharacters
	});
	const originalStoredValue = JSON.stringify(e2eOutdatedStoredCharacters);
	await page.goto('/');
	await expect(
		page.getByRole('alert').filter({ hasText: 'Stored character data could not be loaded' })
	).toBeVisible();
	await expect(page.locator('tbody tr').filter({ hasText: 'Theren Vael' })).toHaveCount(1);
	expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(
		originalStoredValue
	);
});
