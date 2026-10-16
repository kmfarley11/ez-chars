import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import ActionDraftForm from '$lib/systems/dnd5e-2014/components/action-draft-form.svelte';

const meta = {
	title: 'Systems/D&D 2014/ActionDraftForm',
	component: ActionDraftForm,
	args: {
		draft: {
			name: 'Initial Action',
			timing: 'action',
			category: 'effect',
			notes: 'Some notes here'
		},
		onChange: fn()
	}
} satisfies Meta<typeof ActionDraftForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blank: Story = {
	args: {
		draft: {
			name: ''
		}
	}
};
