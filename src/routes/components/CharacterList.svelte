<script lang="ts">
	/* eslint-disable no-unused-vars */
	import { tick } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import TableHeader from '$components/TableHeader.svelte';
	import MenuButton from '$components/MenuButton.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
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
		<table
			aria-label="Characters"
			class="theme-table border-tools-table-outline w-full table-auto border-separate justify-between rounded-sm border-2 text-left"
		>
			<TableHeader {headers} formatHeader={capitalizeFirstLetter} align="left" />
			<tbody>
				{#each summaries as summary (summary.id)}
					<tr class="theme-table-row cursor-pointer" onclick={() => onSelect(summary.raw)}>
						<td class="rounded-sm border p-2 text-left align-top font-semibold wrap-break-word">
							{summary.name}
						</td>
						<td class="rounded-sm border p-2 text-left align-top wrap-break-word">
							{summary.systemLabel}
						</td>
						<td class="rounded-sm border p-2 text-left align-top wrap-break-word">
							{summary.classSummary}
						</td>
						<td class="rounded-sm border p-2 text-left align-top wrap-break-word">
							{summary.updatedAt}
						</td>
						<td
							class="w-px whitespace-nowrap rounded-sm border p-2 text-left align-top"
							onclick={(event) => event.stopPropagation()}
						>
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
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
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
