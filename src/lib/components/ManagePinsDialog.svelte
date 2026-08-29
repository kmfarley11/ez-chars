<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import BaseButton from '$components/BaseButton.svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import {
		filterCollectionPriorityRows,
		type CollectionPriorityRow,
		type CollectionPrioritySave
	} from '$components/collectionPriority';
	import { getGridContentListCountLabel } from '$components/gridContentList';

	interface Props {
		title: string;
		rows: ReadonlyArray<CollectionPriorityRow>;
		open?: boolean;
		query?: string;
		searchEnabled?: boolean;
		onSave: CollectionPrioritySave;
		onClosed?: () => void;
	}

	let {
		title,
		rows,
		open = $bindable(false),
		query = $bindable(''),
		searchEnabled = false,
		onSave,
		onClosed
	}: Props = $props();

	const uid = $props.id();
	let dialogShellEl = $state<ReturnType<typeof DialogShell>>();
	const draftPinnedIds = new SvelteSet(
		untrack(() => rows.filter((row) => row.pinned).map((row) => row.identity))
	);
	let savePending = $state(false);
	let saveError = $state('');
	const hasQuery = $derived(query.trim().length > 0);
	const visibleRows = $derived(
		searchEnabled ? filterCollectionPriorityRows(rows, query) : [...rows]
	);
	const countLabel = $derived(
		getGridContentListCountLabel(visibleRows.length, rows.length, searchEnabled && hasQuery)
	);

	$effect(() => {
		if (open) tick().then(() => dialogShellEl?.focusHeading());
	});

	const toggleDraftPin = (identity: string) => {
		if (draftPinnedIds.has(identity)) draftPinnedIds.delete(identity);
		else draftPinnedIds.add(identity);
		saveError = '';
	};

	const save = async (closeDialog: () => void) => {
		savePending = true;
		saveError = '';
		try {
			const result = await onSave([...draftPinnedIds]);
			if (!result.ok) {
				saveError = result.message;
				return;
			}
			closeDialog();
		} catch {
			saveError = 'Pins could not be saved. Review the collection and try again.';
		} finally {
			savePending = false;
		}
	};
</script>

<DialogShell
	bind:this={dialogShellEl}
	bind:open
	title={`Manage Pins · ${title}`}
	closeText="Cancel"
	fullHeightMobile={true}
	scrollAffordance={true}
	onClose={onClosed}
>
	<div class="space-y-3">
		<p class="theme-text-muted text-sm">
			Pinned entries appear first in the collection. Changes apply together when you save.
		</p>

		{#if searchEnabled}
			<div class="space-y-2">
				<div class="flex flex-wrap items-end gap-2">
					<label class="min-w-48 flex-1" for={`${uid}-search`}>
						<span class="sr-only">Search {title}</span>
						<input
							id={`${uid}-search`}
							type="search"
							class="theme-input touch-target w-full rounded-md border px-3 py-1.5"
							placeholder={`Search ${title.toLocaleLowerCase()}`}
							bind:value={query}
						/>
					</label>
					{#if hasQuery}
						<BaseButton size="sm" onclick={() => (query = '')}>Clear search</BaseButton>
					{/if}
				</div>
				<p class="theme-text-muted text-xs" role="status" aria-live="polite">{countLabel}</p>
			</div>
		{/if}

		{#if rows.length === 0}
			<p class="theme-text-muted rounded-md border px-3 py-3 text-sm italic">
				No entries are available to pin.
			</p>
		{:else if visibleRows.length === 0}
			<p class="theme-text-muted rounded-md border px-3 py-3 text-sm" role="status">
				No {title.toLocaleLowerCase()} match “{query.trim()}”.
			</p>
		{:else}
			<ul class="space-y-1" aria-label={`${title} Pin choices`}>
				{#each visibleRows as row (row.identity)}
					<li>
						<label
							class="manage-pins-choice theme-grid-layer touch-target flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2"
							style="min-height: 44px"
						>
							<input
								type="checkbox"
								class="mt-1 shrink-0"
								checked={draftPinnedIds.has(row.identity)}
								onchange={() => toggleDraftPin(row.identity)}
							/>
							<span class="min-w-0 text-sm">
								<span class="font-medium">{row.label}</span>
								{#if row.detail}
									<span class="theme-text-muted block break-words italic">{row.detail}</span>
								{/if}
								{#if row.context}
									<span class="theme-text-muted block text-xs">{row.context}</span>
								{/if}
							</span>
						</label>
					</li>
				{/each}
			</ul>
		{/if}

		{#if saveError}
			<p class="theme-error rounded-md border px-3 py-2 text-sm" role="alert">{saveError}</p>
		{/if}
	</div>

	{#snippet actions(closeDialog)}
		<BaseButton onclick={() => save(closeDialog)} disabled={savePending || rows.length === 0}>
			{savePending ? 'Saving…' : 'Save Pins'}
		</BaseButton>
	{/snippet}
</DialogShell>
