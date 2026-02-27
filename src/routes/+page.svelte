<script>
	import { resolve } from '$app/paths';
	import { charsArray } from '../data.js';

	import Table from '$lib/Table.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import MenuButton from '$lib/MenuButton.svelte';
	import Heading from '$lib/Heading.svelte';

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

<p class="theme-text-muted mb-6 text-lg font-normal sm:px-16 lg:text-xl xl:px-48">
	Visit <a href="https://github.com/kmfarley11/ez-chars" target="_blank"
		>github.com/kmfarley11/ez-chars</a
	> to see the source code
</p>
<p class="theme-text-muted mb-6 text-base">
	Need the official 2014 D&D 5e form-fillable sheet? Grab it&nbsp;
	<a
		class="theme-link underline"
		href={official2014SheetHref}
		target="_blank"
		rel="noreferrer"
		>here</a
	>.
</p>
<p class="theme-text-muted mb-6 text-base">
	Want the full 2014 5e SRD PDF with bookmarks? Download it&nbsp;
	<a
		class="theme-link underline"
		href={full2014SrdHref}
		target="_blank"
		rel="noreferrer"
		>here</a
	>.
</p>

<div>
	<div style="align-items: center;">
		<MenuButton text="System Selection!" iconVariant="chevron" align="left">
				<MenuItemButton
					onclick={() => {
						location.href = charsheetHref;
					}}
					>2014 5e Character (sidekick)</MenuItemButton
				>
			<MenuItemButton onclick={() => alert('todo')}>2014 5e Character</MenuItemButton>
		</MenuButton>
	</div>

	<Table
		tableData={$charsArray}
		onSelect={handleCharSelect}
	/>
</div>
