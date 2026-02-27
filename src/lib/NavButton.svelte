<script>
	import { resolve } from '$app/paths'
	let { href, text, title, ariaLabel, variant = "light", target = null, children } = $props();

	// if href defined, and is a local url, prepend with base. else use as-is, else redefine to base
	let siteHref = $derived(href ? (href.startsWith('/') ? resolve(href) : href) : resolve('/'));
	let colors = $derived(variant === 'dark'
		? 'bg-slate-700 hover:bg-slate-900 text-white'
		: 'bg-white hover:bg-slate-100 text-black');
</script>

<div class="p-1">
	<a
		href={siteHref}
		class="btn inline-flex h-10 w-10 items-center justify-center rounded-md border p-1 leading-none {colors}"
		aria-label={ariaLabel ?? title ?? text ?? href}
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
