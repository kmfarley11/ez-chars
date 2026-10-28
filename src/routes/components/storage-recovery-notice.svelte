<script lang="ts">
	import { tick } from 'svelte';
	import { charsStorageIssue, resetRejectedStoredCharacters } from '$storage/store.js';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import DialogShell from '$lib/ui/molecules/dialog-shell.svelte';

	let resetOpen = $state(false);
	let error = $state('');
	let resetButton = $state<HTMLButtonElement>();
	let resetStatus = $state<HTMLParagraphElement>();
	let resetSucceeded = $state(false);

	const downloadOriginal = () => {
		const raw = $charsStorageIssue?.originalData;
		if (raw === null || raw === undefined) return;
		const url = URL.createObjectURL(new Blob([raw], { type: 'text/plain;charset=utf-8' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'ez-chars-rejected-storage.txt';
		link.rel = 'noopener';
		document.body.append(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	};
	const closeReset = async () => {
		resetOpen = false;
		error = '';
		await tick();
		(resetSucceeded ? resetStatus : resetButton)?.focus({ preventScroll: true });
	};
	const confirmReset = () => {
		if (!resetRejectedStoredCharacters()) {
			error =
				'Reset could not be saved. Your original data is still protected. Try again when browser storage is available.';
			return;
		}
		resetOpen = false;
		error = '';
		resetSucceeded = true;
	};
</script>

{#if $charsStorageIssue}
	<section
		class="theme-grid-layer mx-4 mt-4 rounded-md border p-4"
		aria-label="Character data recovery"
	>
		<div role="alert" class="space-y-1">
			<p class="text-sm font-semibold">Stored character data could not be loaded.</p>
			<p class="theme-text-muted text-sm">
				It may be invalid, from an incompatible pre-release, or unavailable in this browser. The
				original has not been replaced. Demo characters and any changes are temporary until you
				reset storage.
			</p>
			<p class="theme-text-muted text-sm">
				Download the original before resetting. This recovery file is not a current character
				backup; automatic import or migration is not guaranteed. Character import is disabled during
				recovery.
			</p>
			{#if $charsStorageIssue.originalData === null}
				<p class="theme-text-muted text-sm">
					The original could not be read, so download is unavailable. Try reopening the app with
					browser storage enabled before resetting.
				</p>
			{/if}
		</div>
		<div class="mt-3 flex flex-wrap gap-2">
			<BaseButton onclick={downloadOriginal} disabled={$charsStorageIssue.originalData === null}
				>Download original data</BaseButton
			>
			<BaseButton
				bind:buttonEl={resetButton}
				onclick={() => {
					error = '';
					resetOpen = true;
				}}
				ariaHaspopup="dialog">Reset stored data</BaseButton
			>
		</div>
	</section>
{:else if resetSucceeded}
	<p
		bind:this={resetStatus}
		tabindex="-1"
		role="status"
		class="theme-grid-layer mx-4 mt-4 rounded-md border p-4"
	>
		Character storage reset. Changes will now be saved in this browser.
	</p>
{/if}

<DialogShell
	bind:open={resetOpen}
	title="Reset stored character data?"
	closeText="Cancel"
	onClose={closeReset}
>
	<p>
		This replaces the rejected data with fresh demo characters and discards temporary demo edits.
		Download the original first if you want to keep a copy.
	</p>
	{#if error}<p role="alert" class="mt-3 text-red-700 dark:text-red-300">{error}</p>{/if}
	{#snippet actions()}
		<BaseButton onclick={confirmReset}>Confirm reset</BaseButton>
	{/snippet}
</DialogShell>
