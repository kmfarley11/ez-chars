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

	const toReferenceHref = (reference: GridContentReference): string | undefined => {
		if (reference.kind !== 'url') return undefined;
		const urlValue = reference.locator.url?.trim();
		if (!urlValue) return undefined;
		if (typeof reference.locator.page !== 'number' || !Number.isFinite(reference.locator.page)) {
			return urlValue;
		}

		const page = Math.trunc(reference.locator.page);
		return `${urlValue.split('#', 1)[0]}#page=${page}`;
	};

	const formatReference = (reference: GridContentReference): string => {
		const locatorParts: Array<string> = [];
		const referenceHref = toReferenceHref(reference);
		const hasClickableUrl = reference.kind === 'url' && referenceHref !== undefined;
		if (typeof reference.locator.page === 'number' && !hasClickableUrl) {
			locatorParts.push(`page ${reference.locator.page}`);
		}
		if (referenceHref) {
			locatorParts.push(referenceHref);
		} else if (reference.locator.url) {
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
					{@const referenceHref = toReferenceHref(annotation.ref)}
					<p class="theme-text-muted text-xs italic">
						{#if referenceHref}
							<a
								class="theme-link underline"
								href={referenceHref}
								target="_blank"
								rel="external noopener noreferrer">{formatReference(annotation.ref)}</a
							>
						{:else}
							{formatReference(annotation.ref)}
						{/if}
					</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
