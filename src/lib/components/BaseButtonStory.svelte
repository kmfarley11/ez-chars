<script lang="ts">
	import BaseButton from '$components/BaseButton.svelte';
	import type { ButtonShadingVariant, ButtonSize } from '$utils/buttonTypes';

	interface Props {
		label?: string;
		shadingVariant?: ButtonShadingVariant;
		size?: ButtonSize;
		iconOnly?: boolean;
		ariaLabel?: string;
		disabled?: boolean;
	}

	let {
		label = 'Button label',
		shadingVariant = 'light',
		size = 'md',
		iconOnly = false,
		ariaLabel = undefined,
		disabled = false
	}: Props = $props();
</script>

<BaseButton {shadingVariant} {size} {iconOnly} {ariaLabel} {disabled}>
	{#if iconOnly}
		<span aria-hidden="true">✦</span>
	{:else}
		{label}
	{/if}
</BaseButton>
