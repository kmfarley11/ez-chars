import type { Meta, StoryObj } from '@storybook/sveltekit';
import IconPrefixedListItemStory from '$lib/ui/molecules/icon-prefixed-list-item-story.svelte';

const meta = {
	title: 'Design System/Molecules/IconPrefixedListItem',
	component: IconPrefixedListItemStory,
	tags: ['autodocs'],
	argTypes: { iconAlign: { control: 'select', options: ['first-line', 'center'] } }
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
