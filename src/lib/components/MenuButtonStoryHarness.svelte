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
</script>

<div class="p-8 flex justify-end min-h-[200px]">
	<MenuButton {text} {ariaLabel} {buttonIconOnly} {buttonSize} {iconVariant}>
		<MenuItemButton>Edit Profile</MenuItemButton>
		<MenuItemButton>Settings</MenuItemButton>
		<MenuItemButton>Log Out</MenuItemButton>
	</MenuButton>
</div>
