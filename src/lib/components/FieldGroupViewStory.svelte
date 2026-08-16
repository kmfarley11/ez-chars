<script lang="ts">
	import FieldGroupView from './FieldGroupView.svelte';
	import type { GridContentData } from '$utils/gridContentTypes';

	let { displayMaxCols = 3, mode = 'mixed' } = $props<{
		displayMaxCols?: number;
		mode?: 'mixed' | 'readonly' | 'editable' | 'annotated' | 'multiline' | 'empty' | 'quiet';
	}>();

	let mockData: GridContentData = $derived(
		(mode === 'empty'
			? {}
			: mode === 'readonly'
				? {
						class: { fieldName: 'Class', value: 'Fighter' },
						level: { fieldName: 'Level', value: 3 }
					}
				: mode === 'editable'
					? {
							hp: {
								fieldName: 'HP',
								value: 24,
								bindPath: ['hp'],
								capabilities: { canEditValue: true },
								interaction: { editAffordance: 'persistent' }
							},
							ac: {
								fieldName: 'AC',
								value: 16,
								bindPath: ['ac'],
								capabilities: { canEditValue: true },
								interaction: { editAffordance: 'persistent' }
							}
						}
					: mode === 'annotated'
						? {
								armorClass: {
									fieldName: 'Armor Class',
									value: 16,
									annotationBindPath: ['annotations', 'armorClass'],
									annotations: [
										{
											id: 'armor-note',
											origin: 'user',
											kind: 'note',
											text: 'Includes shield.'
										}
									]
								}
							}
						: mode === 'multiline'
							? {
									languages: {
										fieldName: 'Languages',
										value: [
											{ fieldName: 'Language', value: 'Common' },
											{ fieldName: 'Language', value: 'Dwarvish' }
										]
									},
									biography: {
										fieldName: 'Biography',
										value: 'A defender of the mountain.',
										multiline: true
									}
								}
							: mode === 'quiet'
								? {
										nickname: {
											fieldName: 'Nickname',
											value: 'Oakenshield',
											bindPath: ['nickname'],
											capabilities: { canEditValue: true },
											interaction: { editAffordance: 'hover' }
										}
									}
								: {
										hp: {
											fieldName: 'HP',
											value: 24,
											bindPath: ['hp'],
											capabilities: { canEditValue: true },
											interaction: { editAffordance: 'persistent' }
										},
										class: { fieldName: 'Class', value: 'Fighter' },
										level: { fieldName: 'Level', value: 3 },
										speed: { fieldName: 'Speed', value: 30, label: 'ft.' }
									}) as GridContentData
	);
</script>

<div class="p-8 max-w-2xl bg-white border rounded">
	{#if Object.keys(mockData).length === 0}
		<p class="theme-text-muted text-sm italic">No projected fields.</p>
	{:else}
		<FieldGroupView data={mockData} {displayMaxCols} displayArrayMode="stack" />
	{/if}
</div>
