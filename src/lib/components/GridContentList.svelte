<script lang="ts">
	import type { Snippet } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import GridContentListRow from '$components/GridContentListRow.svelte';
	import GridContentListView from '$components/GridContentListView.svelte';
	import IconButton from '$components/IconButton.svelte';
	import {
		GRID_CONTENT_LIST_PREVIEW_LIMIT,
		getGridContentListBrowseLabel,
		getGridContentListPreview,
		type GridContentListRow as GridContentListRowData,
		type GridContentListRowAction
	} from '$components/gridContentList';

	interface Props {
		title: string;
		rows: ReadonlyArray<GridContentListRowData>;
		emptyText?: string;
		query?: string;
		onOpenRow?: GridContentListRowAction;
		onTogglePinRow?: GridContentListRowAction;
		onAdd?: () => void;
		onManagePins?: () => void;
		onFocusedOpened?: () => void;
		addTriggerEl?: HTMLButtonElement;
		managePinsTriggerEl?: HTMLButtonElement;
		focusedOpen?: boolean;
		controls?: Snippet;
		retrieval?: { total: number; narrowed: boolean; clear: () => void };
	}

	let {
		title,
		rows,
		emptyText = 'No items yet.',
		query = $bindable(''),
		onOpenRow,
		onTogglePinRow,
		onAdd,
		onManagePins,
		onFocusedOpened,
		addTriggerEl = $bindable(),
		managePinsTriggerEl = $bindable(),
		focusedOpen = $bindable(false),
		controls,
		retrieval
	}: Props = $props();

	const uid = $props.id();
	let browseTriggerEl = $state<HTMLButtonElement>();

	const preview = $derived(getGridContentListPreview(rows));
	const isDense = $derived((retrieval?.total ?? rows.length) > GRID_CONTENT_LIST_PREVIEW_LIMIT);
	const browseLabel = $derived(
		retrieval?.narrowed
			? `Browse ${rows.length} matching items`
			: getGridContentListBrowseLabel(retrieval?.total ?? rows.length)
	);

	const openFocusedView = () => {
		focusedOpen = true;
	};

	const closeFocusedView = () => {
		focusedOpen = false;
		browseTriggerEl?.focus();
	};
</script>

<section class="space-y-3" aria-labelledby={`${uid}-heading`}>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h3 id={`${uid}-heading`} class="text-sm font-semibold">{title}</h3>
		{#if onAdd || onManagePins}
			<div class="flex items-center gap-1">
				{#if onAdd}
					<IconButton
						variant="add"
						size="sm"
						ariaLabel={`Add ${title}`}
						onclick={onAdd}
						bind:buttonEl={addTriggerEl}
					/>
				{/if}
				{#if onManagePins}
					<BaseButton size="sm" onclick={onManagePins} bind:buttonEl={managePinsTriggerEl}>
						Manage Pins
					</BaseButton>
				{/if}
			</div>
		{/if}
	</div>

	<div class="hidden sm:block">
		<GridContentListView
			{title}
			{rows}
			{controls}
			{retrieval}
			bind:query
			bounded={isDense}
			searchEnabled={isDense}
			{emptyText}
			{onOpenRow}
			{onTogglePinRow}
		/>
	</div>

	<div class="space-y-2 sm:hidden">
		{#if isDense && controls}
			{@render controls()}
			<p class="theme-text-muted text-xs" role="status">
				{rows.length} of {retrieval?.total ?? rows.length} items
			</p>
		{/if}
		{#if rows.length === 0 && retrieval}
			<GridContentListView
				{title}
				{rows}
				{retrieval}
				controls={isDense ? undefined : controls}
				searchEnabled={false}
				{emptyText}
				{onOpenRow}
				{onTogglePinRow}
			/>
		{:else if rows.length === 0}
			<p class="theme-text-muted rounded-md border px-3 py-3 text-sm italic">{emptyText}</p>
		{:else if isDense}
			<ul class="space-y-2" aria-label={`${title} preview`}>
				{#each preview.rows as row, index (row.key)}
					{#if row.groupLabel && row.groupLabel !== preview.rows[index - 1]?.groupLabel}
						<li aria-hidden="true" class="px-1 pt-1 first:pt-0">
							<h4 class="theme-text-muted text-xs font-bold tracking-wide uppercase">
								{row.groupLabel}
							</h4>
						</li>
					{/if}
					<GridContentListRow {row} compact={true} {onOpenRow} {onTogglePinRow} />
				{/each}
			</ul>
			<BaseButton
				size="sm"
				onclick={openFocusedView}
				bind:buttonEl={browseTriggerEl}
				classes="w-full"
			>
				{browseLabel}
			</BaseButton>
		{:else}
			<GridContentListView
				{title}
				{rows}
				{controls}
				{retrieval}
				bind:query
				searchEnabled={false}
				{emptyText}
				{onOpenRow}
				{onTogglePinRow}
			/>
		{/if}
	</div>
</section>

<DialogShell
	bind:open={focusedOpen}
	{title}
	closeText={`Close ${title}`}
	fullHeightMobile={true}
	scrollAffordance={true}
	onOpened={onFocusedOpened}
	onClose={closeFocusedView}
>
	<div class="theme-dialog sticky top-0 z-10">{@render controls?.()}</div>
	<GridContentListView
		{title}
		{rows}
		{retrieval}
		searchEnabled={!controls}
		bind:query
		{emptyText}
		{onOpenRow}
		{onTogglePinRow}
	/>
</DialogShell>
