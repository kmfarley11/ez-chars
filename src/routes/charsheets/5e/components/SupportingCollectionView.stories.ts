import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { create5e2014Character } from '../../../../schema';
import SupportingCollectionViewStoryHarness from './SupportingCollectionViewStoryHarness.svelte';
import { projectSupportingCollectionRows } from './supportingCollectionRows';

const createFeatureCharacter = (count: number) =>
	create5e2014Character({
		features: Array.from({ length: count }, (_, index) => ({
			id: `proof-feature-${index + 1}`,
			name: index === count - 1 ? 'Planar Cartographer' : `Feature ${index + 1}`,
			summary:
				index === count - 1
					? 'Recognizes unstable portals and extraplanar landmarks.'
					: `Feature summary ${index + 1}.`
		}))
	});

const sevenFeatureRows = projectSupportingCollectionRows(createFeatureCharacter(7), 'features');
const eightFeatureRows = projectSupportingCollectionRows(createFeatureCharacter(8), 'features');
const eighteenFeatureRows = projectSupportingCollectionRows(createFeatureCharacter(18), 'features');
const longFeatureName = 'CartographerOfTheInterplanarBoundaryWithoutAnyNaturalBreakOpportunities';
const longFeatureRows = eightFeatureRows.map((row, index) =>
	index === 0
		? {
				...row,
				label: longFeatureName,
				detail:
					'Remembers an exceptionally detailed route through unstable extraplanar terrain without shortening the authored note.'
			}
		: row
);
const languageRows = projectSupportingCollectionRows(
	create5e2014Character({
		systemData: {
			proficiencies: {
				languages: [
					{ name: 'Common', source: { kind: 'background' } },
					{ name: 'Elvish', source: { kind: 'ancestry' } },
					{ name: 'Draconic', source: { kind: 'class' } }
				],
				tools: []
			}
		}
	}),
	'languages'
);

const getVisible = <T extends HTMLElement>(elements: Array<T>, description: string): T => {
	const visible = elements.find((element) => element.checkVisibility());
	if (!visible) throw new Error(`Expected a visible ${description}`);
	return visible;
};

const getVisibleResults = (canvasElement: HTMLElement, title: string) =>
	getVisible(
		within(canvasElement).getAllByRole('list', { name: `${title} results` }),
		`${title} results list`
	);

const meta = {
	title: 'Organisms/SupportingCollectionView',
	component: SupportingCollectionViewStoryHarness,
	args: {
		title: 'Features',
		rows: eightFeatureRows,
		onEdit: fn(),
		onNotes: fn(),
		denseThreshold: 7,
		withScrollRunway: false,
		constrainWidth: false,
		requiresPhoneViewport: false
	},
	parameters: {
		docs: {
			description: {
				component:
					'BL-076 isolated proof for supporting 5e collections. These collections retain the sheet’s compact bullet-list presentation and one card-level Edit/Notes grammar; they deliberately do not acquire Runtime Action or identity-owned row treatment.'
			}
		}
	}
} satisfies Meta<typeof SupportingCollectionViewStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SevenFeatureBoundary: Story = {
	args: { rows: sevenFeatureRows },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.queryByRole('searchbox')).not.toBeInTheDocument();
		await expect(canvas.queryByRole('button', { name: /Browse all/ })).not.toBeInTheDocument();
		await expect(
			within(getVisibleResults(canvasElement, 'Features')).getAllByRole('listitem')
		).toHaveLength(7);
		await expect(canvas.getByRole('button', { name: 'Card actions' })).toBeVisible();
		await expect(canvas.queryByRole('button', { name: /Row actions/ })).not.toBeInTheDocument();
	}
};

export const EightFeaturesDenseBoundary: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const search = canvas.getByRole('searchbox', { name: 'Search Features' });
		await expect(search).toBeVisible();
		await userEvent.type(search, 'planar portal');
		const results = within(getVisibleResults(canvasElement, 'Features'));
		await expect(results.getByText('Planar Cartographer')).toBeVisible();
		await expect(getVisible(canvas.getAllByText('1 of 8 items'), 'filtered count')).toBeVisible();
		await expect(results.queryByText('Feature 1')).not.toBeInTheDocument();
	}
};

export const EighteenFeaturesDesktopInlineScroll: Story = {
	args: { rows: eighteenFeatureRows },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const viewport = canvas.getByRole('region', { name: 'Features scrollable results' });
		await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
		await waitFor(() => {
			expect(
				viewport.parentElement?.querySelector('[data-scroll-affordance="more-below"]')
			).toBeVisible();
		});
	}
};

export const EighteenFeaturesDesktopWheelPlaytest: Story = {
	args: { rows: eighteenFeatureRows, withScrollRunway: true }
};

