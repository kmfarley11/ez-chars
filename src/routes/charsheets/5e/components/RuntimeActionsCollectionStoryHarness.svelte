<script lang="ts">
	import type { RuntimeActionSource } from '../../../../schema';
	import RuntimeActionsCollection from './RuntimeActionsCollection.svelte';
	import type { RuntimeActionRow } from './runtimeActionRows';

	type ActionCallback = () => void;
	// eslint-disable-next-line no-unused-vars
	type NavigateCallback = (source: RuntimeActionSource) => void;
	// eslint-disable-next-line no-unused-vars
	type ResyncCallback = (actionId: string, actionName: string, sourceLabel: string) => void;

	interface Props {
		rows: ReadonlyArray<RuntimeActionRow>;
		query?: string;
		denseThreshold?: number;
		onAdd: ActionCallback;
		onEdit: ActionCallback;
		onNotes: ActionCallback;
		onNavigateToSource: NavigateCallback;
		onResyncAction: ResyncCallback;
		withScrollRunway?: boolean;
		requiresPhoneViewport?: boolean;
	}

	let {
		rows,
		query = $bindable(''),
		denseThreshold = 5,
		onAdd,
		onEdit,
		onNotes,
		onNavigateToSource,
		onResyncAction,
		withScrollRunway = false,
		requiresPhoneViewport = false
	}: Props = $props();
</script>

{#snippet collection()}
	<div class="theme-grid-layer rounded-md border p-3">
		<RuntimeActionsCollection
			{rows}
			bind:query
			{denseThreshold}
			{onAdd}
			{onEdit}
			{onNotes}
			{onNavigateToSource}
			{onResyncAction}
		/>
	</div>
{/snippet}

{#if requiresPhoneViewport}
	<aside
		aria-label="Phone viewport review"
		class="theme-grid-layer theme-text-muted mb-3 rounded-md border px-3 py-2 text-sm"
	>
		<strong class="font-semibold">Phone viewport required.</strong>
		Use Storybook's viewport toolbar to select a phone preset, or narrow the canvas below 640px, before
		reviewing this proof.
	</aside>
{/if}

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
