import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollapsibleGridContentCardStory from './CollapsibleGridContentCardStory.svelte';

const meta = {
	title: 'Organisms/CollapsibleGridContentCard',
	component: CollapsibleGridContentCardStory,
	args: {
		startsCollapsed: false
	}
} satisfies Meta<typeof CollapsibleGridContentCardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

import { expect, userEvent, within } from 'storybook/test';

export const Expanded: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggleBtn = canvas.getByRole('button', { name: /Stats/i });

		await expect(canvas.getAllByText(/HP/i)[0]).toBeVisible();

		await userEvent.click(toggleBtn);
		await expect(canvas.queryAllByText(/HP/i).length).toBe(0);

		await userEvent.click(toggleBtn);
		await expect(canvas.getAllByText(/HP/i)[0]).toBeVisible();
	}
};

export const Collapsed: Story = {
	args: {
		startsCollapsed: true
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggleBtn = canvas.getByRole('button', { name: /Stats/i });

		await expect(canvas.queryAllByText(/HP/i).length).toBe(0);

		await userEvent.click(toggleBtn);
		await expect(canvas.getAllByText(/HP/i)[0]).toBeVisible();
	}
};