export const LongFeatureContentDesktopWraps: Story = {
	args: { rows: longFeatureRows, constrainWidth: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const viewport = canvas.getByRole('region', { name: 'Features scrollable results' });
		const longText = getVisible(canvas.getAllByText(longFeatureName), 'long feature text');
		const paragraph = longText.closest('p');
		if (!paragraph) throw new Error('Expected the long feature text inside a paragraph');
		const lineHeight = Number.parseFloat(getComputedStyle(paragraph).lineHeight);
		await expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
		await expect(paragraph.scrollWidth).toBeLessThanOrEqual(paragraph.clientWidth);
		await expect(paragraph.getBoundingClientRect().height).toBeGreaterThan(lineHeight);
	}
};

export const LongFeatureContentPhonePreviewTruncatesWithBrowseAll: Story = {
	args: { rows: longFeatureRows, constrainWidth: true, requiresPhoneViewport: true },
	parameters: {
		viewport: { defaultViewport: 'mobile1' },
		docs: {
			description: {
				story:
					'The compact preview intentionally ellipsizes long rows. Browse all 8 items is the collection-level show-more path to the complete wrapping text.'
			}
		}
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const preview = canvas.getByRole('list', { name: 'Features preview' });
		const longText = within(preview).getByText(longFeatureName);
		const paragraph = longText.closest('p');
		if (!paragraph) throw new Error('Expected the long feature preview inside a paragraph');
		const style = getComputedStyle(paragraph);
		await expect(paragraph.scrollWidth).toBeGreaterThan(paragraph.clientWidth);
		await expect(style.overflowX).toBe('hidden');
		await expect(style.textOverflow).toBe('ellipsis');
		await expect(style.whiteSpace).toBe('nowrap');
	}
};

export const LongFeatureContentPhoneFocusedViewWraps: Story = {
	args: { rows: longFeatureRows, constrainWidth: true, requiresPhoneViewport: true },
	parameters: {
		viewport: { defaultViewport: 'mobile1' },
		docs: {
			description: {
				story:
					'The paired show-more state: opening Browse all reveals the complete long row and wraps it without horizontal scrolling.'
			}
		}
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Browse all 8 items' }));
		const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Features'
		});
		const longText = within(dialog).getByText(longFeatureName);
		const paragraph = longText.closest('p');
		if (!paragraph) throw new Error('Expected the complete long feature inside a paragraph');
		const lineHeight = Number.parseFloat(getComputedStyle(paragraph).lineHeight);
		await expect(paragraph.scrollWidth).toBeLessThanOrEqual(paragraph.clientWidth);
		await expect(paragraph.getBoundingClientRect().height).toBeGreaterThan(lineHeight);
	}
};

export const EightFeaturesPhoneFocusedDialog: Story = {
	args: { requiresPhoneViewport: true },
	parameters: { viewport: { defaultViewport: 'mobile1' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const preview = canvas.getByRole('list', { name: 'Features preview' });
		await expect(within(preview).getAllByRole('listitem')).toHaveLength(7);
		await expect(within(preview).queryByText('Planar Cartographer')).not.toBeInTheDocument();

		const browse = canvas.getByRole('button', { name: 'Browse all 8 items' });
		await userEvent.click(browse);
		const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Features'
		});
		await expect(within(dialog).getByRole('button', { name: 'Card actions' })).toBeVisible();
		await userEvent.type(within(dialog).getByRole('searchbox'), 'cartographer');
		await expect(within(dialog).getByText('Planar Cartographer')).toBeVisible();
		await userEvent.click(within(dialog).getByRole('button', { name: 'Close Features' }));
		await expect(browse).toHaveFocus();
	}
};

export const EightFeaturesPhoneFocusedPlaytest: Story = {
	args: { requiresPhoneViewport: true },
	parameters: { viewport: { defaultViewport: 'mobile1' } }
};

export const ShortLanguages: Story = {
	args: { title: 'Prof. Languages', rows: languageRows },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await expect(canvas.queryByRole('searchbox')).not.toBeInTheDocument();
		const results = within(getVisibleResults(canvasElement, 'Prof. Languages'));
		await expect(getVisible(canvas.getAllByText('3 items'), 'item count')).toBeVisible();
		await expect(results.getByText('Elvish')).toBeVisible();
		await expect(results.getByText('Ancestry')).toBeVisible();
		await userEvent.click(canvas.getByRole('button', { name: 'Card actions' }));
		await userEvent.click(
			within(canvasElement.ownerDocument.body).getByRole('button', { name: 'Edit' })
		);
		await expect(args.onEdit).toHaveBeenCalledOnce();
	}
};
