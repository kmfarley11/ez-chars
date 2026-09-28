import type { Meta, StoryObj } from '@storybook/sveltekit';
import Dnd5e2014SectionCompositionStory from './Dnd5e2014SectionCompositionStory.svelte';

const meta = {
	title: 'Organisms/Dnd5e2014Spellcasting',
	component: Dnd5e2014SectionCompositionStory,
	args: { section: 'spellcasting', entryStyle: 'label', readFirstSlots: true },
	argTypes: {
		readFirstSlots: { control: 'boolean' },
		entryStyle: { control: 'select', options: ['label', 'button', 'chevron', 'group'] }
	}
} satisfies Meta<typeof Dnd5e2014SectionCompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaturatedCharacter: Story = {
	parameters: {
		docs: {
			description: {
				story: `**Verify manually:**

- Confirm Ability, Save DC, and Attack Bonus appear as distinct responsive fields; click a label to highlight it in Detail and edit it independently.
- Compare the read-first Used/Max fields for each spell-slot level with the existing Tier 1 layout by toggling readFirstSlots in Controls. Is the reduced sheet footprint worth opening Detail during play? Save Used, cancel Max, and verify Used stays saved.
- Confirm the saturated spell collection remains scan-first with search, level groups, Prepared metadata, row-level Pin/Unpin, Detail, and Add.
- Confirm no redundant Manage Pins action competes with the promoted row-level priority control.
- Open a spell, save its Name, cancel a later detail or note edit, and confirm the rename persists. Keep a query active while renaming out of it, then Close and check the query and focus return.
- Edit Level (0 means cantrip), reject an invalid level, then save a valid level; confirm the grouping/badge changes without losing notes or pins.
- Read a note and follow its in-app PDF reference, then Back; confirm one dialog remains open and reading context is retained. Add and confirmed record Remove retain their separate workflows.
- Repeat with desktop, split-screen, and phone viewports.`
			}
		}
	}
};
