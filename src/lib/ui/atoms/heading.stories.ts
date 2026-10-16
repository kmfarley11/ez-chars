import type { Meta, StoryObj } from '@storybook/sveltekit';

import Heading from '$lib/ui/atoms/heading.svelte';

const meta = {
	title: 'Design System/Atoms/Heading',
	component: Heading,
	args: {
		text: 'Character overview'
	}
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ExtraLarge: Story = {
	args: {
		variant: 'xl'
	}
};

export const Large: Story = {
	args: {
		variant: 'lg'
	}
};

export const Medium: Story = {
	args: {
		variant: 'md'
	}
};

export const Small: Story = {
	args: {
		variant: 'sm'
	}
};
