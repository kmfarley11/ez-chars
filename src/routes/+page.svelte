<script>
	import { base } from '$app/paths';
	import { charsArray } from '../data.js';

	import Table from '$lib/Table.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import DropDownMenu from '$lib/DropDownMenu.svelte';
	import Heading from '$lib/Heading.svelte';

	let redVariant = 'redTable';

	/** @param {import('../data.js').CharData} char */
	const handleCharSelect = (char) => {
		location.href = `${base}/charsheets/5e?id=${char.id}`;
	};
</script>

<Heading variant="xl">Welcome to ez-chars!</Heading>

<p class="mb-6 text-lg font-normal text-gray-500 sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400">
	Visit <a href="https://github.com/kmfarley11/ez-chars" target="_blank"
		>github.com/kmfarley11/ez-chars</a
	> to see the source code
</p>

<div>
	<div style="align-items: center;">
		<DropDownMenu text="System Selection!" useChevrons={true}>
			<MenuItemButton
				onclick={() => {
					location.href = `${base}/charsheets/5e`;
				}}>2014 5e Character (sidekick)</MenuItemButton
			>
			<MenuItemButton onclick={() => alert('todo')}>2014 5e Character</MenuItemButton>
		</DropDownMenu>
	</div>

	<!-- TODO use TS or lean into jsdoc... -->
	<Table
		tableData={$charsArray}
		variant={redVariant}
		onSelect={handleCharSelect}
	/>
</div>
