<script lang="ts">
	import DialogShell from '$components/DialogShell.svelte';

	interface Props {
		open: boolean;
		state: 'reading' | 'error' | 'ready' | 'success';
		errorMessage?: string;
		characterCount?: number;
		successMessage?: string;
		onmerge: () => void;
		onreplace: () => void;
		onclose: () => void;
	}

	let {
		open = $bindable(false),
		state,
		errorMessage,
		characterCount,
		successMessage,
		onmerge,
		onreplace,
		onclose
	}: Props = $props();

	const title = 'Import Characters';
</script>

<DialogShell
	bind:open
	{title}
	onClose={onclose}
	closeText={state === 'success' ? 'Done' : 'Cancel'}
>
	{#if state === 'reading'}
		<p class="theme-text-muted" role="status" aria-live="polite">Reading import file...</p>
	{:else if state === 'error'}
		<p class="text-red-700 dark:text-red-300" role="alert">{errorMessage}</p>
	{:else if state === 'ready'}
		<p class="mb-4">
			Ready to import {characterCount} character{characterCount === 1 ? '' : 's'}. Choose how to
			apply it:
		</p>
		<p class="theme-text-muted text-sm mb-4">
			<strong>Merge New</strong>: Skips characters with IDs already in your local list.<br />
			<strong>Replace All</strong>:
			<span class="text-red-600 dark:text-red-400 font-medium">Destructive.</span> Discards your current
			local list entirely.
		</p>
	{:else if state === 'success'}
		<p class="text-green-700 dark:text-green-300" role="status" aria-live="polite">
			{successMessage}
		</p>
	{/if}

	{#snippet actions()}
		{#if state === 'ready'}
			<button
				type="button"
				class="theme-btn btn cursor-pointer rounded-md px-3 py-1 bg-blue-600 text-white"
				onclick={onmerge}
			>
				Merge New
			</button>
			<button
				type="button"
				class="theme-btn btn cursor-pointer rounded-md px-3 py-1 bg-red-600 text-white"
				onclick={onreplace}
			>
				Replace All
			</button>
		{/if}
	{/snippet}
</DialogShell>
