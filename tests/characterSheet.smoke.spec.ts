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

	const actionsGroup = page
		.getByRole('button', { name: 'Collapse Actions / Runtime Summary' })
		.locator('../..');
	await actionsGroup.getByRole('button', { name: 'Card actions' }).click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();

	const dialog = page.getByRole('dialog').filter({ hasText: 'Runtime Actions' });
	await dialog.getByRole('button', { name: 'Add Action' }).click();
	await dialog.getByLabel('Runtime Actions Name').fill('Dash');
	await dialog.getByLabel('Runtime Actions Timing').selectOption('action');
	await dialog.getByLabel('Runtime Actions Category').selectOption('effect');
	await dialog.getByRole('button', { name: 'Save', exact: true }).click();

	await expect(page.getByText(/Runtime Actions:\s*Dash/)).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate((key) => {
				const raw = localStorage.getItem(key);
				return raw ? JSON.parse(raw).characters[0].systemData.runtimeActions?.[0]?.name : undefined;
			}, storageKey)
		)
		.toBe('Dash');

	await page.reload();
	await expect(page.getByText(/Runtime Actions:\s*Dash/)).toBeVisible();
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
	await page.getByRole('button', { name: 'Add Longsword' }).click();
	await expect(page.getByText('Linked to Longsword')).toBeVisible();
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

	await page.reload();
	await expect(page.getByText('Linked to Longsword')).toBeVisible();
	const weaponsRegion = page.getByRole('region', { name: 'Weapons inventory' });
	await page.getByRole('button', { name: 'View Longsword' }).click();
	await expect(weaponsRegion).toBeFocused();

	await weaponsRegion.getByRole('button', { name: 'Card actions' }).click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
	let inventoryDialog = page.getByRole('dialog');
	await inventoryDialog.getByLabel('Weapons Detail').fill('Updated item notes.');
	await inventoryDialog.getByRole('button', { name: 'Save', exact: true }).click();
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

	await page.getByRole('button', { name: 'Resync from source' }).click();
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
	await inventoryDialog.getByRole('button', { name: 'Remove' }).click();
	await inventoryDialog.getByRole('button', { name: 'Save', exact: true }).click();

	await expect(page.getByText('Custom action')).toBeVisible();
	await expect(page.getByRole('button', { name: 'View Longsword' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Resync from source' })).toHaveCount(0);
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
			inventoryCount: 0,
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
	await expect(page.getByText(/Runtime Actions:\s*Legacy Dash/)).toBeVisible();
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
