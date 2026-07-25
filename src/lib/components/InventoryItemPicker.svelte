<script lang="ts">
	import type { Item } from '../../schema';
	import { filterAndSortInventoryItems } from '../compendium/dnd5e2014/suggestInventoryRuntimeActions';

	interface Props {
		items: ReadonlyArray<Item>;
		selectedId?: string;
		searchQuery?: string;
		equippedOnly?: boolean;
		// eslint-disable-next-line no-unused-vars
		onSelect?: (_id: string) => void;
	}

	let {
		items,
		selectedId,
		searchQuery = $bindable(''),
		equippedOnly = $bindable(false),
		onSelect
	}: Props = $props();

	let filteredItems = $derived(filterAndSortInventoryItems(items, searchQuery, equippedOnly));

	let selectedItem = $derived(items.find((i) => i.id === selectedId));
	let selectedItemInView = $derived(filteredItems.some((i) => i.id === selectedId));
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<input
			type="search"
			placeholder="Search inventory..."
			class="theme-input flex-1 rounded-md border px-3 py-1.5"
			bind:value={searchQuery}
			aria-label="Search inventory"
		/>
		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				class="theme-input h-4 w-4 rounded border"
				bind:checked={equippedOnly}
			/>
			<span class="text-sm">Equipped only</span>
		</label>
	</div>

	<ul class="flex flex-col gap-2 max-h-64 overflow-y-auto border rounded-md p-2">
		{#if selectedItem && !selectedItemInView}
			<li class="rounded-md border border-blue-500/30 bg-blue-500/5">
				<button
					type="button"
					class="w-full text-left px-3 py-2"
					onclick={() => onSelect?.(selectedItem.id)}
				>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-semibold">
								{selectedItem.name}
								{#if selectedItem.quantity && selectedItem.quantity > 1}
									<span class="theme-text-muted text-xs ml-1">x{selectedItem.quantity}</span>
								{/if}
							</p>
							{#if selectedItem.notes}
								<p class="theme-text-muted text-xs truncate">{selectedItem.notes}</p>
							{/if}
						</div>
						<span class="text-blue-600 text-sm">Selected (Filtered)</span>
					</div>
				</button>
			</li>
		{/if}

		{#each filteredItems as item (item.id)}
			{@const isSelected = item.id === selectedId}
			<li
				class="rounded-md border {isSelected
					? 'border-blue-500 ring-1 ring-blue-500'
					: 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'}"
			>
				<button
					type="button"
					class="w-full text-left px-3 py-2"
					onclick={() => onSelect?.(item.id)}
					aria-pressed={isSelected}
				>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-semibold flex items-center gap-2">
								{item.name}
								{#if item.quantity && item.quantity > 1}
									<span class="theme-text-muted text-xs">x{item.quantity}</span>
								{/if}
								{#if item.equipped}
									<span
										class="theme-text-muted text-[10px] uppercase tracking-wider border rounded px-1"
										>Equipped</span
									>
								{/if}
							</p>
							{#if item.notes}
								<p class="theme-text-muted text-xs truncate">{item.notes}</p>
							{/if}
						</div>
					</div>
				</button>
			</li>
		{:else}
			<li class="px-3 py-4 text-center">
				<p class="theme-text-muted text-sm mb-2">No items match your search.</p>
				<p class="theme-text-muted text-xs">
					To add a custom action, close this dialog and use the <span class="font-semibold"
						>Edit</span
					> menu on the card.
				</p>
			</li>
		{/each}
	</ul>
</div>
