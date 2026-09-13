<script lang="ts">
	/* eslint-disable no-unused-vars */
	import type { Snippet } from 'svelte';

	type MenuItemVariant = 'dark' | 'light';

	interface Props {
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		shadingVariant?: MenuItemVariant;
	}

	let { children = undefined, onclick = undefined, shadingVariant = 'light' }: Props = $props();

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');

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
	<button
		type="button"
		class="touch-target btn {colors} block w-full rounded-md border px-2 py-2 text-left"
		onclick={handleClick}
	>
		{@render children?.()}
	</button>
</li>
