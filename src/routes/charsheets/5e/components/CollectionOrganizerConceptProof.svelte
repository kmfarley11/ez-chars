<script lang="ts">
	import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
	import BaseButton from '$components/BaseButton.svelte';
	import { cloneFeatureDraft, type ProofFeatureRecord } from './unifiedDetailProofState';

	const initialFeatures: Array<ProofFeatureRecord> = [
		...(saturatedCharacter5e2014.features ?? []).map((feature) => ({
			id: feature.id,
			name: feature.name,
			detail: feature.summary ?? feature.description ?? '',
			owner: 'General' as const,
			annotations: []
		})),
		...(saturatedCharacter5e2014.systemData.classes[0]?.features ?? []).map((feature, index) => ({
			id: feature.featureId,
			name: feature.name ?? `Class feature ${index + 1}`,
			detail: `Wizard feature detail ${index + 1}.`,
			owner: 'Wizard' as const,
			annotations: []
		}))
	];

	let features = $state(initialFeatures.map(cloneFeatureDraft));
	let newFeatureName = $state('');
	let status = $state('');

	const addFeature = () => {
		const name = newFeatureName.trim();
		if (!name) return;
		features = [
			...features,
			{
				id: `organizer-concept-${features.length + 1}`,
				name,
				detail: '',
				owner: 'General',
				annotations: []
			}
		];
		newFeatureName = '';
		status = '';
	};

	const moveFeature = (index: number, offset: -1 | 1) => {
		const target = index + offset;
		if (target < 0 || target >= features.length) return;
		const next = [...features];
		[next[index], next[target]] = [next[target], next[index]];
		features = next;
		status = '';
	};

	const removeFeature = (id: string) => {
		features = features.filter((feature) => feature.id !== id);
		status = '';
	};

	const saveConcept = () => {
		status = `Concept saved locally with ${features.length} features.`;
	};

	const resetConcept = () => {
		features = initialFeatures.map(cloneFeatureDraft);
		newFeatureName = '';
		status = 'Concept reset.';
	};
</script>

<div class="mx-auto max-w-3xl space-y-4 p-4">
	<header class="space-y-2">
		<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">
			Deferred Storybook concept · not proposed rollout UI
		</p>
		<h1 class="text-2xl font-bold">Organize Features</h1>
		<p class="theme-text-muted text-sm">
			This preserves the successful batch add, remove, and reorder experiment for a later
			evidence-triggered decision. BL-077 keeps Pin/Unpin for priority and does not scale this
			organizer across collections.
		</p>
	</header>

	<section class="theme-panel space-y-4 rounded-xl border p-4" aria-labelledby="organizer-heading">
		<div>
			<h2 id="organizer-heading" class="text-lg font-semibold">Deferred collection organizer</h2>
			<p class="theme-text-muted text-sm">
				Rich detail and annotations remain intentionally absent from this structural concept.
			</p>
		</div>

		<div class="flex flex-wrap gap-2">
			<input
				class="theme-input touch-target min-w-48 flex-1 rounded-md border p-2 text-base md:text-sm"
				placeholder="New feature name"
				aria-label="New feature name"
				bind:value={newFeatureName}
			/>
			<BaseButton size="sm" onclick={addFeature}>Add</BaseButton>
		</div>

		<ul class="space-y-2">
			{#each features as feature, index (feature.id)}
				<li class="theme-panel flex items-center gap-2 rounded-md border p-2">
					<div class="min-w-0 flex-1">
						<p class="truncate font-semibold">{feature.name}</p>
						<p class="theme-text-muted text-xs">{feature.owner} · {feature.id}</p>
					</div>
					<BaseButton
						size="sm"
						iconOnly
						ariaLabel={`Move ${feature.name} up`}
						disabled={index === 0}
						onclick={() => moveFeature(index, -1)}>↑</BaseButton
					>
					<BaseButton
						size="sm"
						iconOnly
						ariaLabel={`Move ${feature.name} down`}
						disabled={index === features.length - 1}
						onclick={() => moveFeature(index, 1)}>↓</BaseButton
					>
					<BaseButton
						size="sm"
						ariaLabel={`Remove ${feature.name}`}
						onclick={() => removeFeature(feature.id)}>Remove</BaseButton
					>
				</li>
			{/each}
		</ul>

		<div class="flex flex-wrap justify-end gap-2 border-t pt-3">
			<BaseButton size="sm" onclick={resetConcept}>Reset concept</BaseButton>
			<BaseButton size="sm" onclick={saveConcept}>Save concept</BaseButton>
		</div>
		{#if status}<p class="theme-text-muted text-sm" role="status">{status}</p>{/if}
	</section>
</div>
