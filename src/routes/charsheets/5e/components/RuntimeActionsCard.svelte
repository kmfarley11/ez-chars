<script lang="ts">
	import BaseButton from '$components/BaseButton.svelte';
	import GridContent from '$components/GridContent.svelte';
	import MenuButton from '$components/MenuButton.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
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
	import { projectRuntimeActionRows } from './runtimeActionRows';

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
	const actionRows = $derived(projectRuntimeActionRows(actions, inventory));

	const requestSuggestions = () => {
		isSuggestionPanelOpen = true;
		suggestionRequest = Promise.resolve().then(() => loadSuggestions(inventory));
	};

	const closeSuggestions = () => {
		isSuggestionPanelOpen = false;
		suggestionRequest = undefined;
	};

	const runSourceCommand = (event: MouseEvent, command: () => void) => {
		const popover =
			event.currentTarget instanceof Element ? event.currentTarget.closest('[popover]') : undefined;
		if (popover instanceof HTMLElement) popover.hidePopover();
		command();
	};
</script>

<div class="space-y-4">
	<section class="space-y-3" aria-labelledby={`${uid}-actions-heading`}>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 id={`${uid}-actions-heading`} class="text-sm font-semibold">Runtime actions</h3>
			<div class="flex items-center gap-2">
				<BaseButton size="sm" onclick={requestSuggestions}>Add action from inventory</BaseButton>
				<GridContent
					{data}
					{annotationEditorConfig}
					{handleEditSavePatches}
					presentation="controls-only"
				/>
			</div>
		</div>

		{#if actionRows.length === 0}
			<p class="theme-text-muted text-sm">No runtime actions yet.</p>
		{:else}
			<ul class="space-y-2" aria-label="Runtime actions">
				{#each actionRows as action (action.id)}
					<li class="rounded-md border px-3 py-2">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-sm">
									<span class="font-semibold">{action.name}</span>
									<span class="theme-text-muted">
										<span aria-hidden="true"> · </span>{action.timingLabel}
										<span aria-hidden="true"> · </span>{action.categoryLabel}
									</span>
								</p>
								{#if action.target}
									<p class="theme-text-muted mt-1 text-xs">Target: {action.target}</p>
								{/if}
								{#if action.notes}
									<p class="theme-text-muted mt-1 whitespace-pre-line text-sm italic">
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
									<MenuItemButton
										onclick={(event) =>
											runSourceCommand(event, () => onNavigateToSource(source.itemId))}
									>
										View {source.itemName}
									</MenuItemButton>
									<MenuItemButton
										onclick={(event) => runSourceCommand(event, () => onResyncAction(action.id))}
									>
										Resync from source
									</MenuItemButton>
								</MenuButton>
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
