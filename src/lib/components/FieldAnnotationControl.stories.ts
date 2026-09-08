import type { Meta, StoryObj } from '@storybook/sveltekit';
import FieldAnnotationControlStory from './FieldAnnotationControlStory.svelte';

const meta = {
	title: 'Molecules/FieldAnnotationControl',
	component: FieldAnnotationControlStory,
	args: {
		withAnnotations: false,
		canEdit: true
	}
} satisfies Meta<typeof FieldAnnotationControlStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithAnnotations: Story = {
	args: { withAnnotations: true }
};

export const ReadOnly: Story = {
	args: { withAnnotations: true, canEdit: false }
};
