<script lang="ts">
	import BaseButton from '$components/BaseButton.svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import GridContentListRow from '$components/GridContentListRow.svelte';
	import GridContentListView from '$components/GridContentListView.svelte';
	import {
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
		onEditRow?: GridContentListRowAction;
		onNotesRow?: GridContentListRowAction;
		onBulkEdit?: () => void;
		bulkTriggerEl?: HTMLButtonElement;
	}

	let {
		title,
		rows,
		emptyText = 'No items yet.',
		query = $bindable(''),
		onEditRow,
		onNotesRow,
		onBulkEdit,
		bulkTriggerEl = $bindable()
	}: Props = $props();

	const uid = $props.id();
	let isFocusedViewOpen = $state(false);
	let browseTriggerEl = $state<HTMLButtonElement>();

	const preview = $derived(getGridContentListPreview(rows));
	const browseLabel = $derived(getGridContentListBrowseLabel(rows.length));

	const openFocusedView = () => {
		isFocusedViewOpen = true;
	};

	const closeFocusedView = () => {
		isFocusedViewOpen = false;
		browseTriggerEl?.focus();
	};
</script>

<section class="space-y-3" aria-labelledby={`${uid}-heading`}>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h3 id={`${uid}-heading`} class="text-sm font-semibold">{title}</h3>
		{#if onBulkEdit}
			<BaseButton size="sm" onclick={onBulkEdit} bind:buttonEl={bulkTriggerEl}
				>Bulk Edit {title}</BaseButton
			>
		{/if}
	</div>

	<div class="hidden sm:block">
		<GridContentListView
			{title}
			{rows}
			bind:query
			bounded={true}
			{emptyText}
			{onEditRow}
			{onNotesRow}
		/>
	</div>

	<div class="space-y-2 sm:hidden">
		{#if rows.length === 0}
			<p class="theme-text-muted rounded-md border px-3 py-3 text-sm italic">{emptyText}</p>
		{:else}
			<ul class="space-y-2" aria-label={`${title} preview`}>
				{#each preview.rows as row, index (row.key)}
					{#if row.groupLabel && row.groupLabel !== preview.rows[index - 1]?.groupLabel}
						<li role="presentation" class="px-1 pt-1 first:pt-0">
							<h4 class="theme-text-muted text-xs font-bold tracking-wide uppercase">
								{row.groupLabel}
							</h4>
						</li>
					{/if}
					<GridContentListRow {row} compact={true} {onEditRow} {onNotesRow} />
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
		{/if}
	</div>
</section>

<DialogShell
	bind:open={isFocusedViewOpen}
	{title}
	closeText={`Close ${title}`}
	fullHeightMobile={true}
	scrollAffordance={true}
	onClose={closeFocusedView}
>
	<GridContentListView {title} {rows} bind:query {emptyText} {onEditRow} {onNotesRow} />
</DialogShell>
