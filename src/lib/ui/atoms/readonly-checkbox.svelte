<script lang="ts">
	let {
		value,
		label,
		explanation
	}: { value: boolean | undefined; label: string; explanation?: string } = $props();
	const explanationId = $props.id();
	const stateLabel = $derived(
		`${label}: ${value === undefined ? 'not set' : value ? 'enabled' : 'disabled'}`
	);
</script>

<!-- The wrapper owns hover: disabled inputs do not reliably expose native tooltips. -->
<span
	class="inline-flex shrink-0 align-middle"
	title={`${stateLabel}. ${explanation ? `${explanation} ` : ''}Open the label to edit.`}
>
	<input
		class="theme-input theme-checkbox-readonly pointer-events-none h-4 w-4 shrink-0 rounded border"
		type="checkbox"
		checked={value === true}
		aria-label={stateLabel}
		aria-describedby={explanation ? explanationId : undefined}
		disabled
	/>
	{#if explanation}<span id={explanationId} class="sr-only">{explanation}</span>{/if}
</span>
