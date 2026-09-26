<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconPin from './IconPin.svelte';
	import IconBullet from './IconBullet.svelte';

	interface Props {
		icon: 'pin' | 'bullet';
		element?: 'li' | 'div';
		title?: string;
		paragraphClasses?: string;
		children: Snippet;
	}

	let {
		icon,
		element = 'li',
		title = undefined,
		paragraphClasses = '',
		children
	}: Props = $props();
</script>

<svelte:element this={element} class="max-w-full min-w-0 relative pl-5">
	<span
		class="absolute left-0 top-0 flex h-5 w-4 items-center justify-start select-none text-[1em]"
		aria-hidden="true"
		{title}
	>
		{#if icon === 'pin'}
			<IconPin classes="h-[1em] w-[1em] stroke-current" />
		{:else}
			<IconBullet classes="h-[1em] w-[1em] fill-current" />
		{/if}
	</span>
	<p class="max-w-full min-w-0 text-sm {paragraphClasses}">
		{#if icon === 'pin'}
			<span class="sr-only">Pinned</span>
		{/if}
		{@render children()}
	</p>
</svelte:element>
