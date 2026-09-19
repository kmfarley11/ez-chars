import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollectionOrganizerConceptProof from './CollectionOrganizerConceptProof.svelte';

const meta = {
	title: 'Organisms/Collection Organizer Concept',
	component: CollectionOrganizerConceptProof,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				story:
					'**Deferred concept—not BL-077 rollout UI. Verify manually:**\n\n- Add, remove, and reorder records; confirm the concept remains structural and never exposes rich detail or notes.\n- Compare its cost with established Pin/Unpin and Manage Pins.\n- Note that General and class-owned records currently share one organizer; ownership-specific removal and ordering rules must be resolved before any adoption.\n- Review at desktop and phone widths without creating a viewport-only duplicate story.'
			}
		}
	}
} satisfies Meta<typeof CollectionOrganizerConceptProof>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DeferredBatchOrganization: Story = {};
