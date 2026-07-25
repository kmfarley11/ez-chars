<script lang="ts">
	import DialogShell from '$components/DialogShell.svelte';
	import InventoryItemPicker from '$components/InventoryItemPicker.svelte';
	import ActionDraftForm, { type ActionDraft } from '$components/ActionDraftForm.svelte';
	import type { Item } from '../../../../schema';
	import type { RuntimeActionSuggestion } from '$lib/compendium/dnd5e2014/suggestInventoryRuntimeActions';

	interface Props {
		open: boolean;
		inventory: ReadonlyArray<Item>;
		loadSuggestions: (
			// eslint-disable-next-line no-unused-vars
			items: ReadonlyArray<Item>
		) => Promise<ReadonlyArray<RuntimeActionSuggestion>>;
		onConfirm: (
			// eslint-disable-next-line no-unused-vars
			draft: RuntimeActionSuggestion
		) => void;
		onClose: () => void;
	}

	let { open = $bindable(false), inventory, loadSuggestions, onConfirm, onClose }: Props = $props();

	let step = $state<1 | 2>(1);
	let selectedSourceId = $state<string | undefined>(undefined);
	let draft = $state<ActionDraft | undefined>(undefined);

	let nameError = $state<string | undefined>(undefined);
	let searchQuery = $state('');
	let equippedOnly = $state(false);
	let loadedSuggestions = $state<ReadonlyArray<RuntimeActionSuggestion>>([]);
	let suggestionsPromise = $state.raw<
		Promise<ReadonlyArray<RuntimeActionSuggestion>> | undefined
	>();
	let currentRequestId = $state(0);

	$effect(() => {
		if (open && !suggestionsPromise) {
			const id = ++currentRequestId;
			const p = Promise.resolve().then(() => loadSuggestions(inventory));
			p.then((suggestions) => {
				if (id === currentRequestId) {
					loadedSuggestions = suggestions;
				}
			}).catch(() => {});
			suggestionsPromise = p;
		}
	});

	$effect(() => {
		if (!open) {
			resetState();
		}
	});

	const resetState = () => {
		step = 1;
		selectedSourceId = undefined;
		draft = undefined;
		loadedSuggestions = [];
		nameError = undefined;
		suggestionsPromise = undefined;
		searchQuery = '';
		equippedOnly = false;
	};

	const handleItemSelect = (id: string) => {
		selectedSourceId = id;
		const suggestion = loadedSuggestions.find((s) => s.source.id === id);
		if (suggestion) {
			draft = {
				name: suggestion.name,
				notes: suggestion.notes,
				timing: 'action',
				category: 'effect',
				target: undefined
			};
		} else {
			const item = inventory.find((i) => i.id === id);
			draft = {
				name: item?.name ?? 'Unknown',
				notes: item?.notes,
				timing: 'action',
				category: 'effect',
				target: undefined
			};
		}
		nameError = undefined;
		step = 2;
	};

	const handleBack = () => {
		step = 1;
	};

	const handleConfirm = () => {
		if (!draft || !selectedSourceId) return;
		const trimmedName = draft.name.trim();
		if (trimmedName.length === 0) {
			nameError = 'Name is required.';
			return;
		}
		onConfirm({
			name: trimmedName,
			timing: draft.timing,
			category: draft.category,
			target: draft.target,
			notes: draft.notes,
			source: { kind: 'item', id: selectedSourceId }
		});
		open = false;
		onClose();
	};

	const handleClose = () => {
		open = false;
		onClose();
	};
</script>

<DialogShell
	bind:open
	title={step === 1 ? 'Select Inventory Item' : 'Customize Action'}
	showBack={step === 2}
	onBack={handleBack}
	onClose={handleClose}
	closeText="Cancel"
	fullHeightMobile={true}
>
	{#if step === 1}
		{#if inventory.length === 0}
			<div class="p-4 text-center">
				<p class="theme-text-muted text-sm mb-2">Your inventory is empty.</p>
				<p class="theme-text-muted text-sm">
					To add a custom action without linking an item, close this dialog and click <span
						class="font-semibold">Edit</span
					> in the card menu.
				</p>
			</div>
		{:else}
			{#await suggestionsPromise}
				<div class="flex justify-center p-8">
					<p class="theme-text-muted text-sm" role="status">Loading inventory items…</p>
				</div>
			{:then}
				<InventoryItemPicker
					items={inventory}
					selectedId={selectedSourceId}
					bind:searchQuery
					bind:equippedOnly
					onSelect={handleItemSelect}
				/>
			{:catch}
				<div
					class="p-4 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300"
				>
					<p class="text-sm font-semibold mb-1">Failed to load suggestions</p>
					<p class="text-xs">
						There was an error loading your inventory items. Close this dialog and try again, or use
						the <span class="font-semibold">Edit</span> menu on the card to add a custom action manually.
					</p>
				</div>
			{/await}
		{/if}
	{:else if step === 2 && draft}
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
