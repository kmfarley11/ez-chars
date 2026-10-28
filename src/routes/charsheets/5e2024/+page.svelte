<script lang="ts">
	import { charsArray } from '$storage/store';
	import { findCharacterById } from '$lib/characters/character-dispatch';
	import { is5e2024Character, type CharacterDocument5e2024 } from '../../../schema';
	import CharacterRouteNotice from '../../components/character-route-notice.svelte';
	import CharacterSheet from '$lib/systems/dnd5e-2024/pages/character-sheet.svelte';
	import { createAppSheetNavigationHost } from '../../sheet-navigation-host';
	const navigation = createAppSheetNavigationHost();
	let { data }: { data: { id: string | null } } = $props();
	const selected = $derived(findCharacterById($charsArray, data.id));
	const character = $derived(selected && is5e2024Character(selected) ? selected : undefined);
	const owner = {
		read: () => {
			if (!character) throw new Error('The 2024 sheet requires a matching character.');
			return character;
		},
		write: (next: CharacterDocument5e2024) =>
			charsArray.update((entries) =>
				entries.map((entry) =>
					entry.meta.id === data.id && is5e2024Character(entry) ? next : entry
				)
			)
	};
</script>

{#if character}
	{#key character.meta.id}<CharacterSheet {owner} {navigation} />{/key}
{:else}
	<CharacterRouteNotice requestedId={data.id ?? ''} character={selected} />
{/if}
