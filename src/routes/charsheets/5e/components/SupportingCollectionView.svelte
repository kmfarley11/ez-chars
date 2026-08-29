<script lang="ts">
	import { tick } from 'svelte';
	import GridContentActionMenu from '$components/GridContentActionMenu.svelte';
	import IconPrefixedListItem from '$components/IconPrefixedListItem.svelte';
	import ManagePinsDialog from '$components/ManagePinsDialog.svelte';
	import ResponsiveCollectionView from '$components/ResponsiveCollectionView.svelte';
	import {
		projectCollectionPriorityRows,
		type CollectionPriorityLabelComparator,
		type CollectionPrioritySave
	} from '$components/collectionPriority';
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
		onSavePins?: CollectionPrioritySave;
		comparePriorityLabels?: CollectionPriorityLabelComparator;
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
		onSavePins,
		comparePriorityLabels,
		cardActionsTriggerEl = $bindable(),
		focusedCardActionsTriggerEl = $bindable()
	}: Props = $props();

	const priorityEnabled = $derived(Boolean(onSavePins && comparePriorityLabels));
	const canManagePins = $derived(priorityEnabled && rows.length > 0);
	const canonicalRows = $derived(
		priorityEnabled && comparePriorityLabels
			? projectCollectionPriorityRows(rows, comparePriorityLabels)
			: [...rows]
	);
	const filteredRows = $derived(filterSupportingCollectionRows(canonicalRows, query));
	const previewRows = $derived(getGridContentListPreview(canonicalRows, denseThreshold).rows);
	let isManagePinsOpen = $state(false);
	let managePinsReturnEl = $state<HTMLButtonElement>();

	const openManagePins = (focused: boolean) => {
		managePinsReturnEl = focused ? focusedCardActionsTriggerEl : cardActionsTriggerEl;
		managePinsReturnEl?.focus();
		isManagePinsOpen = true;
	};

	const closeManagePins = async () => {
		isManagePinsOpen = false;
		await tick();
		requestAnimationFrame(() => {
			if (managePinsReturnEl?.isConnected) managePinsReturnEl.focus();
		});
	};
</script>

{#snippet actions(focused = false)}
	{#if focused}
		<GridContentActionMenu
			canEdit={true}
			{onEdit}
			{onNotes}
			onManagePins={canManagePins ? () => openManagePins(true) : undefined}
			bind:triggerEl={focusedCardActionsTriggerEl}
		/>
	{:else}
		<GridContentActionMenu
			canEdit={true}
			{onEdit}
			{onNotes}
			onManagePins={canManagePins ? () => openManagePins(false) : undefined}
			bind:triggerEl={cardActionsTriggerEl}
		/>
	{/if}
{/snippet}

{#snippet collectionRows(
	items: ReadonlyArray<SupportingCollectionRow>,
	compact: boolean,
	label: string
)}
	<ul class="max-w-full min-w-0 list-none space-y-1" aria-label={label}>
		{#each items as row (row.key)}
			{@const annotationCount = row.annotations?.length ?? 0}
			{@const isPinned = priorityEnabled && row.pinned}
			<IconPrefixedListItem
				icon={isPinned ? 'pin' : 'bullet'}
				title={isPinned ? 'Pinned' : undefined}
				paragraphClasses={compact ? 'supporting-collection-compact' : 'supporting-collection-full'}
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
			</IconPrefixedListItem>
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

{#if priorityEnabled && onSavePins && isManagePinsOpen}
	<ManagePinsDialog
		{title}
		rows={canonicalRows}
		bind:open={isManagePinsOpen}
		bind:query
		searchEnabled={rows.length > denseThreshold}
		onSave={onSavePins}
		onClosed={closeManagePins}
	/>
{/if}

<style>
	:global(.supporting-collection-compact) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.supporting-collection-full) {
		overflow-wrap: anywhere;
	}
</style>
