<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import type {
		CollectionPrioritySave,
		CollectionPrioritySaveResult
	} from '$lib/ui/molecules/collection-priority';
	import { compare5e2014PriorityLabels } from '$lib/systems/dnd5e-2014/collection-priority';
	import SupportingCollectionView from '$lib/systems/dnd5e-2014/components/supporting-collection-view.svelte';
	import type { SupportingCollectionRow } from '$lib/systems/dnd5e-2014/components/supporting-collection-rows';

	type ActionCallback = () => void;

	interface Props {
		title: string;
		rows: ReadonlyArray<SupportingCollectionRow>;
		query?: string;
		denseThreshold?: number;
		onEdit: ActionCallback;
		onNotes: ActionCallback;
		withScrollRunway?: boolean;
		constrainWidth?: boolean;
		priorityProof?: boolean;
		prioritySaveError?: string;
		onPrioritySave?: CollectionPrioritySave;
	}

	let {
		title,
		rows,
		query = $bindable(''),
		denseThreshold = 7,
		onEdit,
		onNotes,
		withScrollRunway = false,
		constrainWidth = false,
		priorityProof = false,
		prioritySaveError = '',
		onPrioritySave = async () => ({ ok: true })
	}: Props = $props();

	const pinnedIdentities = new SvelteSet(
		untrack(() => rows.filter((row) => row.pinned).map((row) => row.identity))
	);
	const presentedRows = $derived(
		rows.map((row) => ({ ...row, pinned: pinnedIdentities.has(row.identity) }))
	);

	const savePins = async (
		identities: ReadonlyArray<string>
	): Promise<CollectionPrioritySaveResult> => {
		await onPrioritySave(identities);
		if (prioritySaveError) return { ok: false, message: prioritySaveError };
		pinnedIdentities.clear();
		for (const identity of identities) pinnedIdentities.add(identity);
		return { ok: true };
	};
</script>

{#snippet collection()}
	<div class={['theme-grid-layer rounded-md border p-3', constrainWidth && 'w-72 max-w-full']}>
		<SupportingCollectionView
			{title}
			rows={presentedRows}
			bind:query
			{denseThreshold}
			onAdd={onEdit}
			onOpenRow={() => onNotes()}
			onSavePins={priorityProof ? savePins : undefined}
			comparePriorityLabels={priorityProof ? compare5e2014PriorityLabels : undefined}
		/>
	</div>
{/snippet}

<aside
	aria-label="Supporting collection example guidance"
	class="theme-grid-layer theme-text-muted mb-3 space-y-2 rounded-md border px-3 py-2 text-sm"
>
	<p>
		<strong class="font-semibold">System-owned collection presentation sandbox.</strong>
		Search, pin/unpin where available, and compare scrolling at desktop and phone widths.
	</p>
	<p>
		Add and Open only emit example callbacks here; they do not create records or open editors. Use
		Character Sheet / Saturated for complete editing. The error control deliberately rejects pin
		saves without changing the rows.
	</p>
</aside>

{#if withScrollRunway}
	<div class="p-4">
		<div class="theme-text-muted flex h-[55vh] items-end pb-4 text-sm">
			Scroll the page until the collection is centered, then continue with the pointer inside it.
		</div>
		{@render collection()}
		<div class="theme-text-muted h-[70vh] pt-4 text-sm">
			The page-scroll runway continues below the collection.
		</div>
	</div>
{:else}
	{@render collection()}
{/if}
