<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createScrollAffordanceAttachment } from '$components/scrollAffordance';

	interface Props {
		ariaLabel: string;
		children: Snippet;
		maxHeight?: string;
		viewportId?: string;
		classes?: string;
	}

	let {
		ariaLabel,
		children,
		maxHeight = '20rem',
		viewportId = undefined,
		classes = ''
	}: Props = $props();
	let canScrollUp = $state(false);
	let canScrollDown = $state(false);
	const trackScrollAffordance = createScrollAffordanceAttachment((state) => {
		canScrollUp = state.canScrollUp;
		canScrollDown = state.canScrollDown;
	});
</script>

<div class="relative rounded-md border p-1 shadow-inner {classes}">
	<!-- Keyboard users need to focus the bounded scroll owner. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="scroll-affordance-viewport overflow-x-hidden overflow-y-auto px-1 py-1"
		style:max-height={maxHeight}
		role="region"
		aria-label={ariaLabel}
		tabindex="0"
		data-scroll-viewport={viewportId}
		{@attach trackScrollAffordance}
	>
		{@render children()}
	</div>
	{#if canScrollUp}
		<div
			class="scroll-affordance-fade scroll-affordance-fade-top absolute inset-x-1 top-1 h-8"
			data-scroll-affordance="more-above"
			aria-hidden="true"
		></div>
	{/if}
	{#if canScrollDown}
		<div
			class="scroll-affordance-fade scroll-affordance-fade-bottom absolute inset-x-1 bottom-1 h-8"
			data-scroll-affordance="more-below"
			aria-hidden="true"
		></div>
	{/if}
</div>
