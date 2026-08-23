<script lang="ts">
	import SupportingCollectionView from './SupportingCollectionView.svelte';
	import type { SupportingCollectionRow } from './supportingCollectionRows';

	type ActionCallback = () => void;

	interface Props {
		title: string;
		rows: ReadonlyArray<SupportingCollectionRow>;
		query?: string;
		denseThreshold?: number;
		onEdit: ActionCallback;
		onNotes: ActionCallback;
		withScrollRunway?: boolean;
		constrainWidth?: boolean;
		requiresPhoneViewport?: boolean;
	}

	let {
		title,
		rows,
		query = $bindable(''),
		denseThreshold = 7,
		onEdit,
		onNotes,
		withScrollRunway = false,
		constrainWidth = false,
		requiresPhoneViewport = false
	}: Props = $props();
</script>

{#snippet collection()}
	<div class={['theme-grid-layer rounded-md border p-3', constrainWidth && 'w-72 max-w-full']}>
		<SupportingCollectionView {title} {rows} bind:query {denseThreshold} {onEdit} {onNotes} />
	</div>
{/snippet}

{#if requiresPhoneViewport}
	<aside
		aria-label="Phone viewport review"
		class="theme-grid-layer theme-text-muted mb-3 rounded-md border px-3 py-2 text-sm"
	>
		<strong class="font-semibold">Phone viewport required.</strong>
		Use Storybook's viewport toolbar to select a phone preset, or narrow the canvas below 640px, before
		reviewing this proof.
	</aside>
{/if}

{#if withScrollRunway}
	<div class="p-4">
		<div class="theme-text-muted flex h-[55vh] items-end pb-4 text-sm">
			Scroll the page until the collection is centered, then continue with the pointer inside it.
		</div>
		{@render collection()}
		<div class="theme-text-muted h-[70vh] pt-4 text-sm">
			The page-scroll runway continues below the collection.
		</div>
	</div>
{:else}
	{@render collection()}
{/if}
