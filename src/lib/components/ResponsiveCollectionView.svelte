<script lang="ts">
	import type { Snippet } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import BoundedCollectionRegion from '$components/BoundedCollectionRegion.svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import {
		getGridContentListBrowseLabel,
		getGridContentListCountLabel
	} from '$components/gridContentList';

	interface Props {
		title: string;
		totalCount: number;
		filteredCount: number;
		query?: string;
		focusedOpen?: boolean;
		threshold: number;
		emptyText?: string;
		preview: Snippet;
		results: Snippet;
		focusedActions?: Snippet;
		onFocusedOpened?: () => void;
	}

	let {
		title,
		totalCount,
		filteredCount,
		query = $bindable(''),
		focusedOpen = $bindable(false),
		threshold,
		emptyText = 'No items yet.',
		preview,
		results,
		focusedActions = undefined,
		onFocusedOpened = undefined
	}: Props = $props();

	const uid = $props.id();
	const isDense = $derived(totalCount > threshold);
	const hasQuery = $derived(query.trim().length > 0);
	const searchLabel = $derived(`Search ${title}`);
	const countLabel = $derived(getGridContentListCountLabel(filteredCount, totalCount, hasQuery));
	const browseLabel = $derived(getGridContentListBrowseLabel(totalCount));
	let browseTriggerEl = $state<HTMLButtonElement>();
	let focusedScrollTop = $state(0);

	const clearSearch = () => {
		query = '';
	};

	const openFocusedView = () => {
		focusedOpen = true;
	};

	const closeFocusedView = () => {
		focusedOpen = false;
		browseTriggerEl?.focus();
	};
</script>

{#snippet searchControls(suffix: string)}
	<div class="space-y-2">
		<div class="flex flex-wrap items-end gap-2">
			<label class="min-w-48 flex-1" for={`${uid}-${suffix}-search`}>
				<span class="sr-only">{searchLabel}</span>
				<input
					id={`${uid}-${suffix}-search`}
					type="search"
					class="theme-input touch-target w-full rounded-md border px-3 py-1.5 text-base md:text-sm"
					placeholder={`Search ${title.toLocaleLowerCase()}`}
					bind:value={query}
				/>
			</label>
			{#if hasQuery}
				<BaseButton size="sm" onclick={clearSearch}>Clear search</BaseButton>
			{/if}
		</div>
		<p class="theme-text-muted text-xs" role="status" aria-live="polite">{countLabel}</p>
	</div>
{/snippet}

{#snippet collectionResults(bounded: boolean)}
	{#if totalCount === 0}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm italic">{emptyText}</p>
	{:else if filteredCount === 0}
		<p class="theme-text-muted rounded-md border px-3 py-3 text-sm" role="status">
			No {title.toLocaleLowerCase()} match “{query.trim()}”.
			<button
				type="button"
				class="theme-link cursor-pointer font-semibold underline underline-offset-2"
				onclick={clearSearch}>Clear</button
			>
			or revise the search.
		</p>
	{:else if bounded}
		<BoundedCollectionRegion
			ariaLabel={`${title} scrollable results`}
			viewportId="bounded-collection"
			maxHeight="22rem"
		>
			{@render results()}
		</BoundedCollectionRegion>
	{:else}
		{@render results()}
	{/if}
{/snippet}

<div class="hidden space-y-2 sm:block">
	{#if isDense}
		{@render searchControls('desktop')}
	{:else if totalCount > 0}
		<p class="theme-text-muted text-xs">{countLabel}</p>
	{/if}
	{@render collectionResults(isDense)}
</div>

<div class="space-y-2 sm:hidden">
	{#if totalCount === 0}
		{@render collectionResults(false)}
	{:else if isDense}
		{@render preview()}
		<BaseButton
			size="sm"
			onclick={openFocusedView}
			bind:buttonEl={browseTriggerEl}
			classes="w-full"
		>
			{browseLabel}
		</BaseButton>
	{:else}
		<p class="theme-text-muted text-xs">{countLabel}</p>
		{@render collectionResults(false)}
	{/if}
</div>

{#if focusedOpen}
	<DialogShell
		bind:open={focusedOpen}
		bind:scrollTop={focusedScrollTop}
		{title}
		closeText={`Close ${title}`}
		fullHeightMobile={true}
		scrollAffordance={true}
		onOpened={onFocusedOpened}
		onClose={closeFocusedView}
	>
		<div class="space-y-2">
			<div class="theme-dialog sticky top-0 z-10 pb-2">
				{#if focusedActions}
					<div class="mb-2 flex justify-end gap-2">
						{@render focusedActions()}
					</div>
				{/if}
				{@render searchControls('dialog')}
			</div>
			{@render collectionResults(false)}
		</div>
	</DialogShell>
{/if}
