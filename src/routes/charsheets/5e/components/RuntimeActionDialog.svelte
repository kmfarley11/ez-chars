<script lang="ts">
	import { tick } from 'svelte';
	import DialogShell from '$components/DialogShell.svelte';
	import RuntimeActionSourcePicker from '$components/RuntimeActionSourcePicker.svelte';
	import ActionDraftForm, { type ActionDraft } from '$components/ActionDraftForm.svelte';
	import type {
		RuntimeActionDraft,
		RuntimeActionSourceCandidate,
		RuntimeActionSourceCategoryFilter
	} from '$lib/dnd5e2014/runtimeActionSources';

	interface Props {
		open: boolean;
		candidates: ReadonlyArray<RuntimeActionSourceCandidate>;
		// eslint-disable-next-line no-unused-vars
		onConfirm: (_draft: RuntimeActionDraft) => void;
		onClose: () => void;
	}

	let { open = $bindable(false), candidates, onConfirm, onClose }: Props = $props();

	let dialogShellEl = $state<ReturnType<typeof DialogShell>>();
	let step = $state<1 | 2>(1);
	let selectionKind = $state<'source' | 'custom' | undefined>();
	let selectedKey = $state<string | undefined>();
	let draft = $state<ActionDraft | undefined>();
	let nameError = $state<string | undefined>();
	let searchQuery = $state('');
	let category = $state<RuntimeActionSourceCategoryFilter>('all');
	let equippedOnly = $state(false);

	const resetState = () => {
		step = 1;
		selectionKind = undefined;
		selectedKey = undefined;
		draft = undefined;
		nameError = undefined;
		searchQuery = '';
		category = 'all';
		equippedOnly = false;
	};

	const sourceDraft = (candidate: RuntimeActionSourceCandidate): ActionDraft => ({
		name: candidate.ownedText.name,
		...(candidate.ownedText.ownsNotes && candidate.ownedText.notes
			? { notes: candidate.ownedText.notes }
			: {}),
		timing: 'action',
		category: 'effect'
	});

	const handleSourceSelect = (key: string) => {
		const candidate = candidates.find((entry) => entry.key === key);
		if (!candidate) return;
		if (selectionKind !== 'source' || selectedKey !== key || !draft) {
			draft = sourceDraft(candidate);
		}
		selectionKind = 'source';
		selectedKey = key;
		nameError = undefined;
		step = 2;
		tick().then(() => dialogShellEl?.focusHeading());
	};

	const handleCustomSelect = () => {
		if (selectionKind !== 'custom' || !draft) {
			draft = {
				name: '',
				timing: 'action',
				category: 'effect'
			};
		}
		selectionKind = 'custom';
		selectedKey = undefined;
		nameError = undefined;
		step = 2;
		tick().then(() => dialogShellEl?.focusHeading());
	};

	const handleBack = () => {
		step = 1;
		tick().then(() => dialogShellEl?.focusHeading());
	};

	const handleConfirm = () => {
		if (!draft || !selectionKind) return;
		const trimmedName = draft.name.trim();
		if (!trimmedName) {
			nameError = 'Name is required.';
			return;
		}
		const selectedCandidate =
			selectionKind === 'source'
				? candidates.find((candidate) => candidate.key === selectedKey)
				: undefined;
		if (selectionKind === 'source' && !selectedCandidate) return;

		onConfirm({
			name: trimmedName,
			...(draft.timing ? { timing: draft.timing } : {}),
			...(draft.category ? { category: draft.category } : {}),
			...(draft.target ? { target: draft.target } : {}),
			...(draft.notes ? { notes: draft.notes } : {}),
			...(selectedCandidate ? { source: selectedCandidate.source } : {})
		});
		open = false;
		onClose();
		resetState();
	};

	const handleClose = () => {
		open = false;
		onClose();
		resetState();
	};
</script>

<DialogShell
	bind:this={dialogShellEl}
	bind:open
	title={step === 1 ? 'Add action' : 'Review action'}
	showBack={step === 2}
	onBack={handleBack}
	onClose={handleClose}
	closeText="Cancel"
	fullHeightMobile={true}
>
	{#if step === 1}
		<div class="flex flex-col gap-4">
			<button
				type="button"
				class="theme-btn-light w-full rounded-md border px-3 py-3 text-left"
				aria-pressed={selectionKind === 'custom'}
				onclick={handleCustomSelect}
			>
				<span class="block text-sm font-semibold">Create custom action</span>
				<span class="theme-text-muted block text-xs">Start with a blank, unlinked action.</span>
			</button>
			<RuntimeActionSourcePicker
				{candidates}
				{selectedKey}
				bind:searchQuery
				bind:category
				bind:equippedOnly
				onSelect={handleSourceSelect}
			/>
		</div>
	{:else if draft}
		<ActionDraftForm
			{draft}
			error={nameError}
			onChange={(next) => {
				draft = next;
				nameError = undefined;
			}}
		/>
	{/if}

	{#snippet actions()}
		{#if step === 2}
			<button
				type="button"
				class="theme-btn-dark btn cursor-pointer rounded-md border px-3 py-1"
				onclick={handleConfirm}
			>
				Confirm Action
			</button>
		{/if}
	{/snippet}
</DialogShell>
