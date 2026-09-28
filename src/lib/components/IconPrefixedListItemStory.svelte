<script lang="ts">
	import IconPrefixedListItem from './IconPrefixedListItem.svelte';

	interface Props {
		icon: 'pin' | 'bullet';
		title?: string;
		paragraphClasses?: string;
		iconAlign?: 'first-line' | 'center';
	}
	let { icon, title, paragraphClasses, iconAlign = 'first-line' }: Props = $props();
</script>

<ul class="list-none space-y-1 w-64 border p-4 bg-white">
	<IconPrefixedListItem {icon} {title} {paragraphClasses} {iconAlign}>
		<span>This is a short line.</span>
	</IconPrefixedListItem>
	<IconPrefixedListItem {icon} {title} {paragraphClasses} {iconAlign}>
		<span
			>This is a much longer line of text that will wrap onto multiple lines. Compare first-line
			alignment for prose with centered alignment for compact rows containing taller controls.</span
		>
	</IconPrefixedListItem>
</ul>
