import type { Meta, StoryObj } from '@storybook/sveltekit';
import StructuredFormStory from './StructuredFormStory.svelte';

const meta = {
	title: 'Molecules/StructuredForm',
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
