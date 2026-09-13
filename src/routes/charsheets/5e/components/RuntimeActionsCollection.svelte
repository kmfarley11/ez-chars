<script lang="ts">
	import { tick } from 'svelte';
	import Badge from '$components/Badge.svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import GridContentActionMenu from '$components/GridContentActionMenu.svelte';
	import MenuButton from '$components/MenuButton.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
	import ResponsiveCollectionView from '$components/ResponsiveCollectionView.svelte';
	import type { RuntimeActionSource } from '../../../../schema';
	import { filterRuntimeActionRows, type RuntimeActionRow } from './runtimeActionRows';

	type ActionCallback = () => void;
	// eslint-disable-next-line no-unused-vars
	type NavigateCallback = (source: RuntimeActionSource) => void;
	// eslint-disable-next-line no-unused-vars
	type ResyncCallback = (actionId: string, actionName: string, sourceLabel: string) => void;

	interface Props {
		rows: ReadonlyArray<RuntimeActionRow>;
		query?: string;
		denseThreshold?: number;
		onAdd: ActionCallback;
		onEdit: ActionCallback;
		onNotes: ActionCallback;
		onNavigateToSource: NavigateCallback;
		onResyncAction: ResyncCallback;
		cardActionsTriggerEl?: HTMLButtonElement;
		focusedCardActionsTriggerEl?: HTMLButtonElement;
		addActionTriggerEl?: HTMLButtonElement;
	}

	let {
		rows,
		query = $bindable(''),
		denseThreshold = 5,
		onAdd,
		onEdit,
		onNotes,
		onNavigateToSource,
		onResyncAction,
		cardActionsTriggerEl = $bindable(),
		focusedCardActionsTriggerEl = $bindable(),
		addActionTriggerEl = $bindable()
	}: Props = $props();

	const uid = $props.id();
	let focusedOpen = $state(false);
	const filteredRows = $derived(filterRuntimeActionRows(rows, query));
	const previewRows = $derived(rows.slice(0, denseThreshold));

	const navigateToSource = async (source: RuntimeActionSource) => {
		focusedOpen = false;
		await tick();
		onNavigateToSource(source);
	};
</script>

{#snippet actions(focused = false)}
	{#if focused}
		<BaseButton size="sm" onclick={onAdd}>Add action</BaseButton>
		<GridContentActionMenu
			canEdit={true}
			{onEdit}
			{onNotes}
			bind:triggerEl={focusedCardActionsTriggerEl}
		/>
	{:else}
		<BaseButton size="sm" onclick={onAdd} bind:buttonEl={addActionTriggerEl}>Add action</BaseButton>
		<GridContentActionMenu
			canEdit={true}
			{onEdit}
			{onNotes}
			bind:triggerEl={cardActionsTriggerEl}
		/>
	{/if}
{/snippet}

{#snippet actionRows(items: ReadonlyArray<RuntimeActionRow>, compact: boolean, label: string)}
	<ul class="space-y-2" aria-label={label}>
		{#each items as action (action.id)}
			<li class="rounded-md border px-3 py-2" data-row-key={action.id}>
				<div class="flex min-w-0 items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<p
							class={compact
								? 'flex min-w-0 items-baseline gap-1 overflow-hidden text-sm'
								: 'text-sm'}
						>
							<span class={compact ? 'min-w-0 truncate font-semibold' : 'font-semibold'}
								>{action.name}</span
							>
							<span class="theme-text-muted shrink-0">
								<span aria-hidden="true"> · </span>{action.timingLabel}
								<span aria-hidden="true"> · </span>{action.categoryLabel}
							</span>
						</p>
						<div class="mt-1 flex flex-wrap items-center gap-1.5">
							{#if action.sourceCategoryLabel}
								<Badge label={action.sourceCategoryLabel} />
							{/if}
							{#if action.source?.context}
								<span class="theme-text-muted text-xs">{action.source.context}</span>
							{/if}
						</div>
						{#if !compact && action.target}
							<p class="theme-text-muted mt-1 text-xs">Target: {action.target}</p>
						{/if}
						{#if action.notes}
							<p
								class={compact
									? 'theme-text-muted mt-1 truncate text-sm italic'
									: 'theme-text-muted mt-1 whitespace-pre-line text-sm italic'}
							>
								{action.notes}
							</p>
						{/if}
					</div>
					{#if action.source}
						{@const source = action.source}
						<MenuButton
							text="Source"
							iconVariant="chevron"
							buttonSize="sm"
							ariaLabel={`Source actions for ${action.name}`}
							title={`Source actions for ${action.name}`}
						>
							<MenuItemButton onclick={() => void navigateToSource(source.reference)}>
								View {source.label}
							</MenuItemButton>
							<MenuItemButton onclick={() => onResyncAction(action.id, action.name, source.label)}>
								Resync from source
							</MenuItemButton>
						</MenuButton>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{/snippet}

<section class="space-y-3" aria-labelledby={`${uid}-heading`}>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h3 id={`${uid}-heading`} class="text-sm font-semibold">Runtime actions</h3>
		<div class="flex items-center gap-2">
			{@render actions()}
		</div>
	</div>

	<ResponsiveCollectionView
		title="Runtime actions"
		totalCount={rows.length}
		filteredCount={filteredRows.length}
		threshold={denseThreshold}
		emptyText="No runtime actions yet."
		bind:query
		bind:focusedOpen
	>
		{#snippet preview()}
			{@render actionRows(previewRows, true, 'Runtime actions preview')}
		{/snippet}
		{#snippet results()}
			{@render actionRows(filteredRows, false, 'Runtime actions results')}
		{/snippet}
		{#snippet focusedActions()}
			{@render actions(true)}
		{/snippet}
	</ResponsiveCollectionView>
</section>
