<script lang="ts">
	import Badge from '$components/Badge.svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import GridContentActionMenu from '$components/GridContentActionMenu.svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import MenuButton from '$components/MenuButton.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';
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

	const uid = $props.id();
	let isSuggestionPanelOpen = $state(false);
	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let cardActionsTriggerEl = $state<HTMLButtonElement>();
	const actionRows = $derived(
		projectRuntimeActionRows(character.systemData.runtimeActions, character)
	);
	const sourceCandidates = $derived(list5eRuntimeActionSourceCandidates(character));

	const requestSuggestions = () => {
		isSuggestionPanelOpen = true;
	};

	const closeSuggestions = () => {
		isSuggestionPanelOpen = false;
	};

	const restoreCardActionsFocus = () => {
		cardActionsTriggerEl?.focus();
	};

	const runSourceCommand = (event: MouseEvent, command: () => void) => {
		const popover =
			event.currentTarget instanceof Element ? event.currentTarget.closest('[popover]') : undefined;
		if (popover instanceof HTMLElement) popover.hidePopover();
		command();
	};

	const handleResyncRequest = (actionId: string, actionName: string, sourceLabel: string) => {
		if (confirmResync(actionName, sourceLabel)) onResyncAction(actionId);
	};
</script>

<div class="space-y-4">
	<section class="space-y-3" aria-labelledby={`${uid}-actions-heading`}>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 id={`${uid}-actions-heading`} class="text-sm font-semibold">Runtime actions</h3>
			<div class="flex items-center gap-2">
				<BaseButton size="sm" onclick={requestSuggestions}>Add action</BaseButton>
				<GridContentActionMenu
					canEdit={true}
					onEdit={() => (isEditDialogOpen = true)}
					onNotes={() => (isNotesDialogOpen = true)}
					bind:triggerEl={cardActionsTriggerEl}
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
									{#if action.sourceCategoryLabel}
										<span class="ml-1.5 inline-flex align-middle">
											<Badge label={action.sourceCategoryLabel} />
										</span>
									{/if}
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
											runSourceCommand(event, () => onNavigateToSource(source.reference))}
									>
										View {source.label}
									</MenuItemButton>
									<MenuItemButton
										onclick={(event) =>
											runSourceCommand(event, () =>
												handleResyncRequest(action.id, action.name, source.label)
											)}
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

	<RuntimeActionDialog
		bind:open={isSuggestionPanelOpen}
		candidates={sourceCandidates}
		onConfirm={onCreateAction}
		onClose={closeSuggestions}
	/>
</div>
