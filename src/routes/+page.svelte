<script>
	import { resolve } from '$app/paths';
	import { charsArray } from '../data.js';

	import Table from '$lib/Table.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import MenuButton from '$lib/MenuButton.svelte';

	/** @param {`/${string}`} pathSuffix */
	const toBaseHref = (pathSuffix) => {
		const root = resolve('/');
		return root === '/' ? pathSuffix : `${root}${pathSuffix}`;
	};
	const official2014SheetHref =
		'https://media.wizards.com/2016/dnd/downloads/5E_CharacterSheet_Fillable.pdf';
	const full2014SrdHref = toBaseHref('/docs/ext/5e2014/SRD5.1_-_Bookmarked_Full_-_v2.pdf');
	const charsheetHref = resolve('/charsheets/5e');

	/** @param {import('../data.js').CharData} char */
	const handleCharSelect = (char) => {
		location.href = `${charsheetHref}?id=${char.id}`;
	};
</script>

<div class="px-4 py-4 sm:px-6">
	<h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">
		Welcome to ez-chars!
	</h1>

	<div class="space-y-4 pb-4">
		<div class="pl-0">
			<p class="theme-text-muted text-base">
				Need the official 2014 D&D 5e form-fillable sheet? Grab it&nbsp;
				<a
					class="theme-link underline"
					href={official2014SheetHref}
					target="_blank"
					rel="noreferrer"
					>here</a
				>.
			</p>
			<p class="theme-text-muted text-base">
				Want the full 2014 5e SRD PDF with bookmarks? View it&nbsp;
				<a
					class="theme-link underline"
					href={full2014SrdHref}
					target="_blank"
					rel="noreferrer"
					>here</a
				>.
			</p>
		</div>
		<div class="-ml-1">
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
	</div>

	<Table
		tableData={$charsArray}
		onSelect={handleCharSelect}
	/>
</div>
