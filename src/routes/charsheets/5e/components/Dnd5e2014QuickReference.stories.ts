import type { Meta, StoryObj } from '@storybook/sveltekit';
import Dnd5e2014SectionCompositionStory from './Dnd5e2014SectionCompositionStory.svelte';

const meta = {
	title: 'Organisms/Dnd5e2014QuickReference',
	component: Dnd5e2014SectionCompositionStory,
	args: { section: 'quick-reference' },
	parameters: {
		docs: {
			description: {
				component:
					'Production-backed BL-077 reconciliation surface using the real saturated-character projection and Quick Reference organism.'
			}
		}
	}
} satisfies Meta<typeof Dnd5e2014SectionCompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaturatedCharacter: Story = {
	parameters: {
		docs: {
			description: {
				story: `**Verify manually:**

- Confirm Current HP, Temporary HP, both Death Save values, and Remaining Hit Dice form one stable live-state grid whose bordered tiles fill their grid tracks rather than shrinking to their content.
- Confirm each live value keeps Edit and the compact note icon together on the right without a full-width Notes row.
- Confirm Remaining Hit Dice appears only once.
- Confirm Reference stats use the same compact bold-label-plus-value reading grammar as other read-first sheet groups, with a labeled horizontal Speeds boundary before the movement values.
- Open Reference stats, then Edit; verify Maximum HP, Armor Class, Initiative, Total Hit Dice, and all movement values are reachable in one focused draft.
- Cancel back to detail, then Close and confirm focus returns to the Reference stats detail control.
- Repeat with desktop, split-screen, and phone viewports.`
			}
		}
	}
};
