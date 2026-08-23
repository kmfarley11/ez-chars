<script lang="ts">
	import GridContentActionMenu from '$components/GridContentActionMenu.svelte';
	import ResponsiveCollectionView from '$components/ResponsiveCollectionView.svelte';
	import { getGridContentListPreview } from '$components/gridContentList';
	import {
		filterSupportingCollectionRows,
		type SupportingCollectionRow
	} from './supportingCollectionRows';

	type ActionCallback = () => void;

	interface Props {
		title: string;
		rows: ReadonlyArray<SupportingCollectionRow>;
		query?: string;
		denseThreshold?: number;
		onEdit: ActionCallback;
		onNotes: ActionCallback;
		cardActionsTriggerEl?: HTMLButtonElement;
		focusedCardActionsTriggerEl?: HTMLButtonElement;
	}

	let {
		title,
		rows,
		query = $bindable(''),
		denseThreshold = 7,
		onEdit,
		onNotes,
		cardActionsTriggerEl = $bindable(),
		focusedCardActionsTriggerEl = $bindable()
	}: Props = $props();

	const filteredRows = $derived(filterSupportingCollectionRows(rows, query));
	const previewRows = $derived(getGridContentListPreview(rows, denseThreshold).rows);
</script>

{#snippet actions(focused = false)}
	{#if focused}
		<GridContentActionMenu
			canEdit={true}
			{onEdit}
			{onNotes}
			bind:triggerEl={focusedCardActionsTriggerEl}
		/>
	{:else}
		<GridContentActionMenu
			canEdit={true}
			{onEdit}
			{onNotes}
			bind:triggerEl={cardActionsTriggerEl}
		/>
	{/if}
{/snippet}

{#snippet collectionRows(
	items: ReadonlyArray<SupportingCollectionRow>,
	compact: boolean,
	label: string
)}
	<ul class="max-w-full min-w-0 list-disc space-y-1 pl-5" aria-label={label}>
		{#each items as row (row.key)}
			{@const annotationCount = row.annotations?.length ?? 0}
			<li class="max-w-full min-w-0" data-row-key={row.key}>
				<p
					class={[
						'max-w-full min-w-0 text-sm',
						compact ? 'supporting-collection-compact' : 'supporting-collection-full'
					]}
				>
					<span>{row.label}</span>
					{#if row.detail}
						<span aria-hidden="true">:</span>
						<span class="theme-text-muted italic"> {row.detail}</span>
					{/if}
					{#if row.context}
						<span aria-hidden="true"> · </span>
						<span class="theme-text-muted text-xs">{row.context}</span>
					{/if}
					{#if annotationCount > 0}
						<span class="theme-text-muted text-xs">
							({annotationCount}
							{annotationCount === 1 ? 'note' : 'notes'})
						</span>
					{/if}
				</p>
			</li>
		{/each}
	</ul>
{/snippet}

<div class="space-y-3">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h3 class="text-sm font-semibold">{title}</h3>
		{@render actions()}
	</div>

	<ResponsiveCollectionView
		{title}
		totalCount={rows.length}
		filteredCount={filteredRows.length}
		threshold={denseThreshold}
		emptyText={`No ${title.toLocaleLowerCase()} yet.`}
		bind:query
	>
		{#snippet preview()}
			{@render collectionRows(previewRows, true, `${title} preview`)}
		{/snippet}
		{#snippet results()}
			{@render collectionRows(filteredRows, false, `${title} results`)}
		{/snippet}
		{#snippet focusedActions()}
			{@render actions(true)}
		{/snippet}
	</ResponsiveCollectionView>
</div>

<style>
	.supporting-collection-compact {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.supporting-collection-full {
		overflow-wrap: anywhere;
	}
</style>
