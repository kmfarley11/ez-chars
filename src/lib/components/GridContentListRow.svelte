<script lang="ts">
	import Badge from '$components/Badge.svelte';
	import IconPin from '$components/IconPin.svelte';
	import IconButton from '$components/IconButton.svelte';
	import DetailLabelButton from './DetailLabelButton.svelte';
	import { getSmallEditAccess } from './smallEditContext';
	const smallEdit = getSmallEditAccess();
	import type { GridContentListRow, GridContentListRowAction } from '$components/gridContentList';

	interface Props {
		row: GridContentListRow;
		compact?: boolean;
		onOpenRow?: GridContentListRowAction;
		onTogglePinRow?: GridContentListRowAction;
	}

	let { row, compact = false, onOpenRow, onTogglePinRow }: Props = $props();
	let detailTriggerEl = $state<HTMLButtonElement>();
	let pinTriggerEl = $state<HTMLButtonElement>();

	const annotationCount = $derived(row.annotations?.length ?? 0);
	const isPinned = $derived('pinned' in row && row.pinned === true);
	const accessibleRowLabel = $derived(
		[row.label, row.context, row.detail].filter((value) => value?.trim()).join(', ')
	);

	const runCommand = (
		command: GridContentListRowAction | undefined,
		trigger: HTMLButtonElement | undefined
	) => {
		command?.(row, () => {
			const stableTrigger = trigger?.isConnected
				? trigger
				: document.getElementById(`${row.key}-detail-action`);
			if (!(stableTrigger instanceof HTMLElement)) return false;
			stableTrigger.focus();
			return document.activeElement === stableTrigger;
		});
	};
</script>

<li class="rounded-md border px-3 py-2" data-row-key={row.key}>
	<div class="flex min-w-0 items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<p class={compact ? 'flex min-w-0 items-baseline gap-1 overflow-hidden text-sm' : 'text-sm'}>
				<span
					class={compact
						? 'flex min-w-0 items-center gap-1.5 truncate font-semibold'
						: 'flex items-center gap-1.5 font-semibold'}
				>
					{#if 'pinned' in row && row.pinned}
						<span title="Pinned" aria-hidden="true" class="flex items-center justify-center">
							<IconPin classes="theme-text shrink-0 h-3.5 w-3.5" />
						</span>
						<span class="sr-only">Pinned</span>
					{/if}
					{#if onOpenRow && smallEdit?.enabled && (smallEdit.entryStyle === 'label' || smallEdit.entryStyle === 'button')}
						<DetailLabelButton
							label={row.label}
							ariaLabel={`Open ${accessibleRowLabel}`}
							presentation={smallEdit.entryStyle}
							onclick={(event) => runCommand(onOpenRow, event.currentTarget as HTMLButtonElement)}
						/>
					{:else}<span>{row.label}</span>{/if}
				</span>
				{#if row.detail}
					<span aria-hidden="true" class="shrink-0">:</span>
					<span
						class={compact
							? 'theme-text-muted min-w-0 flex-1 truncate italic'
							: 'theme-text-muted whitespace-pre-line italic'}>{row.detail}</span
					>
				{/if}
			</p>
			{#if row.context || (row.badges?.length ?? 0) > 0 || annotationCount > 0}
				<div class="mt-1 flex flex-wrap items-center gap-1.5">
					{#each row.badges ?? [] as badge (`${row.key}-${badge}`)}
						<Badge label={badge} />
					{/each}
					{#if row.context}
						<span class="theme-text-muted text-xs">{row.context}</span>
					{/if}
					{#if annotationCount > 0}
						<Badge label={`${annotationCount} ${annotationCount === 1 ? 'note' : 'notes'}`} />
					{/if}
				</div>
			{/if}
		</div>
		<div class="flex shrink-0 items-center gap-1">
			{#if onTogglePinRow}
				<IconButton
					bind:buttonEl={pinTriggerEl}
					variant="pin"
					size="sm"
					shadingVariant={isPinned ? 'dark' : 'light'}
					ariaLabel={`${isPinned ? 'Unpin' : 'Pin'} ${accessibleRowLabel}`}
					ariaPressed={isPinned}
					onclick={() => runCommand(onTogglePinRow, pinTriggerEl)}
				/>
			{/if}
			{#if onOpenRow}
				<IconButton
					id={`${row.key}-detail-action`}
					bind:buttonEl={detailTriggerEl}
					variant="detail"
					size="sm"
					ariaLabel={`View ${accessibleRowLabel} details`}
					onclick={() => runCommand(onOpenRow, detailTriggerEl)}
				/>
			{/if}
		</div>
	</div>
</li>
