<script>
	import NavBar from '$lib/NavBar.svelte';
	import { onMount } from 'svelte';
	import { initializeTheme } from '$lib/theme';
	import { charsStorageIssue, clearRejectedStoredCharacters } from '../data';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		initializeTheme();
	});
</script>

<div class="theme-page">
	<NavBar />
	{#if $charsStorageIssue}
		<div class="mx-4 mt-4 rounded-md border p-4 theme-grid-layer" role="alert" aria-live="polite">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div class="space-y-1">
					<p class="text-sm font-semibold">Stored character data could not be loaded.</p>
					<p class="theme-text-muted text-sm">
						The saved character data in this browser appears invalid or from an unsupported older
						format, so the app loaded demo characters instead.
					</p>
				</div>
				<button
					type="button"
					class="theme-btn-light btn shrink-0 rounded-md border px-3 py-1"
					onclick={clearRejectedStoredCharacters}
				>
					Clear Stored Data
				</button>
			</div>
		</div>
	{/if}
	{@render children()}
</div>
