import { expect, test, type Page } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import {
	e2eCharacter,
	e2eLegacyCharacter,
	e2eLegacyStoredCharacters,
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
	await page.getByRole('menuitem', { name: 'Edit' }).click();

	const dialog = page.getByRole('dialog').filter({ hasText: 'Runtime Actions' });
	await dialog.getByRole('button', { name: 'Add Action' }).click();
	await dialog.getByLabel('Runtime Actions Name').last().fill('Dash');
	await dialog.getByLabel('Runtime Actions Timing').last().selectOption('action');
	await dialog.getByLabel('Runtime Actions Category').last().selectOption('effect');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(cardActions).toBeFocused();

	await cardActions.click();
	await page.getByRole('menuitem', { name: 'Notes' }).click();
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

	await page.getByRole('button', { name: 'Add action from inventory' }).click();
	const dialog = page.getByRole('dialog', { name: 'Select Inventory Item' });
	await expect(dialog).toBeVisible();

	// Check filtering and back behavior
	await dialog.getByRole('searchbox').fill('Unknown');
	await expect(dialog.getByText('No items match your search')).toBeVisible();
	await dialog.getByRole('searchbox').clear();

	await dialog.getByRole('button', { name: /Longsword/ }).click();
	await expect(page.getByRole('dialog', { name: 'Customize Action' })).toBeVisible();

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
	await page.getByRole('menuitem', { name: 'Notes' }).click();
	const notesDialog = page.getByRole('dialog').filter({ hasText: 'Notes' });
	await expect(notesDialog).toBeVisible();
	await notesDialog.getByRole('button', { name: 'Close' }).click();

	await page.reload();
	await expect(runtimeActionList.getByText('Original item notes.')).toBeVisible();
	const weaponsRegion = page.getByRole('region', { name: 'Weapons inventory' });
	await runtimeActionList.getByRole('button', { name: 'Source actions for Longsword' }).click();
	await runtimeActionList.getByRole('menuitem', { name: 'View Longsword' }).click();
	await expect(weaponsRegion).toBeFocused();

	await weaponsRegion.getByRole('button', { name: 'Card actions' }).click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
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
	await runtimeActionList.getByRole('menuitem', { name: 'Resync from source' }).click();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters[0].systemData.runtimeActions[0].notes : undefined;
			}, storageKey)
		)
		.toBe('Updated item notes.');

	await weaponsRegion.getByRole('button', { name: 'Card actions' }).click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
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

	// 1. Focus restoration & Cancellation
	const triggerButton = page.getByRole('button', { name: 'Add action from inventory' });
	await triggerButton.click();

	const dialog = page.getByRole('dialog', { name: 'Select Inventory Item' });
	await expect(dialog).toBeVisible();

	// Test filtered-selection retention
	const searchInput = dialog.getByRole('searchbox');
	await searchInput.fill('sword');
	await expect(dialog.getByRole('button', { name: /Longsword/ })).toBeVisible();

	await dialog.getByRole('button', { name: /Longsword/ }).click();
	const customizeDialog = page.getByRole('dialog', { name: 'Customize Action' });
	await expect(customizeDialog).toBeVisible();

	// Go back, change the query so the selected item is filtered out, and retain it.
	await page.getByRole('button', { name: 'Back', exact: true }).click();
	await expect(dialog).toBeVisible();
	await expect(searchInput).toHaveValue('sword');
	await searchInput.fill('rope');
	await expect(dialog.getByRole('button', { name: /Rope/ })).toBeVisible();
	await expect(dialog.getByText('Selected (Filtered)')).toBeVisible();
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

	// Verify no action was added
	const runtimeActionList = page.getByRole('list', { name: 'Runtime actions' });
	await expect(runtimeActionList.getByText('Longsword')).toHaveCount(0);
});

test('exports and imports the seeded character backup', async ({ page }, testInfo) => {
	await page.goto('/');
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export Characters' }).click();
	const download = await downloadPromise;
	const backupPath = testInfo.outputPath('ez-chars-backup.json');
	await download.saveAs(backupPath);

	await page.evaluate((key) => localStorage.removeItem(key), storageKey);
	await expect(page.evaluate((key) => localStorage.getItem(key), storageKey)).resolves.toBeNull();

	await page.getByLabel('Choose character import JSON file').setInputFiles(backupPath);
	await expect(page.getByRole('status')).toContainText('Ready to import 1 character');
	await page.getByRole('button', { name: 'Replace All' }).click();
	const seededRow = page.locator('tbody tr').filter({ hasText: e2eCharacter.identity.name });
	await expect(seededRow).toHaveCount(1);
});

test('hydrates legacy local data before opening and persists the canonical character', async ({
	page
}) => {
	await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: storageKey,
		value: e2eLegacyStoredCharacters
	});
	await page.goto('/');
	await page
		.locator('tbody tr')
		.filter({ hasText: e2eLegacyCharacter.identity.name })
		.locator('td')
		.first()
		.click();

	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-legacy-character/);
	await expect(
		page.getByRole('list', { name: 'Runtime actions' }).getByText('Legacy Dash', { exact: true })
	).toBeVisible();
	await expect(page.getByText(/Motives:\s*Protect the migrated party\./)).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				if (!raw) return undefined;
				const character = JSON.parse(raw).characters[0];
				return {
					version: character.meta.schemaVersion,
					hasAttacks: 'attacks' in character.systemData,
					inventoryIds: character.inventory.map((item: { id: string }) => item.id),
					gp: character.systemData.currency.gp?.amount,
					motives: character.systemData.roleplay.motives?.body,
					languages: character.systemData.proficiencies.languages,
					speed: character.systemData.combat.speed
				};
			}, storageKey)
		)
		.toEqual({
			version: 'dnd5e-2014.v3',
			hasAttacks: false,
			inventoryIds: ['legacy-rope'],
			gp: 4,
			motives: 'Protect the migrated party.',
			languages: [
				{ name: 'Common', source: { kind: 'ancestry' } },
				{ name: 'Elvish', source: { kind: 'ancestry' } }
			],
			speed: 30
		});
});
