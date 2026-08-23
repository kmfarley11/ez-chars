<script lang="ts">
	import { tick } from 'svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import {
		list5eRuntimeActionSourceCandidates,
		type RuntimeActionDraft
	} from '$lib/dnd5e2014/runtimeActionSources';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { CharacterDocument5e2014, RuntimeActionSource } from '../../../../schema';
	import { projectRuntimeActionRows } from './runtimeActionRows';
	import RuntimeActionDialog from './RuntimeActionDialog.svelte';
	import RuntimeActionsCollection from './RuntimeActionsCollection.svelte';

	interface Props {
		data: GridContentData;
		character: CharacterDocument5e2014;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches: (_patches: Array<GridContentPatch>) => void;
		// eslint-disable-next-line no-unused-vars
		onCreateAction: (_draft: RuntimeActionDraft) => void;
		// eslint-disable-next-line no-unused-vars
		onResyncAction: (_actionId: string) => void;
		// eslint-disable-next-line no-unused-vars
		onNavigateToSource: (_source: RuntimeActionSource) => void;
		// eslint-disable-next-line no-unused-vars
		confirmResync?: (_actionName: string, _sourceLabel: string) => boolean;
	}

	let {
		data,
		character,
		annotationEditorConfig = undefined,
		handleEditSavePatches,
		onCreateAction,
		onResyncAction,
		onNavigateToSource,
		confirmResync = (actionName, sourceLabel) =>
			window.confirm(
				`Resync "${actionName}" from ${sourceLabel}? Source-owned name and detail may overwrite direct edits on this action.`
			)
	}: Props = $props();

	let isSuggestionPanelOpen = $state(false);
	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let cardActionsTriggerEl = $state<HTMLButtonElement>();
	let focusedCardActionsTriggerEl = $state<HTMLButtonElement>();
	let addActionTriggerEl = $state<HTMLButtonElement>();
	const actionRows = $derived(
		projectRuntimeActionRows(character.systemData.runtimeActions, character)
	);
	const sourceCandidates = $derived(list5eRuntimeActionSourceCandidates(character));

	const requestSuggestions = () => {
		isSuggestionPanelOpen = true;
	};

	const closeSuggestions = async () => {
		isSuggestionPanelOpen = false;
		await tick();
		addActionTriggerEl?.focus();
	};

	const restoreCardActionsFocus = () => {
		const target = focusedCardActionsTriggerEl?.isConnected
			? focusedCardActionsTriggerEl
			: cardActionsTriggerEl;
		target?.focus();
	};

	const handleResyncRequest = (actionId: string, actionName: string, sourceLabel: string) => {
		if (confirmResync(actionName, sourceLabel)) onResyncAction(actionId);
	};
</script>

<div class="space-y-4">
	<RuntimeActionsCollection
		rows={actionRows}
		onAdd={requestSuggestions}
		onEdit={() => (isEditDialogOpen = true)}
		onNotes={() => (isNotesDialogOpen = true)}
		{onNavigateToSource}
		onResyncAction={handleResyncRequest}
		bind:cardActionsTriggerEl
		bind:focusedCardActionsTriggerEl
		bind:addActionTriggerEl
	/>

	<GridContentEditDialog
		bind:open={isEditDialogOpen}
		{data}
		{handleEditSavePatches}
		onClosed={restoreCardActionsFocus}
	/>
	<GridContentNotesDialog
		bind:open={isNotesDialogOpen}
		{data}
		{annotationEditorConfig}
		{handleEditSavePatches}
		onClosed={restoreCardActionsFocus}
	/>

	<RuntimeActionDialog
		bind:open={isSuggestionPanelOpen}
		candidates={sourceCandidates}
		onConfirm={onCreateAction}
		onClose={closeSuggestions}
	/>
</div>
