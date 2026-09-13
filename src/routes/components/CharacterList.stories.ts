import type { Meta, StoryObj } from '@storybook/sveltekit';
import CharacterList from './CharacterList.svelte';
import { seedChars } from '../../fixtures/characters.js';
import { fn } from 'storybook/test';

const meta = {
	title: 'Organisms/CharacterList',
	component: CharacterList,
	parameters: {
		layout: 'padded'
	},
	argTypes: {
		secondaryActionPlacement: {
			control: { type: 'inline-radio' },
			options: ['direct', 'menu'],
			description:
				'Placement of secondary actions on mobile cards (direct button vs card options menu)'
		}
	},
	args: {
		characters: seedChars,
		secondaryActionPlacement: 'direct',
		onSelect: fn(),
		onDelete: fn()
	}
} satisfies Meta<typeof CharacterList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Responsive: Story = {};
