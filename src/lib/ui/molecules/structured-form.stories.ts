import type { Meta, StoryObj } from '@storybook/sveltekit';
import StructuredFormStory from '$lib/ui/molecules/structured-form-story.svelte';

const meta = {
	title: 'Design System/Molecules/StructuredForm',
	component: StructuredFormStory,
	args: {
		withArray: false
	}
} satisfies Meta<typeof StructuredFormStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithArray: Story = {
	args: { withArray: true }
};
