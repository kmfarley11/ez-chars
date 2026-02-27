<script>
	import { base } from '$app/paths'
	let { href, text, title, variant = "light", target = null, children } = $props();

	// if href defined, and is a local url, prepend with base. else use as-is, else redefine to base
	let siteHref = $derived(href ? (href.startsWith('/') ? `${base}${href}` : href) : base);
	let colors = $derived(variant === 'dark'
		? 'bg-slate-700 hover:bg-slate-900 text-white'
		: 'bg-white hover:bg-slate-100 text-black');
</script>

<div class="p-2">
	<a
		href={siteHref}
		class="btn flex-0.5 rounded-md border p-2 {colors}"
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
