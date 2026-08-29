import type { Meta, StoryObj } from '@storybook/sveltekit';
import IconPrefixedListItemStory from './IconPrefixedListItemStory.svelte';

const meta = {
	title: 'Molecules/IconPrefixedListItem',
	component: IconPrefixedListItemStory,
	tags: ['autodocs']
} satisfies Meta<typeof IconPrefixedListItemStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pinned: Story = {
	args: {
		icon: 'pin',
		title: 'Pinned'
	}
};

export const Bulleted: Story = {
	args: {
		icon: 'bullet'
	}
};
