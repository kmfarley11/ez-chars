import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import IconButton from './icon-button.svelte';

const meta = {
	title: 'Design System/Atoms/IconButton',
	component: IconButton,
	args: { variant: 'edit', ariaLabel: 'Edit example', onclick: fn() },
	argTypes: {
		variant: {
			control: 'select',
			options: ['add', 'cancel', 'confirm', 'detail', 'edit', 'notes', 'pin']
		},
		size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
		shadingVariant: { control: 'inline-radio', options: ['light', 'dark'] }
	}
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Configurable: Story = {};
