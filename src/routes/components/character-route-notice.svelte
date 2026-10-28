<script lang="ts">
	import { resolve } from '$app/paths';
	import { characterSheetPath } from '$lib/characters/character-dispatch';
	import type { CharacterWithSystemData } from '../../schema';
	import { formatSystemLabel } from '../characterSummary';
	let { requestedId, character }: { requestedId: string; character?: CharacterWithSystemData } =
		$props();
</script>

<div class="px-4 py-4 sm:px-6">
	<div class="theme-grid-layer mx-auto max-w-3xl space-y-4 rounded-lg border p-6" role="alert">
		<h1 class="text-2xl leading-none font-bold tracking-tight">
			{character
				? 'Different character system.'
				: requestedId
					? 'Character not found.'
					: 'No character selected.'}
		</h1>
		<p class="theme-text-muted">
			{#if character}
				This character uses {formatSystemLabel(character.system.id)}. Open its matching sheet to
				edit it safely.
			{:else if requestedId}
				No local character matches the id "{requestedId}". Open a character from the home view or
				create a new one there.
			{:else}
				This route needs a character id in the URL. Open a character from the home view or create
				one there.
			{/if}
		</p>
		<div class="flex flex-wrap gap-2">
			<a class="theme-btn-light touch-target btn rounded-md border px-3 py-1" href={resolve('/')}
				>Back to Characters</a
			>
			{#if character}
				<a
					class="theme-btn-light touch-target btn rounded-md border px-3 py-1"
					href={resolve(
						`${characterSheetPath(character)}?id=${encodeURIComponent(character.meta.id)}`
					)}>Open matching sheet</a
				>
			{/if}
		</div>
	</div>
</div>
