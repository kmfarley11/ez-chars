<script>
	import { resolve } from '$app/paths';
	import { charsArray } from '../data.js';

	import Table from '$lib/Table.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import DropDownMenu from '$lib/DropDownMenu.svelte';
	import Heading from '$lib/Heading.svelte';

	let redVariant = 'redTable';
	/** @param {`/${string}`} pathSuffix */
	const toBaseHref = (pathSuffix) => {
		const root = resolve('/');
		return root === '/' ? pathSuffix : `${root}${pathSuffix}`;
	};
	const official2014SheetHref = toBaseHref(
		'/docs/ext/5e2014/official_2014_DnD_5E_CharacterSheet_FormFillable.pdf'
	);
	const full2014SrdHref = toBaseHref('/docs/ext/5e2014/SRD5.1_-_Bookmarked_Full_-_v2.pdf');
	const charsheetHref = resolve('/charsheets/5e');

	/** @param {import('../data.js').CharData} char */
	const handleCharSelect = (char) => {
		location.href = `${charsheetHref}?id=${char.id}`;
	};
</script>

<Heading variant="xl">Welcome to ez-chars!</Heading>

<p class="mb-6 text-lg font-normal text-gray-500 sm:px-16 lg:text-xl xl:px-48 dark:text-gray-400">
	Visit <a href="https://github.com/kmfarley11/ez-chars" target="_blank"
		>github.com/kmfarley11/ez-chars</a
	> to see the source code
</p>
<p class="mb-6 text-base text-gray-600 dark:text-gray-300">
	Need the official 2014 D&D 5e form-fillable sheet? Grab it&nbsp;
	<a
		class="underline hover:text-blue-600 dark:hover:text-blue-300"
		href={official2014SheetHref}
		target="_blank"
		rel="noreferrer"
		>here</a
	>.
</p>
<p class="mb-6 text-base text-gray-600 dark:text-gray-300">
	Want the full 2014 5e SRD PDF with bookmarks? Download it&nbsp;
	<a
		class="underline hover:text-blue-600 dark:hover:text-blue-300"
		href={full2014SrdHref}
		target="_blank"
		rel="noreferrer"
		>here</a
	>.
</p>

<div>
	<div style="align-items: center;">
		<DropDownMenu text="System Selection!" useChevrons={true}>
				<MenuItemButton
					onclick={() => {
						location.href = charsheetHref;
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
