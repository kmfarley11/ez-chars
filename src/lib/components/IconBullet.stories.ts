import type { Meta, StoryObj } from '@storybook/sveltekit';
import IconBullet from './IconBullet.svelte';

const meta = {
	title: 'Atoms/IconBullet',
	component: IconBullet,
	tags: ['autodocs']
} satisfies Meta<typeof IconBullet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		classes: 'h-6 w-6 fill-current text-gray-700'
	}
};
