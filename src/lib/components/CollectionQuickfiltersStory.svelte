<script lang="ts">
	import ChipButton from './ChipButton.svelte';
	import CollectionQuickfilters from './CollectionQuickfilters.svelte';

	const options = [
		{ key: 'ready', label: 'Ready' },
		{ key: 'review', label: 'Awaiting another participant’s review' },
		{ key: 'later', label: 'Later' }
	];
	let selected = $state<string[]>([]);
	let query = $state('');
	let favoritesOnly = $state(false);
</script>

<div class="theme-dialog max-w-xl space-y-4 rounded-md border p-3">
	<p class="theme-text-muted text-sm">
		System-neutral control sandbox: select several statuses, type a query, and toggle Favorites
		only. Reset status preserves the query and favorite restriction; Clear search only clears text.
		Toggle Favorites only again to remove that restriction. Resize with the viewport toolbar to
		inspect long-label wrapping and keyboard focus without loading a sheet.
	</p>
	<CollectionQuickfilters
		title="Entries"
		label="Status"
		heading="Status & favorites"
		{options}
		bind:selected
		bind:query
	>
		{#snippet extra()}
			<ChipButton
				label="Favorites only"
				selected={favoritesOnly}
				onclick={() => (favoritesOnly = !favoritesOnly)}
			/>
		{/snippet}
	</CollectionQuickfilters>
	<p class="theme-text-muted text-sm" role="status">
		Selected status: {selected
			.map((key) => options.find((option) => option.key === key)?.label)
			.join(', ') || 'unrestricted'}. Query: {query || 'empty'}. Favorites: {favoritesOnly
			? 'only'
			: 'unrestricted'}.
	</p>
</div>
