<script lang="ts">
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	let {
		label,
		description,
		onView,
		onRefresh
	}: {
		label?: string;
		description: string;
		onView: () => void;
		// eslint-disable-next-line no-unused-vars
		onRefresh?: (invoker: HTMLElement) => void;
	} = $props();
</script>

<section aria-label="Source" class="space-y-2 rounded-md border p-2">
	<p class="text-sm"><strong>Source:</strong> {label ?? 'No longer available'}</p>
	<p class="text-sm">{description}</p>
	<div class="flex flex-wrap gap-2">
		<BaseButton size="sm" disabled={!label} onclick={onView}>View source</BaseButton>
		{#if onRefresh}
			<BaseButton
				size="sm"
				disabled={!label}
				onclick={(event) => onRefresh?.(event.currentTarget as HTMLElement)}
				>Refresh from source</BaseButton
			>
		{/if}
	</div>
</section>
