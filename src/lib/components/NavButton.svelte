<script>
	import { resolve } from '$app/paths';
	let {
		href,
		text,
		title,
		ariaLabel,
		shadingVariant = 'light',
		target = null,
		children
	} = $props();

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
</script>

<div class="p-1">
	{#if href && !href.startsWith('/')}
		<a
			{href}
			class="btn inline-flex h-10 w-10 items-center justify-center rounded-md border p-1 leading-none {colors}"
			aria-label={ariaLabel ?? title ?? text ?? href}
			title={title ?? text ?? href ?? 'Click to go to the home page of the app.'}
			rel="external noreferrer"
			{target}
		>
			{#if text === undefined && children === undefined}
				{`Go to ${href}...`}
			{:else}
				{text}
				{@render children?.()}
			{/if}
		</a>
	{:else}
		<a
			href={resolve(href ?? '/')}
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
	{/if}
</div>
