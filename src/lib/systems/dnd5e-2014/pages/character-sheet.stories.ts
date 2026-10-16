import type { Meta, StoryObj } from '@storybook/sveltekit';
import CharacterSheetStory from './character-sheet-story.svelte';
import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
import { bryltin, zindra } from '../../../../fixtures/characters';

const meta = {
	title: 'Systems/D&D 2014/Character Sheet',
	component: CharacterSheetStory,
	args: { fixture: saturatedCharacter5e2014 },
	argTypes: { fixture: { control: false } },
	// Full-sheet axe scans can block interactive Canvas review for ~19s.
	// The addon supplies this env key in BOTH CLI and manager-driven Vitest runs.
	// In tests, let the addon choose from its run configuration (CLI defaults to audits).
	// Human Canvas review uses Accessibility → Run test.
	...(import.meta.env.VITEST_STORYBOOK === undefined
		? { globals: { a11y: { manual: true } } }
		: {}),
	parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof CharacterSheetStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Saturated: Story = {};
export const Bryltin: Story = { args: { fixture: bryltin } };
export const Zindra: Story = { args: { fixture: zindra } };
