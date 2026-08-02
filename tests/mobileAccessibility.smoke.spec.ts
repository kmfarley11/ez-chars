import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoBrowserErrors, installBrowserErrorGuard } from './browserTestGuards';
import { e2eCharacter, e2eStoredCharacters } from './fixtures/characters';

const storageKey = 'ez-chars.characters.v1';
const minimumTouchTarget = 44;

type NamedTarget = {
	name: string;
	locator: Locator;
};

test.beforeEach(async ({ page }, testInfo) => {
	test.skip(
		testInfo.project.name !== 'Mobile Chrome',
		'Mobile accessibility checks use the coarse-pointer project.'
	);
	installBrowserErrorGuard(page);
	await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
		key: storageKey,
		value: e2eStoredCharacters
	});
});

test.afterEach(({ page }) => {
	expectNoBrowserErrors(page);
});

async function openSeededCharacter(page: Page) {
	await page.goto('/');
	await page.getByRole('button', { name: `Open ${e2eCharacter.identity.name}` }).click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-character/);
	await expect(page.getByText('Current HP:', { exact: false })).toBeVisible();
}

async function collectTargetFailures(targets: NamedTarget[], failures: string[]) {
	for (const target of targets) {
		await expect(target.locator, `${target.name} should be visible`).toBeVisible();
		const box = await target.locator.boundingBox();
		if (!box || box.width < minimumTouchTarget || box.height < minimumTouchTarget) {
			failures.push(
				`${target.name}: ${box ? `${box.width.toFixed(2)}x${box.height.toFixed(2)}` : 'no box'}`
			);
		}
	}
}

function rectanglesOverlap(
	first: { x: number; y: number; width: number; height: number },
	second: { x: number; y: number; width: number; height: number }
) {
	return !(
		first.x + first.width <= second.x ||
		second.x + second.width <= first.x ||
		first.y + first.height <= second.y ||
		second.y + second.height <= first.y
	);
}

