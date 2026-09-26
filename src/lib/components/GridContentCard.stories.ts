import type { Meta, StoryObj } from '@storybook/sveltekit';
import GridContentCardStory from './GridContentCardStory.svelte';

const meta = {
	title: 'Organisms/GridContentCard',
	component: GridContentCardStory,
	args: {
		withData: true
	}
} satisfies Meta<typeof GridContentCardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithContent: Story = {};

export const WithoutActions: Story = {
	args: { hideActions: true }
};

export const Empty: Story = {
	args: {
		withData: false
	}
};
