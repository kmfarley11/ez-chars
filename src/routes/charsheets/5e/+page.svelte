<script lang="ts">
	import '../../../app.css';
	import { charsArray } from '$storage/store.js';
	import { is5e2014Character, type CharacterDocument5e2014 } from '../../../schema';
	import { findCharacterById } from '$lib/characters/character-dispatch';
	import CharacterRouteNotice from '../../components/character-route-notice.svelte';
	import CharacterSheet from '$lib/systems/dnd5e-2014/pages/character-sheet.svelte';
	import { createAppSheetNavigationHost } from '../../sheet-navigation-host';

	const { data }: { data: { id: string | null } } = $props();
	const requestedCharacterId = $derived(data.id?.trim() ?? '');
	const selected = $derived(findCharacterById($charsArray, requestedCharacterId));
	const char = $derived(selected && is5e2014Character(selected) ? selected : undefined);
	const owner = {
		read: () => {
			if (!char) throw new Error('The 2014 sheet requires a matching character.');
			return char;
		},
		write: (next: CharacterDocument5e2014) => {
			charsArray.update((entries) =>
				entries.map((entry) =>
					entry.meta.id === requestedCharacterId && entry.system.id === 'dnd5e-2014' ? next : entry
				)
			);
		}
	};
	const navigation = createAppSheetNavigationHost();
</script>

{#if !char}
	<CharacterRouteNotice requestedId={requestedCharacterId} character={selected} />
{:else}
	{#key char.meta.id}<CharacterSheet {owner} {navigation} />{/key}
{/if}
