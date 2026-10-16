<script lang="ts">
	/* eslint-disable no-unused-vars */
	import { tick } from 'svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import DialogShell from '$lib/ui/molecules/dialog-shell.svelte';
	import Table from '$lib/ui/molecules/table.svelte';
	import TableRow from '$lib/ui/atoms/table-row.svelte';
	import TableCell from '$lib/ui/atoms/table-cell.svelte';
	import TableHeader from '$lib/ui/molecules/table-header.svelte';
	import MenuButton from '$lib/ui/molecules/menu-button.svelte';
	import MenuItemButton from '$lib/ui/molecules/menu-item-button.svelte';
	import { capitalizeFirstLetter } from '$utils/stringFormatters';
	import type { CharacterWithSystemData } from '../../schema/index.js';
	import { toCharacterSummary, type CharacterSummary } from '../characterSummary.js';

	interface Props {
		characters: CharacterWithSystemData[];
		onSelect: (character: CharacterWithSystemData) => void;
		onDelete?: (character: CharacterWithSystemData) => void;
		secondaryActionPlacement?: 'direct' | 'menu';
	}

	let {
		characters,
		onSelect,
		onDelete = undefined,
		secondaryActionPlacement = 'direct'
	}: Props = $props();

	let summaries = $derived(characters.map(toCharacterSummary));
	const showDelete = $derived(typeof onDelete === 'function');
	const headers = ['identity', 'system', 'classes', 'updated', 'actions'];

	let pendingDeleteCharacter = $state<CharacterSummary | null>(null);
	let menuTriggerEls = $state<Record<string, HTMLButtonElement>>({});
	let activeDeleteTriggerEl = $state<HTMLButtonElement | null>(null);

	const handleOpenDelete = (summary: CharacterSummary, triggerEl?: HTMLButtonElement) => {
		activeDeleteTriggerEl = triggerEl ?? menuTriggerEls[summary.id] ?? null;
		pendingDeleteCharacter = summary;
	};

	const handleConfirmDelete = () => {
		if (pendingDeleteCharacter) {
			onDelete?.(pendingDeleteCharacter.raw);
			pendingDeleteCharacter = null;
		}
	};

	const handleCloseDelete = async () => {
		pendingDeleteCharacter = null;
		await tick();
		if (activeDeleteTriggerEl?.isConnected) {
			activeDeleteTriggerEl.focus();
		}
		activeDeleteTriggerEl = null;
	};
</script>

{#if summaries.length === 0}
	<div
		class="rounded-lg border border-[var(--color-surface-border)] p-6 text-center theme-text-muted"
	>
		No characters found. Create or import a character to get started.
	</div>
{:else}
	<!-- Desktop View: Semantic HTML <table> (>= 768px / md) -->
	<div class="hidden md:block max-w-full overflow-x-auto p-0">
		<Table aria-label="Characters">
			<TableHeader {headers} formatHeader={capitalizeFirstLetter} align="left" />
			<tbody>
				{#each summaries as summary (summary.id)}
					<TableRow class="cursor-pointer" onclick={() => onSelect(summary.raw)}>
						<TableCell class="font-semibold">
							{summary.name}
						</TableCell>
						<TableCell>
							{summary.systemLabel}
						</TableCell>
						<TableCell>
							{summary.classSummary}
						</TableCell>
						<TableCell>
							{summary.updatedAt}
						</TableCell>
						<TableCell class="w-px whitespace-nowrap" onclick={(event) => event.stopPropagation()}>
							<div class="flex items-center justify-start gap-2">
								<BaseButton
									size="sm"
									ariaLabel={`Open ${summary.name}`}
									onclick={() => onSelect(summary.raw)}
								>
									Open
								</BaseButton>
								{#if showDelete}
									<BaseButton
										size="sm"
										ariaLabel={`Delete ${summary.name}`}
										onclick={(event) => {
											event.stopPropagation();
											handleOpenDelete(summary, event.currentTarget as HTMLButtonElement);
										}}
									>
										Delete
									</BaseButton>
								{/if}
							</div>
						</TableCell>
					</TableRow>
				{/each}
			</tbody>
		</Table>
	</div>

	<!-- Mobile View: Semantic Card List (< 768px / md) -->
	<div class="block md:hidden">
		<ul role="list" aria-label="Characters list" class="m-0 list-none space-y-3 p-0">
			{#each summaries as summary (summary.id)}
				<li>
					<article
						aria-label={`Character card for ${summary.name}`}
						class="bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-surface-text)] flex flex-col gap-3 rounded-lg border p-4 shadow-sm"
					>
						<div class="flex items-start justify-between gap-2">
							<h3 class="m-0 text-lg font-bold leading-tight break-words">{summary.name}</h3>
							<span
								class="theme-btn-light border-[var(--color-surface-border)] inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-semibold"
							>
								{summary.systemLabel}
							</span>
						</div>

						<div class="theme-text-muted space-y-1 text-sm">
							<div>
								<span class="text-[var(--color-surface-text)] font-medium">Classes:</span>
								{summary.classSummary}
							</div>
							<div>
								<span class="text-[var(--color-surface-text)] font-medium">Updated:</span>
								{summary.updatedAt}
							</div>
						</div>

						<div
							class="border-[var(--color-surface-border)] flex items-center justify-end gap-3 border-t pt-2"
						>
							<BaseButton
								size="sm"
								ariaLabel={`Open ${summary.name}`}
								onclick={() => onSelect(summary.raw)}>Open</BaseButton
							>
							{#if showDelete}
								{#if secondaryActionPlacement === 'menu'}
									<MenuButton
										buttonIconOnly={true}
										buttonSize="sm"
										iconVariant="ellipsis"
										ariaLabel={`Options for ${summary.name}`}
										title={`Options for ${summary.name}`}
										bind:triggerEl={menuTriggerEls[summary.id]}
									>
										<MenuItemButton onclick={() => handleOpenDelete(summary)}>
											Delete
										</MenuItemButton>
									</MenuButton>
								{:else}
									<BaseButton
										size="sm"
										ariaLabel={`Delete ${summary.name}`}
										onclick={(event) =>
											handleOpenDelete(summary, event.currentTarget as HTMLButtonElement)}
									>
										Delete
									</BaseButton>
								{/if}
							{/if}
						</div>
					</article>
				</li>
			{/each}
		</ul>
	</div>
{/if}

{#if showDelete}
	<DialogShell
		open={pendingDeleteCharacter !== null}
		title="Delete character"
		closeText="Cancel"
		onClose={handleCloseDelete}
	>
		<div class="space-y-2 px-1 py-1 text-left text-sm">
			<h3 class="text-lg leading-none font-semibold">Delete character?</h3>
			<p class="theme-text-muted">
				This will permanently remove
				<strong>{pendingDeleteCharacter?.name}</strong>
				from local storage.
			</p>
		</div>
		{#snippet actions(closeDialog: () => void)}
			<button
				type="button"
				class="theme-btn-dark touch-target btn cursor-pointer rounded-md border px-3 py-1"
				onclick={() => {
					handleConfirmDelete();
					closeDialog();
				}}
			>
				Delete
			</button>
		{/snippet}
	</DialogShell>
{/if}
