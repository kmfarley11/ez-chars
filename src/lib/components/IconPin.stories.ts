import type { Meta, StoryObj } from '@storybook/sveltekit';
import IconPin from './IconPin.svelte';

const meta = {
	title: 'Atoms/IconPin',
	component: IconPin,
	tags: ['autodocs']
} satisfies Meta<typeof IconPin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		classes: 'h-6 w-6 stroke-current text-blue-600'
	}
};