test('representative phone controls expose non-overlapping 44 CSS-pixel targets', async ({
	page
}) => {
	const failures: string[] = [];
	await page.goto('/');
	const openCharacter = page.getByRole('button', { name: `Open ${e2eCharacter.identity.name}` });
	await collectTargetFailures(
		[
			{ name: 'Create character', locator: page.getByRole('button', { name: 'Create Character' }) },
			{
				name: 'Import characters',
				locator: page.getByRole('button', { name: 'Import Characters' })
			},
			{
				name: 'Export characters',
				locator: page.getByRole('button', { name: 'Export Characters' })
			},
			{ name: 'Open character', locator: openCharacter },
			{
				name: 'Delete character',
				locator: page.getByRole('button', { name: `Delete ${e2eCharacter.identity.name}` })
			}
		],
		failures
	);
	await openCharacter.click();
	await expect(page).toHaveURL(/\/charsheets\/5e\?id=e2e-character/);
	await expect(page.getByText('Current HP:', { exact: false })).toBeVisible();
	const spellsToggle = page.getByRole('button', { name: 'Expand Spells' });
	await collectTargetFailures([{ name: 'Spells section', locator: spellsToggle }], failures);
	await spellsToggle.click();

	const runtimeActions = page.getByRole('list', { name: 'Runtime actions' });
	await collectTargetFailures(
		[
			{ name: 'Main menu', locator: page.getByRole('button', { name: 'Main menu' }) },
			{ name: 'More options', locator: page.getByRole('button', { name: 'More options' }) },
			{
				name: 'Runtime section',
				locator: page.getByRole('button', { name: 'Runtime', exact: true })
			},
			{
				name: 'Quick Reference section',
				locator: page.getByRole('button', { name: 'Collapse Quick Reference' })
			},
			{ name: 'Current HP edit', locator: page.getByRole('button', { name: 'Edit Current HP' }) },
			{
				name: 'Current HP annotations',
				locator: page.getByRole('button', { name: 'Add annotations for Current HP' })
			},
			{ name: 'Runtime add action', locator: page.getByRole('button', { name: 'Add action' }) },
			{
				name: 'Runtime source menu',
				locator: runtimeActions.getByRole('button', { name: 'Source actions for Longsword attack' })
			},
			{
				name: 'Spell collection actions',
				locator: page
					.getByRole('region', { name: 'Spells collection' })
					.getByRole('button', { name: 'Bulk Edit Spells' })
			},
			{
				name: 'Inventory collection actions',
				locator: page
					.getByRole('region', { name: 'Weapons inventory' })
					.getByRole('button', { name: 'Bulk Edit Weapons' })
			}
		],
		failures
	);

	await page.getByRole('button', { name: 'Edit Current HP' }).click();
	await collectTargetFailures(
		[
			{ name: 'Current HP input', locator: page.getByLabel('Current HP') },
			{ name: 'Primitive save', locator: page.getByRole('button', { name: 'Save', exact: true }) },
			{
				name: 'Primitive cancel',
				locator: page.getByRole('button', { name: 'Cancel', exact: true })
			}
		],
		failures
	);
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();

	const cardActions = page.getByRole('button', { name: 'Card actions' }).first();
	await cardActions.click();
	await collectTargetFailures(
		[
			{ name: 'Card menu edit', locator: page.getByRole('button', { name: 'Edit', exact: true }) },
			{ name: 'Card menu notes', locator: page.getByRole('button', { name: 'Notes', exact: true }) }
		],
		failures
	);
	await page.keyboard.press('Escape');

	await page.getByRole('button', { name: 'Add action' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add action' });
	await dialog.getByRole('button', { name: 'Inventory', exact: true }).click();
	const equippedCheckbox = dialog.getByRole('checkbox', { name: 'Equipped only' });
	const equippedLabel = equippedCheckbox.locator('..');
	const categoryButtons = [
		dialog.getByRole('button', { name: 'All', exact: true }),
		dialog.getByRole('button', { name: 'Inventory', exact: true }),
		dialog.getByRole('button', { name: 'Spells', exact: true }),
		dialog.getByRole('button', { name: 'Features', exact: true }),
		dialog.getByRole('button', { name: 'Traits', exact: true })
	];
	await collectTargetFailures(
		[
			{ name: 'Dialog cancel', locator: dialog.getByRole('button', { name: 'Cancel' }) },
			{
				name: 'Create custom action',
				locator: dialog.getByRole('button', { name: /Create custom action/ })
			},
			{ name: 'Source search', locator: dialog.getByRole('searchbox') },
			...categoryButtons.map((locator, index) => ({
				name: `Source category ${index + 1}`,
				locator
			})),
			{ name: 'Equipped-only label', locator: equippedLabel },
			{
				name: 'Inventory source candidate',
				locator: dialog.getByRole('button', { name: /Longsword/ })
			}
		],
		failures
	);
	await expect(equippedCheckbox).not.toBeChecked();
	await equippedLabel.click();
	await expect(equippedCheckbox).toBeChecked();

	for (let index = 1; index < categoryButtons.length; index++) {
		const previousBox = await categoryButtons[index - 1].boundingBox();
		const currentBox = await categoryButtons[index].boundingBox();
		if (previousBox && currentBox && rectanglesOverlap(previousBox, currentBox)) {
			failures.push(`Source categories ${index} and ${index + 1}: overlapping targets`);
		}
	}

	expect(failures, `Touch-target failures:\n${failures.join('\n')}`).toEqual([]);
});

test('collapsed phone regions leave hidden controls out of keyboard order', async ({ page }) => {
	await openSeededCharacter(page);
	const runtimeToggle = page.getByRole('button', { name: 'Runtime', exact: true });
	const organizationalToggle = page.getByRole('button', { name: 'Organizational', exact: true });

	await runtimeToggle.focus();
	await page.keyboard.press('Enter');
	await expect(runtimeToggle).toHaveAttribute('aria-expanded', 'false');
	await page.keyboard.press('Tab');
	await expect(organizationalToggle).toBeFocused();

	await runtimeToggle.focus();
	await page.keyboard.press('Enter');
	const quickReferenceToggle = page.getByRole('button', { name: /Quick Reference/ });
	await page.keyboard.press('Tab');
	await expect(quickReferenceToggle).toBeFocused();

	await page.keyboard.press('Enter');
	await expect(quickReferenceToggle).toHaveAttribute('aria-expanded', 'false');
	await page.keyboard.press('Tab');
	await expect(
		page.getByRole('button', { name: 'Collapse Actions / Runtime Summary' })
	).toBeFocused();
});

test('phone dialog confines focus and restores its invoker', async ({ page }) => {
	await openSeededCharacter(page);
	const trigger = page.getByRole('button', { name: 'Add action' });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: 'Add action' });
	await expect(dialog).toBeVisible();

	for (let index = 0; index < 12; index++) {
		await page.keyboard.press('Tab');
		expect(
			await dialog.evaluate(
				(element) =>
					element.contains(document.activeElement) || document.activeElement === document.body
			),
			`Tab ${index + 1} should not move focus to an interactive element outside the modal dialog`
		).toBe(true);
	}

	await dialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(dialog).not.toBeVisible();
	await expect(trigger).toBeFocused();
});
