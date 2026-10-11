<script lang="ts">
	/* eslint-disable no-unused-vars */
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type MenuItemVariant = 'dark' | 'light';

	interface Props {
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		shadingVariant?: MenuItemVariant;
		/** Complete URL supplied by the caller, including any app base or document fragment. */
		href?: string;
		target?: HTMLAnchorAttributes['target'];
		rel?: string;
	}

	let { children, onclick, shadingVariant = 'light', href, target, rel }: Props = $props();

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
	const itemClasses = $derived(
		`touch-target btn ${colors} block w-full rounded-md border px-2 py-2 text-left`
	);

	const handleClick = (event: MouseEvent) => {
		const popover =
			event.currentTarget instanceof Element ? event.currentTarget.closest('[popover]') : undefined;
		if (
			popover instanceof HTMLElement &&
			typeof popover.hidePopover === 'function' &&
			popover.matches(':popover-open')
		) {
			popover.hidePopover();
		}
		onclick?.(event);
	};
</script>

<li>
	{#if href}
		<!-- The caller supplies a resolved asset/external URL, not an app route ID. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a {href} {target} {rel} class={itemClasses} onclick={handleClick}>
			{@render children?.()}
		</a>
	{:else}
		<button type="button" class={itemClasses} onclick={handleClick}>
			{@render children?.()}
		</button>
	{/if}
</li>
