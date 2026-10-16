<script lang="ts">
	import { untrack } from 'svelte';
	import {
		resolve5eRuntimeActionSource,
		type RuntimeActionDraft
	} from '$lib/systems/dnd5e-2014/runtime-action-sources';
	import type { CharacterDocument5e2014, RuntimeActionSource } from '../../../../schema/index';
	import {
		reduce5eSheetEditIntents,
		type SheetEditIntent,
		type SheetEditIssue
	} from '$lib/systems/dnd5e-2014/editing/sheet-edit-intents';
	import { project5eSheet } from '$lib/systems/dnd5e-2014/sheet-projections';
	import RuntimeActionsCard from '$lib/systems/dnd5e-2014/components/runtime-actions-card.svelte';

	interface Props {
		initialCharacter: CharacterDocument5e2014;
		// eslint-disable-next-line no-unused-vars
		onCreateAction?: (_draft: RuntimeActionDraft) => void;
		// eslint-disable-next-line no-unused-vars
		onResyncAction?: (_actionId: string) => void;
		// eslint-disable-next-line no-unused-vars
		onNavigateToSource?: (_source: RuntimeActionSource) => void;
		// eslint-disable-next-line no-unused-vars
		confirmResync?: (_actionName: string, _sourceLabel: string) => boolean;
	}

	let {
		initialCharacter,
		onCreateAction = undefined,
		onResyncAction = undefined,
		onNavigateToSource = undefined,
		confirmResync = () => true
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

	const handleCreateAction = (draft: RuntimeActionDraft) => {
		if (!commitIntents([{ type: 'create-runtime-action', draft }])) return;
		feedback = `Added ${draft.name}.`;
		onCreateAction?.(draft);
	};

	const handleResyncAction = (actionId: string) => {
		if (!commitIntents([{ type: 'resync-runtime-action', actionId }])) return;
		feedback = 'Resynced action from its source.';
		onResyncAction?.(actionId);
	};

	const handleNavigateToSource = (source: RuntimeActionSource) => {
		const sourceLabel =
			resolve5eRuntimeActionSource(character, source)?.sourceLabel ?? `${source.kind}:${source.id}`;
		feedback = `Source navigation requested for ${sourceLabel}.`;
		onNavigateToSource?.(source);
	};
</script>

<p class="theme-text-muted mb-3 text-sm">
	System-owned runtime action sandbox with disposable character state. Add or edit an action, resync
	a linked source, and compare phone width. Source navigation reports its target here; use Character
	Sheet / Saturated to navigate between actual sheet sections. Row editing here intentionally
	exercises the retained whole-record Detail/Edit fallback. The canonical Character Sheet examples
	demonstrate the current independently saved field workflow.
</p>

{#if issueMessage}
	<p class="mb-3 rounded-md border px-3 py-2 text-sm" role="alert">{issueMessage}</p>
{:else if feedback}
	<p class="theme-text-muted mb-3 text-sm" role="status">{feedback}</p>
{/if}

<RuntimeActionsCard
	{character}
	annotationEditorConfig={projection.annotationEditorConfig}
	onIntents={commitIntents}
	onCreateAction={handleCreateAction}
	onResyncAction={handleResyncAction}
	onNavigateToSource={handleNavigateToSource}
	{confirmResync}
/>
