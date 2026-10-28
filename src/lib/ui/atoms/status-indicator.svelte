<script lang="ts">
	let { mark, label }: { mark: string; label: string } = $props();
</script>

<!-- A readable status, not a checkbox or a cycling control. Meaning comes from the caller. -->
<span
	role="img"
	aria-label={label}
	title={label}
	class="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm border border-[var(--color-surface-border)] px-0.5 text-xs leading-none font-semibold"
	>{mark}</span
>
