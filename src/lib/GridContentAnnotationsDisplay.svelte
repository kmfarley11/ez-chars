<script lang="ts">
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import type { GridContentAnnotation, GridContentReference } from '$lib/gridContentTypes';

	interface Props {
		annotations: Array<GridContentAnnotation>;
	}

	let { annotations }: Props = $props();

	const toAnnotationHeading = (
		annotation: GridContentAnnotation,
		annotationIdx: number
	): string => {
		const nameValue = displayOrPlaceholder(annotation.name, '').trim();
		if (nameValue.length > 0) return nameValue;

		const idValue = displayOrPlaceholder(annotation.id, '').trim();
		if (idValue.length > 0) return idValue;

		return `Annotation ${annotationIdx + 1}`;
	};

	const formatReference = (reference: GridContentReference): string => {
		const locatorParts: Array<string> = [];
		if (typeof reference.locator.page === 'number') {
			locatorParts.push(`page ${reference.locator.page}`);
		}
		if (reference.locator.url) {
			locatorParts.push(reference.locator.url);
		}
		if (reference.locator.id) {
			locatorParts.push(`id ${reference.locator.id}`);
		}
		if (reference.locator.anchor) {
			locatorParts.push(`anchor ${reference.locator.anchor}`);
		}
		if (reference.locator.label) {
			locatorParts.push(`label ${reference.locator.label}`);
		}

		const refBase = `${reference.sourceId} (${reference.kind})`;
		return locatorParts.length > 0 ? `${refBase} - ${locatorParts.join(', ')}` : refBase;
	};
</script>

{#if annotations.length === 0}
	<p class="theme-text-muted text-xs italic">No annotations.</p>
{:else}
	<ul class="space-y-1">
		{#each annotations as annotation, annotationIdx (`annotation-display-${annotation.id ?? annotationIdx}`)}
			<li class="text-sm">
				<span class="font-semibold">{toAnnotationHeading(annotation, annotationIdx)}:</span>
				<span> {displayOrPlaceholder(annotation.text, '___')}</span>
				{#if annotation.ref}
					<p class="theme-text-muted text-xs italic">{formatReference(annotation.ref)}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
