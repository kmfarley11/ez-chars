<script lang="ts">
	import { tick } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import Badge from '$components/Badge.svelte';
	import IconButton from '$components/IconButton.svelte';
	import DetailLabelButton from '$components/DetailLabelButton.svelte';
	import { getSmallEditAccess, usesDetailLabels } from '$components/smallEditContext';
	const smallEdit = getSmallEditAccess();
	const labelEntry = $derived(usesDetailLabels(smallEdit));
	import IconPrefixedListItem from '$components/IconPrefixedListItem.svelte';
	import ManagePinsDialog from '$components/ManagePinsDialog.svelte';
	import ResponsiveCollectionView from '$components/ResponsiveCollectionView.svelte';
	import {
		animateCollectionRowMovement,
		captureCollectionRowPositions,
		projectCollectionPriorityRows,
		type CollectionPriorityLabelComparator,
		type CollectionPrioritySave
	} from '$components/collectionPriority';
	import { getGridContentListPreview } from '$components/gridContentList';
	import {
		filterSupportingCollectionRows,
		type SupportingCollectionRow
	} from './supportingCollectionRows';

	// eslint-disable-next-line no-unused-vars
	type ActionCallback = (..._args: [boolean?]) => void;
	type OpenRowCallback = (
		// eslint-disable-next-line no-unused-vars
		row: SupportingCollectionRow,
		// eslint-disable-next-line no-unused-vars
		restoreFocus: () => boolean,
		// eslint-disable-next-line no-unused-vars
		fromFocusedView: boolean
	) => void;

	interface Props {
		title: string;
		rows: ReadonlyArray<SupportingCollectionRow>;
		query?: string;
		denseThreshold?: number;
		onAdd?: ActionCallback;
		onOpenRow: OpenRowCallback;
		onSavePins?: CollectionPrioritySave;
		comparePriorityLabels?: CollectionPriorityLabelComparator;
		showManagePins?: boolean;
		addTriggerEl?: HTMLButtonElement;
		focusedOpen?: boolean;
		onFocusedOpened?: () => void;
	}

	let {
		title,
		rows,
		query = $bindable(''),
		denseThreshold = 7,
		onAdd,
		onOpenRow,
		onSavePins,
		comparePriorityLabels,
		showManagePins = false,
		addTriggerEl = $bindable(),
		focusedOpen = $bindable(false),
		onFocusedOpened = undefined
	}: Props = $props();

	const priorityEnabled = $derived(Boolean(onSavePins && comparePriorityLabels));
	const canManagePins = $derived(showManagePins && priorityEnabled && rows.length > 0);
	const canonicalRows = $derived(
		priorityEnabled && comparePriorityLabels
			? projectCollectionPriorityRows(rows, comparePriorityLabels)
			: [...rows]
	);
	const filteredRows = $derived(filterSupportingCollectionRows(canonicalRows, query));
	const previewRows = $derived(getGridContentListPreview(canonicalRows, denseThreshold).rows);
	let isManagePinsOpen = $state(false);
	let managePinsReturnEl = $state<HTMLButtonElement>();
	let priorityActionError = $state('');

	const openManagePins = (element: HTMLButtonElement) => {
		managePinsReturnEl = element;
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

	const stableRowAction = (row: SupportingCollectionRow, action: 'pin' | 'detail') =>
		document.getElementById(`${row.key}-${action}-action`);

	const openRow = async (row: SupportingCollectionRow, element: HTMLButtonElement) => {
		const fromFocusedView = focusedOpen;
		if (fromFocusedView) {
			focusedOpen = false;
			await tick();
		}
		onOpenRow(
			row,
			() => {
				const target = element.isConnected ? element : stableRowAction(row, 'detail');
				if (!(target instanceof HTMLElement)) return false;
				target.focus();
				return document.activeElement === target;
			},
			fromFocusedView
		);
	};

	const addRecord = async () => {
		if (!onAdd) return;
		const fromFocusedView = focusedOpen;
		if (fromFocusedView) {
			focusedOpen = false;
			await tick();
		}
		onAdd(fromFocusedView);
	};

	const togglePin = async (row: SupportingCollectionRow, element: HTMLButtonElement) => {
		if (!onSavePins) return;
		priorityActionError = '';
		const list = element.closest('ul');
		const positions = captureCollectionRowPositions(list);
		const next = canonicalRows
			.filter((candidate) => (candidate.identity === row.identity ? !row.pinned : candidate.pinned))
			.map((candidate) => candidate.identity);
		try {
			const result = await onSavePins(next);
			if (!result.ok) priorityActionError = result.message;
		} catch {
			priorityActionError = 'Pins could not be saved. Review the collection and try again.';
		}
		await tick();
		animateCollectionRowMovement(list, positions);
		const target = element.isConnected ? element : stableRowAction(row, 'pin');
		if (target instanceof HTMLElement) target.focus();
	};
</script>

{#snippet actions()}
	<div class="flex items-center gap-1">
		{#if onAdd}
			<IconButton
				bind:buttonEl={addTriggerEl}
				variant="add"
				size="sm"
				ariaLabel={`Add ${title}`}
				onclick={() => void addRecord()}
			/>
		{/if}
		{#if canManagePins}
			<BaseButton
				size="sm"
				onclick={(event) => openManagePins(event.currentTarget as HTMLButtonElement)}
				>Manage Pins</BaseButton
			>
		{/if}
	</div>
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
			<li
				class="flex min-w-0 items-center gap-2 rounded-md border px-2 py-1"
				data-row-key={row.key}
			>
				<div class="min-w-0 flex-1">
					<IconPrefixedListItem
						icon={isPinned ? 'pin' : 'bullet'}
						iconAlign="center"
						element="div"
						title={isPinned ? 'Pinned' : undefined}
						paragraphClasses={compact
							? 'supporting-collection-compact'
							: 'supporting-collection-full'}
					>
						{#if labelEntry}
							<DetailLabelButton
								id={`${row.key}-detail-action`}
								label={row.label}
								ariaLabel={`Open ${row.label}`}
								presentation={smallEdit?.entryStyle === 'button' ? 'button' : 'label'}
								onclick={(event) => void openRow(row, event.currentTarget as HTMLButtonElement)}
							/>
						{:else}<span>{row.label}</span>{/if}
						{#each row.badges ?? [] as badge (`${row.key}-${badge}`)}<Badge label={badge} />{/each}
						{#if row.context}<Badge label={row.context} />{/if}
						{#if annotationCount > 0}<Badge
								label={`${annotationCount} ${annotationCount === 1 ? 'note' : 'notes'}`}
							/>{/if}
					</IconPrefixedListItem>
					{#if row.detail}<p class="theme-text-muted mt-1 truncate text-xs">{row.detail}</p>{/if}
				</div>
				{#if priorityEnabled || !labelEntry}<div class="flex shrink-0 items-center gap-1">
						{#if priorityEnabled}
							<IconButton
								id={`${row.key}-pin-action`}
								variant="pin"
								size="sm"
								shadingVariant={row.pinned ? 'dark' : 'light'}
								ariaLabel={`${row.pinned ? 'Unpin' : 'Pin'} ${row.label}`}
								ariaPressed={row.pinned}
								onclick={(event) => void togglePin(row, event.currentTarget as HTMLButtonElement)}
							/>
						{/if}
						{#if !labelEntry}<IconButton
								id={`${row.key}-detail-action`}
								variant="detail"
								size="sm"
								ariaLabel={`View ${row.label} details`}
								onclick={(event) => void openRow(row, event.currentTarget as HTMLButtonElement)}
							/>{/if}
					</div>{/if}
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
		bind:focusedOpen
		{onFocusedOpened}
	>
		{#snippet preview()}
			{@render collectionRows(previewRows, true, `${title} preview`)}
		{/snippet}
		{#snippet results()}
			{@render collectionRows(filteredRows, false, `${title} results`)}
		{/snippet}
		{#snippet focusedActions()}
			{@render actions()}
		{/snippet}
	</ResponsiveCollectionView>
	{#if priorityActionError}<p class="theme-error rounded-md border px-3 py-2 text-sm" role="alert">
			{priorityActionError}
		</p>{/if}
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
