<script lang="ts">
	import type { Snippet } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import BoundedCollectionRegion from '$components/BoundedCollectionRegion.svelte';
	import GridContentListRow from '$components/GridContentListRow.svelte';
	import {
		filterGridContentListRows,
		getGridContentListCountLabel,
		type GridContentListRow as GridContentListRowData,
		type GridContentListRowAction
	} from '$components/gridContentList';

	interface Props {
		title: string;
		rows: ReadonlyArray<GridContentListRowData>;
		query?: string;
		bounded?: boolean;
		searchEnabled?: boolean;
		emptyText?: string;
		onOpenRow?: GridContentListRowAction;
		onTogglePinRow?: GridContentListRowAction;
		controls?: Snippet;
		retrieval?: { total: number; narrowed: boolean; clear: () => void };
	}

	let {
		title,
		rows,
		query = $bindable(''),
		bounded = false,
		searchEnabled = true,
		emptyText = 'No items yet.',
		onOpenRow,
		onTogglePinRow,
		controls,
		retrieval
	}: Props = $props();

	const uid = $props.id();
	const searchLabel = $derived(`Search ${title}`);
	const effectiveQuery = $derived(searchEnabled ? query : '');
	const hasQuery = $derived(effectiveQuery.trim().length > 0);
	const filteredRows = $derived(retrieval ? rows : filterGridContentListRows(rows, effectiveQuery));
	const countLabel = $derived(
		getGridContentListCountLabel(
			filteredRows.length,
			retrieval?.total ?? rows.length,
			retrieval?.narrowed ?? hasQuery
		)
	);
</script>

<div class="space-y-2">
	{#if controls}
		{@render controls()}
	{:else if searchEnabled}
		<div class="flex flex-wrap items-end gap-2">
			<label class="min-w-48 flex-1 space-y-1" for={`${uid}-search`}>
				<span class="sr-only">{searchLabel}</span>
				<input
					id={`${uid}-search`}
					type="search"
					class="theme-input touch-target w-full rounded-md border px-3 py-1.5 text-base md:text-sm"
					placeholder={`Search ${title.toLocaleLowerCase()}`}
					bind:value={query}
				/>
			</label>
			{#if hasQuery}
				<BaseButton size="sm" onclick={() => (query = '')}>Clear search</BaseButton>
			{/if}
		</div>
	{/if}

	<p class="theme-text-muted text-xs" role="status" aria-live="polite">{countLabel}</p>

	{#if (retrieval?.total ?? rows.length) === 0}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm italic">{emptyText}</p>
	{:else if filteredRows.length === 0}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm" role="status">
			{#if retrieval}
				No {title.toLocaleLowerCase()} match the current search and filters.
				<BaseButton size="sm" onclick={retrieval.clear}>Clear all</BaseButton>
			{:else}
				No {title.toLocaleLowerCase()} match “{query.trim()}”.
				<button
					type="button"
					class="theme-link cursor-pointer font-semibold underline underline-offset-2"
					onclick={() => (query = '')}>Clear</button
				>
				or revise the search.
			{/if}
		</p>
	{:else if bounded}
		<BoundedCollectionRegion
			ariaLabel={`${title} scrollable results`}
			viewportId="bounded-collection"
			maxHeight="20rem"
		>
			<ul class="space-y-2" aria-label={`${title} results`}>
				{#each filteredRows as row, index (row.key)}
					{#if row.groupLabel && row.groupLabel !== filteredRows[index - 1]?.groupLabel}
						<li aria-hidden="true" class="px-1 pt-2 first:pt-0">
							<h4 class="theme-text-muted text-xs font-bold tracking-wide uppercase">
								{row.groupLabel}
							</h4>
						</li>
					{/if}
					<GridContentListRow {row} {onOpenRow} {onTogglePinRow} />
				{/each}
			</ul>
		</BoundedCollectionRegion>
	{:else}
		<ul class="space-y-2" aria-label={`${title} results`}>
			{#each filteredRows as row, index (row.key)}
				{#if row.groupLabel && row.groupLabel !== filteredRows[index - 1]?.groupLabel}
					<li aria-hidden="true" class="px-1 pt-2 first:pt-0">
						<h4 class="theme-text-muted text-xs font-bold tracking-wide uppercase">
							{row.groupLabel}
						</h4>
					</li>
				{/if}
				<GridContentListRow {row} {onOpenRow} {onTogglePinRow} />
			{/each}
		</ul>
	{/if}
</div>
