<script lang="ts">
	import { untrack } from 'svelte';
	import SmallEditScope from '$components/SmallEditScope.svelte';
	import { create5eSmallRecordModel } from '../smallEditAdapters';
	import { reduce5eSheetEditIntents, type SheetEditIntent } from '../sheetEditIntents';
	import { project5eSheet } from '../sheetProjections';
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import RuntimeActionsCard from './RuntimeActionsCard.svelte';
	let {
		initialCharacter,
		withScrollRunway = false,
		showTimingHeadings = true
	}: {
		initialCharacter: CharacterDocument5e2014;
		withScrollRunway?: boolean;
		showTimingHeadings?: boolean;
	} = $props();
	let character = $state.raw(untrack(() => structuredClone(initialCharacter)));
	const owner = {
		read: () => character,
		write: (next: CharacterDocument5e2014) => {
			character = next;
		}
	};
	const projection = $derived(project5eSheet(character));
	let notice = $state('');
	const applyIntents = (intents: ReadonlyArray<SheetEditIntent>) => {
		const result = reduce5eSheetEditIntents(character, intents);
		if (!result.ok) return false;
		character = result.character;
		return true;
	};
</script>

<SmallEditScope
	enabled
	buildGrid={() => undefined}
	buildRecord={(key) => create5eSmallRecordModel(owner, key, projection.annotationEditorConfig)}
>
	<div class="p-3">
		<p class="theme-text-muted mb-3 text-sm">
			BL-078: select Action + Reaction, combine search, then Pin and edit a match. This sandbox
			saves into a disposable in-memory character. View Source reports its destination here; use the
			real-sheet proof for cross-section navigation.
		</p>
		{#if withScrollRunway}<div class="theme-text-muted flex h-[55vh] items-end pb-4 text-sm">
				Scroll until the collection is centered, then continue inside it.
			</div>{/if}
		<RuntimeActionsCard
			{character}
			{showTimingHeadings}
			annotationEditorConfig={projection.annotationEditorConfig}
			onIntents={applyIntents}
			onCreateAction={(draft) => applyIntents([{ type: 'create-runtime-action', draft }])}
			onResyncAction={(actionId) => applyIntents([{ type: 'resync-runtime-action', actionId }])}
			onNavigateToSource={(source) => (notice = `Source destination: ${source.kind} ${source.id}`)}
		/>
		{#if notice}<p role="status">{notice}</p>{/if}
		{#if withScrollRunway}<div class="theme-text-muted h-[70vh] pt-4 text-sm">
				Page scroll continues below.
			</div>{/if}
	</div>
</SmallEditScope>
