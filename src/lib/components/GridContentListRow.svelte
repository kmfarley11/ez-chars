<script lang="ts">
	import Badge from '$components/Badge.svelte';
	import MenuButton from '$components/MenuButton.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
	import type { GridContentListRow, GridContentListRowAction } from '$components/gridContentList';

	interface Props {
		row: GridContentListRow;
		compact?: boolean;
		onEditRow?: GridContentListRowAction;
		onNotesRow?: GridContentListRowAction;
	}

	let { row, compact = false, onEditRow, onNotesRow }: Props = $props();
	let actionsTriggerEl = $state<HTMLButtonElement>();

	const annotationCount = $derived(row.annotations?.length ?? 0);
	const hasActions = $derived(onEditRow !== undefined || onNotesRow !== undefined);
	const accessibleRowLabel = $derived(
		[row.label, row.context, row.detail].filter((value) => value?.trim()).join(', ')
	);

	const runCommand = (event: MouseEvent, command: GridContentListRowAction | undefined) => {
		const popover =
			event.currentTarget instanceof Element ? event.currentTarget.closest('[popover]') : undefined;
		if (popover instanceof HTMLElement) popover.hidePopover();
		command?.(row, () => actionsTriggerEl?.focus());
	};
</script>

<li class="rounded-md border px-3 py-2" data-row-key={row.key}>
	<div class="flex min-w-0 items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<p class={compact ? 'flex min-w-0 items-baseline gap-1 overflow-hidden text-sm' : 'text-sm'}>
				<span class={compact ? 'min-w-0 truncate font-semibold' : 'font-semibold'}>{row.label}</span
				>
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
		{#if hasActions}
			<MenuButton
				buttonIconOnly={true}
				buttonSize="sm"
				iconVariant="ellipsis"
				ariaLabel={`Row actions for ${accessibleRowLabel}`}
				title={`Row actions for ${accessibleRowLabel}`}
				bind:triggerEl={actionsTriggerEl}
			>
				{#if onEditRow}
					<MenuItemButton onclick={(event) => runCommand(event, onEditRow)}>Edit</MenuItemButton>
				{/if}
				{#if onNotesRow}
					<MenuItemButton onclick={(event) => runCommand(event, onNotesRow)}>Notes</MenuItemButton>
				{/if}
			</MenuButton>
		{/if}
	</div>
</li>
