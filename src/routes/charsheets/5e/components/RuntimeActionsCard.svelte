<script lang="ts">
	import BaseButton from '$components/BaseButton.svelte';
	import GridContent from '$components/GridContent.svelte';
	import {
		suggest5eInventoryRuntimeActions,
		type RuntimeActionSuggestion
	} from '$lib/compendium/dnd5e2014/suggestInventoryRuntimeActions';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { Item, RuntimeAction } from '../../../../schema';

	interface Props {
		data: GridContentData;
		actions: ReadonlyArray<RuntimeAction>;
		inventory: ReadonlyArray<Item>;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches: (_patches: Array<GridContentPatch>) => void;
		loadSuggestions?: (
			// eslint-disable-next-line no-unused-vars
			items: ReadonlyArray<Item>
		) => Promise<ReadonlyArray<RuntimeActionSuggestion>>;
		// eslint-disable-next-line no-unused-vars
		onAcceptSuggestion: (_suggestion: RuntimeActionSuggestion) => void;
		// eslint-disable-next-line no-unused-vars
		onResyncAction: (_actionId: string) => void;
		// eslint-disable-next-line no-unused-vars
		onNavigateToSource: (_itemId: string) => void;
	}

	let {
		data,
		actions,
		inventory,
		annotationEditorConfig = undefined,
		handleEditSavePatches,
		loadSuggestions = suggest5eInventoryRuntimeActions,
		onAcceptSuggestion,
		onResyncAction,
		onNavigateToSource
	}: Props = $props();

	const uid = $props.id();
	let isSuggestionPanelOpen = $state(false);
	let suggestionRequest = $state<Promise<ReadonlyArray<RuntimeActionSuggestion>> | undefined>(
		undefined
	);
	const inventoryById = $derived(new Map(inventory.map((item) => [item.id, item])));

	const requestSuggestions = () => {
		isSuggestionPanelOpen = true;
		suggestionRequest = Promise.resolve().then(() => loadSuggestions(inventory));
	};

	const closeSuggestions = () => {
		isSuggestionPanelOpen = false;
		suggestionRequest = undefined;
	};
</script>

<div class="space-y-4">
	<GridContent
		{data}
		{annotationEditorConfig}
		{handleEditSavePatches}
		displayArrayMode="stack"
		displayMaxCols={1}
	/>

	<section class="space-y-2 border-t pt-3" aria-labelledby={`${uid}-source-heading`}>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 id={`${uid}-source-heading`} class="text-sm font-semibold">Action sources</h3>
			<BaseButton size="sm" onclick={requestSuggestions}>Add action from inventory</BaseButton>
		</div>

		{#if actions.length === 0}
			<p class="theme-text-muted text-sm">No runtime actions yet.</p>
		{:else}
			<ul class="space-y-2" aria-label="Runtime action source status">
				{#each actions as action (action.id)}
					{@const sourceItem = action.source ? inventoryById.get(action.source.id) : undefined}
					<li class="rounded-md border px-3 py-2">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div>
								<p class="text-sm font-semibold">{action.name}</p>
								{#if action.source}
									<p class="theme-text-muted text-xs">
										{sourceItem ? `Linked to ${sourceItem.name}` : 'Linked item unavailable'}
									</p>
								{:else}
									<p class="theme-text-muted text-xs">Custom action</p>
								{/if}
							</div>
							{#if action.source && sourceItem}
								<div class="flex flex-wrap gap-2">
									<BaseButton size="sm" onclick={() => onNavigateToSource(sourceItem.id)}>
										View {sourceItem.name}
									</BaseButton>
									<BaseButton size="sm" onclick={() => onResyncAction(action.id)}>
										Resync from source
									</BaseButton>
								</div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	{#if isSuggestionPanelOpen && suggestionRequest}
		<section class="space-y-3 rounded-md border p-3" aria-labelledby={`${uid}-suggestions-heading`}>
			<div class="flex items-center justify-between gap-2">
				<h3 id={`${uid}-suggestions-heading`} class="text-sm font-semibold">
					Inventory action suggestions
				</h3>
				<BaseButton size="sm" onclick={closeSuggestions}>Close</BaseButton>
			</div>

			{#await suggestionRequest}
				<p class="theme-text-muted text-sm" role="status">Loading inventory suggestions…</p>
			{:then suggestions}
				{#if suggestions.length === 0}
					<p class="theme-text-muted text-sm">No equipped inventory items to suggest.</p>
				{:else}
					<ul class="space-y-2" aria-label="Inventory action suggestions">
						{#each suggestions as suggestion (`${suggestion.source.id}-${suggestion.name}`)}
							<li
								class="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
							>
								<div>
									<p class="text-sm font-semibold">{suggestion.name}</p>
									{#if suggestion.notes}
										<p class="theme-text-muted text-xs">{suggestion.notes}</p>
									{/if}
								</div>
								<BaseButton size="sm" onclick={() => onAcceptSuggestion(suggestion)}>
									Add {suggestion.name}
								</BaseButton>
							</li>
						{/each}
					</ul>
				{/if}
			{:catch}
				<p class="text-sm" role="alert">
					Inventory suggestions could not be loaded. You can still add a custom action.
				</p>
			{/await}

			<p class="theme-text-muted text-xs">
				Manual custom actions remain available from Card actions → Edit.
			</p>
		</section>
	{/if}
</div>
