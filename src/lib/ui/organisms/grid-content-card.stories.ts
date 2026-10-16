import type { Meta, StoryObj } from '@storybook/sveltekit';
import GridContentCardStory from '$lib/ui/organisms/grid-content-card-story.svelte';

const meta = {
	title: 'Design System/Organisms/GridContentCard',
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
