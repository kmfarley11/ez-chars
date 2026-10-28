<script lang="ts">
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import IconBookOpen from '$lib/ui/atoms/icon-book-open.svelte';
	let { id, onOpen }: { id: string; onOpen: () => void } = $props();
</script>

<aside class="sheet-rules-utility" aria-label="Rules shortcut">
	<BaseButton
		{id}
		size="lg"
		iconOnly
		ariaLabel="Rules"
		title="Open rules"
		classes="sheet-rules-trigger rounded-r-none"
		onclick={onOpen}
	>
		<IconBookOpen classes="h-5 w-5" />
	</BaseButton>
</aside>

<style>
	.sheet-rules-utility {
		position: fixed;
		top: max(5rem, 18dvh);
		right: 0;
		z-index: 30;
		pointer-events: none;
	}
	.sheet-rules-utility :global(.sheet-rules-trigger) {
		pointer-events: auto;
		box-shadow: -0.15rem 0.15rem 0.35rem rgb(0 0 0 / 0.18);
	}
</style>
