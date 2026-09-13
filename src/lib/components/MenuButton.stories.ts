import type { Meta, StoryObj } from '@storybook/sveltekit';
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

export const CompactIconOnly: Story = {
	args: {
		text: undefined,
		buttonIconOnly: true,
		buttonSize: 'sm',
		ariaLabel: 'Card actions',
		iconVariant: 'ellipsis'
	}
};

export const Chevron: Story = {
	args: {
		iconVariant: 'chevron',
		text: 'Options'
	}
};

export const PopulatedMenu: Story = {
	args: {
		text: 'Actions',
		ariaLabel: 'Actions menu'
	}
};
