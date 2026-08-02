<script lang="ts">
	import BaseButton from '$components/BaseButton.svelte';
	import GridContentListRow from '$components/GridContentListRow.svelte';
	import { createScrollAffordanceAttachment } from '$components/scrollAffordance';
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
		emptyText?: string;
		onEditRow?: GridContentListRowAction;
		onNotesRow?: GridContentListRowAction;
	}

	let {
		title,
		rows,
		query = $bindable(''),
		bounded = false,
		emptyText = 'No items yet.',
		onEditRow,
		onNotesRow
	}: Props = $props();

	const uid = $props.id();
	const searchLabel = $derived(`Search ${title}`);
	const hasQuery = $derived(query.trim().length > 0);
	const filteredRows = $derived(filterGridContentListRows(rows, query));
	const countLabel = $derived(
		getGridContentListCountLabel(filteredRows.length, rows.length, hasQuery)
	);
	let canScrollUp = $state(false);
	let canScrollDown = $state(false);
	const trackScrollAffordance = createScrollAffordanceAttachment((state) => {
		canScrollUp = state.canScrollUp;
		canScrollDown = state.canScrollDown;
	});
</script>

<div class="space-y-2">
	<div class="flex flex-wrap items-end gap-2">
		<label class="min-w-48 flex-1 space-y-1" for={`${uid}-search`}>
			<span class="sr-only">{searchLabel}</span>
			<input
				id={`${uid}-search`}
				type="search"
				class="theme-input touch-target w-full rounded-md border px-3 py-1.5"
				placeholder={`Search ${title.toLocaleLowerCase()}`}
				bind:value={query}
			/>
		</label>
		{#if hasQuery}
			<BaseButton size="sm" onclick={() => (query = '')}>Clear search</BaseButton>
		{/if}
	</div>

	<p class="theme-text-muted text-xs" role="status" aria-live="polite">{countLabel}</p>

	{#if rows.length === 0}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm italic">{emptyText}</p>
	{:else if filteredRows.length === 0}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm" role="status">
			No {title.toLocaleLowerCase()} match “{query.trim()}”.
			<button
				type="button"
				class="theme-link cursor-pointer font-semibold underline underline-offset-2"
				onclick={() => (query = '')}>Clear</button
			>
			or revise the search.
		</p>
	{:else}
		<div class={bounded ? 'relative rounded-md border p-1 shadow-inner' : ''}>
			<ul
				class={bounded
					? 'dense-list-bounded scroll-affordance-viewport space-y-2 overflow-y-auto px-1 py-1'
					: 'space-y-2'}
				aria-label={`${title} results`}
				{@attach trackScrollAffordance}
			>
				{#each filteredRows as row, index (row.key)}
					{#if row.groupLabel && row.groupLabel !== filteredRows[index - 1]?.groupLabel}
						<li role="presentation" class="px-1 pt-2 first:pt-0">
							<h4 class="theme-text-muted text-xs font-bold tracking-wide uppercase">
								{row.groupLabel}
							</h4>
						</li>
					{/if}
					<GridContentListRow {row} {onEditRow} {onNotesRow} />
				{/each}
			</ul>
			{#if bounded && canScrollUp}
				<div
					class="scroll-affordance-fade scroll-affordance-fade-top absolute inset-x-1 top-1 h-8"
					data-scroll-affordance="more-above"
					aria-hidden="true"
				></div>
			{/if}
			{#if bounded && canScrollDown}
				<div
					class="scroll-affordance-fade scroll-affordance-fade-bottom absolute inset-x-1 bottom-1 h-8"
					data-scroll-affordance="more-below"
					aria-hidden="true"
				></div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.dense-list-bounded {
		max-height: 20rem;
		overflow-y: auto;
	}
</style>
