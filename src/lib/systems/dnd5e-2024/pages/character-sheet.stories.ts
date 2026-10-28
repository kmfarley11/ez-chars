import type { Meta, StoryObj } from '@storybook/sveltekit';
import CharacterSheetStory from './character-sheet-story.svelte';
import {
	representativeCharacter5e2024,
	sparseCharacter5e2024,
	saturatedCharacter5e2024
} from '../../../../fixtures/characters-5e2024';
const meta = {
	title: 'Systems/D&D 2024/Character Sheet',
	component: CharacterSheetStory,
	args: { fixture: representativeCharacter5e2024 },
	argTypes: { fixture: { control: false } },
	...(import.meta.env.VITEST_STORYBOOK === undefined
		? { globals: { a11y: { manual: true } } }
		: {}),
	parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof CharacterSheetStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Representative: Story = {};
export const Sparse: Story = { args: { fixture: sparseCharacter5e2024 } };
export const Saturated: Story = { args: { fixture: saturatedCharacter5e2024 } };
