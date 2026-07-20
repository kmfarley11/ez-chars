<script lang="ts">
	import { untrack } from 'svelte';
	import { applyGridPatches } from '$utils/characterGridHelpers';
	import type { GridContentPatch } from '$utils/gridContentTypes';
	import type { RuntimeActionSuggestion } from '$lib/compendium/dnd5e2014/suggestInventoryRuntimeActions';
	import type { CharacterDocument5e2014, Item } from '../../../../schema';
	import { decode5eGridPatches } from '../sheetEditDecoder';
	import {
		reduce5eSheetEditIntents,
		type SheetEditIntent,
		type SheetEditIssue
	} from '../sheetEditIntents';
	import { project5eSheet } from '../sheetProjections';
	import RuntimeActionsCard from './RuntimeActionsCard.svelte';

	interface Props {
		initialCharacter: CharacterDocument5e2014;
		loadSuggestions?: (
			// eslint-disable-next-line no-unused-vars
			items: ReadonlyArray<Item>
		) => Promise<ReadonlyArray<RuntimeActionSuggestion>>;
		// eslint-disable-next-line no-unused-vars
		onEditSavePatches?: (_patches: Array<GridContentPatch>) => void;
		// eslint-disable-next-line no-unused-vars
		onAcceptSuggestion?: (_suggestion: RuntimeActionSuggestion) => void;
		// eslint-disable-next-line no-unused-vars
		onResyncAction?: (_actionId: string) => void;
		// eslint-disable-next-line no-unused-vars
		onNavigateToSource?: (_itemId: string) => void;
	}

	let {
		initialCharacter,
		loadSuggestions = undefined,
		onEditSavePatches = undefined,
		onAcceptSuggestion = undefined,
		onResyncAction = undefined,
		onNavigateToSource = undefined
	}: Props = $props();

	let character = $state.raw<CharacterDocument5e2014>(
		untrack(() => structuredClone(initialCharacter))
	);
	let feedback = $state<string | undefined>(undefined);
	let issueMessage = $state<string | undefined>(undefined);
	let nextGeneratedId = 0;
	const projection = $derived(project5eSheet(character));
	const createStoryId = () => `storybook-action-${++nextGeneratedId}`;

	const formatIssues = (issues: ReadonlyArray<SheetEditIssue>) =>
		issues.map((issue) => issue.message).join(' ');

	const commitIntents = (intents: ReadonlyArray<SheetEditIntent>): boolean => {
		const result = reduce5eSheetEditIntents(character, intents, { createId: createStoryId });
		if (!result.ok) {
			issueMessage = formatIssues(result.issues);
			return false;
		}

		character = result.character;
		issueMessage = undefined;
		return true;
	};

	const handleGridPatchesSave = (patches: Array<GridContentPatch>) => {
		const decoded = decode5eGridPatches(patches);
		if (!decoded.ok) {
			issueMessage = formatIssues(decoded.issues);
			return;
		}

		const patched = applyGridPatches(character, decoded.edits.canonicalPatches);
		const result = reduce5eSheetEditIntents(patched, decoded.edits.intents, {
			createId: createStoryId
		});
		if (!result.ok) {
			issueMessage = formatIssues(result.issues);
			return;
		}

		character = result.character;
		feedback = 'Saved runtime action changes.';
		issueMessage = undefined;
		onEditSavePatches?.(patches);
	};

	const handleAcceptSuggestion = (suggestion: RuntimeActionSuggestion) => {
		if (!commitIntents([{ type: 'accept-runtime-action-suggestion', suggestion }])) return;
		feedback = `Added ${suggestion.name}.`;
		onAcceptSuggestion?.(suggestion);
	};

	const handleResyncAction = (actionId: string) => {
		if (!commitIntents([{ type: 'resync-runtime-action', actionId }])) return;
		feedback = 'Resynced action from its inventory source.';
		onResyncAction?.(actionId);
	};

	const handleNavigateToSource = (itemId: string) => {
		const sourceName = character.inventory.find((item) => item.id === itemId)?.name ?? itemId;
		feedback = `Source navigation requested for ${sourceName}.`;
		onNavigateToSource?.(itemId);
	};
</script>

{#if issueMessage}
	<p class="mb-3 rounded-md border px-3 py-2 text-sm" role="alert">{issueMessage}</p>
{:else if feedback}
	<p class="theme-text-muted mb-3 text-sm" role="status">{feedback}</p>
{/if}

<RuntimeActionsCard
	data={projection.runtimeActionData}
	actions={character.systemData.runtimeActions}
	inventory={character.inventory}
	annotationEditorConfig={projection.annotationEditorConfig}
	handleEditSavePatches={handleGridPatchesSave}
	{loadSuggestions}
	onAcceptSuggestion={handleAcceptSuggestion}
	onResyncAction={handleResyncAction}
	onNavigateToSource={handleNavigateToSource}
/>
