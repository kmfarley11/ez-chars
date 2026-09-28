<script lang="ts">
	import { tick } from 'svelte';
	import Badge from '$components/Badge.svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import IconButton from '$components/IconButton.svelte';
	import DetailLabelButton from '$components/DetailLabelButton.svelte';
	import { getSmallEditAccess } from '$components/smallEditContext';
	const smallEdit = getSmallEditAccess();
	import MenuButton from '$components/MenuButton.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
	import ResponsiveCollectionView from '$components/ResponsiveCollectionView.svelte';
	import type { RuntimeActionSource } from '../../../../schema';
	import { filterRuntimeActionRows, type RuntimeActionRow } from './runtimeActionRows';

	// eslint-disable-next-line no-unused-vars
	type ActionCallback = (..._args: [boolean?]) => void;
	type OpenActionCallback = (
		// eslint-disable-next-line no-unused-vars
		row: RuntimeActionRow,
		// eslint-disable-next-line no-unused-vars
		restoreFocus: () => boolean,
		// eslint-disable-next-line no-unused-vars
		fromFocusedView: boolean
	) => void;
	// eslint-disable-next-line no-unused-vars
	type NavigateCallback = (source: RuntimeActionSource) => void;
	// eslint-disable-next-line no-unused-vars
	type ResyncCallback = (actionId: string, actionName: string, sourceLabel: string) => void;

	interface Props {
		rows: ReadonlyArray<RuntimeActionRow>;
		query?: string;
		denseThreshold?: number;
		onAdd: ActionCallback;
		onOpenAction: OpenActionCallback;
		onNavigateToSource: NavigateCallback;
		onResyncAction: ResyncCallback;
		addActionTriggerEl?: HTMLButtonElement;
		focusedOpen?: boolean;
		onFocusedOpened?: () => void;
	}

	let {
		rows,
		query = $bindable(''),
		denseThreshold = 5,
		onAdd,
		onOpenAction,
		onNavigateToSource,
		onResyncAction,
		addActionTriggerEl = $bindable(),
		focusedOpen = $bindable(false),
		onFocusedOpened = undefined
	}: Props = $props();

	const uid = $props.id();
	const filteredRows = $derived(filterRuntimeActionRows(rows, query));
	const previewRows = $derived(rows.slice(0, denseThreshold));

	const navigateToSource = async (source: RuntimeActionSource) => {
		focusedOpen = false;
		await tick();
		onNavigateToSource(source);
	};

	const addAction = async () => {
		const fromFocusedView = focusedOpen;
		if (fromFocusedView) {
			focusedOpen = false;
			await tick();
		}
		onAdd(fromFocusedView);
	};

	const openAction = async (action: RuntimeActionRow, element: HTMLButtonElement) => {
		const fromFocusedView = focusedOpen;
		if (fromFocusedView) {
			focusedOpen = false;
			await tick();
		}
		onOpenAction(
			action,
			() => {
				const target = element.isConnected
					? element
					: document.getElementById(`runtime-action-${action.id}-detail`);
				if (!(target instanceof HTMLElement)) return false;
				target.focus();
				return document.activeElement === target;
			},
			fromFocusedView
		);
	};
</script>

{#snippet actions(focused = false)}
	{#if focused}
		<BaseButton size="sm" onclick={() => void addAction()} bind:buttonEl={addActionTriggerEl}
			>Add action</BaseButton
		>
	{:else}
		<BaseButton size="sm" onclick={() => void addAction()} bind:buttonEl={addActionTriggerEl}
			>Add action</BaseButton
		>
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
								>{#if smallEdit?.enabled && (smallEdit.entryStyle === 'label' || smallEdit.entryStyle === 'button')}
									<DetailLabelButton
										label={action.name}
										ariaLabel={`Open ${action.name}`}
										presentation={smallEdit.entryStyle}
										onclick={(event) =>
											void openAction(action, event.currentTarget as HTMLButtonElement)}
									/>
								{:else}{action.name}{/if}</span
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
						{#if (action.annotations?.length ?? 0) > 0}
							<Badge
								label={`${action.annotations?.length} ${(action.annotations?.length ?? 0) === 1 ? 'note' : 'notes'}`}
							/>
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
					<div class="flex shrink-0 items-center gap-1">
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
								<MenuItemButton
									onclick={() => onResyncAction(action.id, action.name, source.label)}
								>
									Resync from source
								</MenuItemButton>
							</MenuButton>
						{/if}
						<IconButton
							id={`runtime-action-${action.id}-detail`}
							variant="detail"
							size="sm"
							ariaLabel={`View ${action.name} details`}
							onclick={(event) => void openAction(action, event.currentTarget as HTMLButtonElement)}
						/>
					</div>
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
		{onFocusedOpened}
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
