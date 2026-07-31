<script lang="ts">
	import DialogShell from '$components/DialogShell.svelte';

	interface Props {
		open: boolean;
		characterCount: number;
		onconfirm: () => void;
		onclose: () => void;
	}

	let { open = $bindable(false), characterCount, onconfirm, onclose }: Props = $props();
</script>

<DialogShell bind:open title="Export Characters" onClose={onclose} closeText="Cancel">
	<p>
		Are you sure you want to export all {characterCount} character{characterCount === 1 ? '' : 's'} to
		a JSON file?
	</p>

	{#snippet actions()}
		<button
			type="button"
			class="theme-btn touch-target btn cursor-pointer rounded-md px-3 py-1 bg-blue-600 text-white"
			onclick={onconfirm}
		>
			Export
		</button>
	{/snippet}
</DialogShell>
