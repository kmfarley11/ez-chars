<script lang="ts">
	import MenuButton from './MenuButton.svelte';
	import MenuItemButton from './MenuItemButton.svelte';
	import type { ButtonIconVariant } from '$utils/buttonTypes';

	interface Props {
		text?: string;
		ariaLabel?: string;
		buttonIconOnly?: boolean;
		iconVariant?: ButtonIconVariant;
	}
	let {
		text = 'Menu',
		ariaLabel,
		buttonIconOnly = false,
		iconVariant = 'hamburger'
	}: Props = $props();
</script>

<div class="p-8 flex justify-end min-h-[200px]">
	<MenuButton {text} {ariaLabel} {buttonIconOnly} {iconVariant}>
		<MenuItemButton>Edit Profile</MenuItemButton>
		<MenuItemButton>Settings</MenuItemButton>
		<MenuItemButton>Log Out</MenuItemButton>
	</MenuButton>
</div>
