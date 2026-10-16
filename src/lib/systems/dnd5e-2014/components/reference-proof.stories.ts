import type { Meta, StoryObj } from '@storybook/sveltekit';
import ReferenceProofStory from '$lib/systems/dnd5e-2014/components/reference-proof-story.svelte';

const meta = {
	title: 'Systems/D&D 2014/ReferenceProof',
	component: ReferenceProofStory,
	args: {
		mode: 'viewer'
	}
} satisfies Meta<typeof ReferenceProofStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelfHostedSrdViewer: Story = {};

const openStoryHref = (href: string) => {
	window.open(href, '_blank', 'noopener,noreferrer');
};

export const MixedSourceStates: Story = {
	args: { mode: 'mixed' },
	parameters: {
		sveltekit_experimental: {
			hrefs: {
				'^(https?://|/docs/ext/)': {
					callback: openStoryHref,
					asRegex: true
				}
			}
		}
	}
};
