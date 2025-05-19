<script>
	let { href, text, title, variant = "light", target, children } = $props();

	let bgColor = $state("bg-white")
	let hoverBgColor = $state("hover:bg-slate-100")

	if (variant === "dark") {
		bgColor = "bg-slate-700"
		hoverBgColor = "hover:bg-slate-900"
	}
</script>

<div class="p-2">
	<a
		href={href ?? '/'}
		class="btn flex-0.5 rounded-md border p-2 {bgColor} {hoverBgColor}"
		title={title ?? text ?? href ?? 'Click to go to the home page of the app.'}
		{target}
	>
		{#if text === undefined && children === undefined}
			{`Go to ${href ?? 'Home'}...`}
		{:else}
			{text}
			{@render children?.()}
		{/if}
	</a>
</div>
