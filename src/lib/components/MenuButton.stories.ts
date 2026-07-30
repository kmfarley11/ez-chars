import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import MenuButtonStoryHarness from './MenuButtonStoryHarness.svelte';

const meta = {
	title: 'Molecules/MenuButton',
	component: MenuButtonStoryHarness,
	args: {
		text: 'Menu',
		ariaLabel: 'Main menu'
	}
} satisfies Meta<typeof MenuButtonStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IconOnly: Story = {
	args: {
		text: undefined,
		buttonIconOnly: true,
		ariaLabel: 'Settings',
		iconVariant: 'kebab'
	}
};

export const Chevron: Story = {
	args: {
		iconVariant: 'chevron',
		text: 'Options'
	}
};

export const PopulatedMenuInteraction: Story = {
	args: {
		text: 'Actions',
		ariaLabel: 'Actions menu'
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const menuButton = canvas.getByRole('button', { name: 'Actions menu' });

		await step('Menu is closed initially', async () => {
			expect(menuButton).toHaveAttribute('aria-expanded', 'false');
		});

		await step('Open menu and assert semantics', async () => {
			await userEvent.click(menuButton);
			expect(menuButton).toHaveAttribute('aria-expanded', 'true');

			// The menu itself might be rendered outside the canvas in a popover,
			// but we can query the document body if necessary.
			// Native popover is in the top layer. We'll use the body container.
			const body = within(document.body);
			const menu = body.getByRole('list');
			expect(menu).toBeVisible();

			const buttons = within(menu).getAllByRole('button');
			expect(buttons).toHaveLength(3);
			expect(buttons[0]).toHaveTextContent('Edit Profile');
		});

		await step('Verify keyboard reachability', async () => {
			const body = within(document.body);
			const firstMenuItem = body.getByRole('button', { name: 'Edit Profile' });

			// Press Tab to move focus to the first menu item
			await userEvent.tab();
			await expect(firstMenuItem).toHaveFocus();

			// Note: We leave the popover open so Storybook's accessibility check evaluates its visible content.
			// Native Escape dismissal and focus restoration are covered by Playwright E2E tests, as testing-library synthetic events cannot trigger native browser popover cancellation.
		});
	}
};
