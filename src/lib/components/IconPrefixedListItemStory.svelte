<script lang="ts">
	import IconPrefixedListItem from './IconPrefixedListItem.svelte';

	interface Props {
		icon: 'pin' | 'bullet';
		title?: string;
		paragraphClasses?: string;
	}
	let { icon, title, paragraphClasses }: Props = $props();
</script>

<ul class="list-none space-y-1 w-64 border p-4 bg-white">
	<IconPrefixedListItem {icon} {title} {paragraphClasses}>
		<span>This is a short line.</span>
	</IconPrefixedListItem>
	<IconPrefixedListItem {icon} {title} {paragraphClasses}>
		<span
			>This is a much longer line of text that will wrap onto multiple lines. The icon should stay
			perfectly centered vertically with the very first line of this paragraph, rather than floating
			down to the middle of the whole block.</span
		>
	</IconPrefixedListItem>
</ul>
