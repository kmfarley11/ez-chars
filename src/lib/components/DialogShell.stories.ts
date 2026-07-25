import type { Meta, StoryObj } from '@storybook/sveltekit';
import DialogShell from './DialogShell.svelte';
import { fn } from 'storybook/test';

const meta = {
	title: 'Molecules/DialogShell',
	component: DialogShell,
	args: {
		open: true,
		title: 'Example Dialog',
		closeText: 'Close',
		onClose: fn(),
		onBack: fn()
	}
} satisfies Meta<typeof DialogShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBackStep: Story = {
	args: {
		showBack: true
	}
};

export const MobileFullHeight: Story = {
	args: {
		fullHeightMobile: true
	}
};
