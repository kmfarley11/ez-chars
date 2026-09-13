<script lang="ts">
	import MenuButton from './MenuButton.svelte';
	import MenuItemButton from './MenuItemButton.svelte';
	import type { ButtonIconVariant, ButtonSize } from '$utils/buttonTypes';

	interface Props {
		text?: string;
		ariaLabel?: string;
		buttonIconOnly?: boolean;
		buttonSize?: ButtonSize;
		iconVariant?: ButtonIconVariant;
	}
	let {
		text = 'Menu',
		ariaLabel,
		buttonIconOnly = false,
		buttonSize = 'md',
		iconVariant = 'hamburger'
	}: Props = $props();

	let lastAction = $state<string>('');
</script>

<div class="p-8 flex flex-col items-end gap-4 min-h-[200px]">
	<MenuButton {text} {ariaLabel} {buttonIconOnly} {buttonSize} {iconVariant}>
		<MenuItemButton onclick={() => (lastAction = 'Edit Profile')}>Edit Profile</MenuItemButton>
		<MenuItemButton onclick={() => (lastAction = 'Settings')}>Settings</MenuItemButton>
		<MenuItemButton onclick={() => (lastAction = 'Log Out')}>Log Out</MenuItemButton>
	</MenuButton>
	{#if lastAction}
		<p class="text-sm theme-text-muted">Last action selected: {lastAction}</p>
	{/if}
</div>
