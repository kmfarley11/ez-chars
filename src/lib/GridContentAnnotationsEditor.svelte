<script lang="ts">
	import { toReferenceHref } from '$lib/characterGridHelpers';
	import { tick } from 'svelte';
	import type {
		GridAnnotationReferenceTemplate,
		GridContentAnnotation,
		GridContentReference
	} from '$lib/gridContentTypes';
	import { createId } from '../schema/helpers';

	// `onChange` receives a full replacement annotation array (immutable update contract).
	interface Props {
		annotations: Array<GridContentAnnotation>;
		referenceTemplates?: Array<GridAnnotationReferenceTemplate>;
		defaultKind?: GridContentAnnotation['kind'];
		defaultOrigin?: GridContentAnnotation['origin'];
		// eslint-disable-next-line no-unused-vars
		onChange: (_next: Array<GridContentAnnotation>) => void;
	}

	let {
		annotations,
		referenceTemplates = [],
		defaultKind = 'note',
		defaultOrigin = 'user',
		onChange
	}: Props = $props();

	const toAnnotationEditorDomId = (annotationId: string): string =>
		`annotation-editor-${annotationId}`;

	const focusNewAnnotationEditor = async (annotationId: string) => {
		await tick();
		const root = document.getElementById(toAnnotationEditorDomId(annotationId));
		if (!(root instanceof HTMLDetailsElement)) return;
		root.open = true;
		root.scrollIntoView({ behavior: 'smooth', block: 'start' });
		const nameInput = root.querySelector('input[data-annotation-name-input]');
		if (!(nameInput instanceof HTMLInputElement)) return;
		nameInput.focus();
		nameInput.select();
	};

	const updateAnnotationAtIndex = (
		annotationIdx: number,
		// eslint-disable-next-line no-unused-vars
		updater: (_annotation: GridContentAnnotation) => GridContentAnnotation
	) =>
		onChange(
			annotations.map((entry, entryIdx) => (entryIdx === annotationIdx ? updater(entry) : entry))
		);

	const addAnnotation = async () => {
		const newAnnotationId = createId();
		onChange([
			...annotations,
			{
				id: newAnnotationId,
				origin: defaultOrigin,
				kind: defaultKind,
				text: ''
			}
		]);
		await focusNewAnnotationEditor(newAnnotationId);
	};

	const removeAnnotationAtIndex = (annotationIdx: number) =>
		onChange(annotations.filter((_, entryIdx) => entryIdx !== annotationIdx));

	const NO_REFERENCE_TEMPLATE_KEY = '__none__';

	const applyReferenceTemplateAtIndex = (
		annotationIdx: number,
		referenceTemplate: GridContentReference | undefined
	) =>
		updateAnnotationAtIndex(annotationIdx, (entry) => {
			if (!referenceTemplate) {
				const rest = { ...entry };
				delete rest.ref;
				return rest;
			}
			return {
				...entry,
				ref: {
					...referenceTemplate,
					locator: {
						...referenceTemplate.locator
					}
				}
			};
		});

	const matchesTemplateReference = (
		reference: GridContentReference,
		template: GridAnnotationReferenceTemplate
	): boolean =>
		reference.kind === template.reference.kind &&
		reference.sourceId === template.reference.sourceId &&
		reference.locator.url === template.reference.locator.url;

	const getReferenceTemplateForAnnotation = (
		annotation: GridContentAnnotation
	): GridAnnotationReferenceTemplate | undefined => {
		const reference = annotation.ref;
		if (!reference) return undefined;
		return referenceTemplates.find((template) => matchesTemplateReference(reference, template));
	};

	const getReferenceTemplateKey = (annotation: GridContentAnnotation): string => {
		const matchedTemplate = getReferenceTemplateForAnnotation(annotation);
		return matchedTemplate?.key ?? NO_REFERENCE_TEMPLATE_KEY;
	};

	const getTemplatePreviewHref = (
		annotation: GridContentAnnotation,
		template: GridAnnotationReferenceTemplate
	): string | undefined => {
		if (getReferenceTemplateKey(annotation) === template.key && annotation.ref) {
			return toReferenceHref(annotation.ref) ?? toReferenceHref(template.reference);
		}
		return toReferenceHref(template.reference);
	};

	const updatePdfPageAtIndex = (annotationIdx: number, nextPageValue: string) =>
		updateAnnotationAtIndex(annotationIdx, (entry) => {
			if (!entry.ref || entry.ref.kind !== 'pdf') return entry;
			const trimmed = nextPageValue.trim();
			const parsed = Number(trimmed);
			const nextPage =
				trimmed.length === 0 || !Number.isInteger(parsed) ? undefined : Math.max(1, parsed);
			if (nextPage === undefined) {
				const restLocator = { ...entry.ref.locator };
				delete restLocator.page;
				return {
					...entry,
					ref: {
						...entry.ref,
						locator: restLocator
					}
				};
			}
			return {
				...entry,
				ref: {
					...entry.ref,
					locator: {
						...entry.ref.locator,
						page: nextPage
					}
				}
			};
		});

	const updateUrlAnchorAtIndex = (annotationIdx: number, nextAnchorValue: string) =>
		updateAnnotationAtIndex(annotationIdx, (entry) => {
			if (!entry.ref || entry.ref.kind !== 'url') return entry;
			const trimmed = nextAnchorValue.trim();
			if (trimmed.length === 0) {
				const restLocator = { ...entry.ref.locator };
				delete restLocator.anchor;
				return {
					...entry,
					ref: {
						...entry.ref,
						locator: restLocator
					}
				};
			}
			return {
				...entry,
				ref: {
					...entry.ref,
					locator: {
						...entry.ref.locator,
						anchor: trimmed
					}
				}
			};
		});
</script>

<details class="space-y-2 rounded-md border px-2 py-2">
	<summary class="theme-text-muted cursor-pointer text-xs font-semibold">
		Annotations ({annotations.length})
	</summary>
	<div class="mt-2 space-y-2">
		<div class="flex items-center justify-end">
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs"
				onclick={addAnnotation}
			>
				Add
			</button>
		</div>

		{#if annotations.length === 0}
			<p class="theme-text-muted text-xs italic">No annotations.</p>
		{:else}
			{#each annotations as annotation, annotationIdx (`annotation-${annotation.id ?? annotationIdx}`)}
				{@const selectedReferenceTemplateKey = getReferenceTemplateKey(annotation)}
				<details
					id={annotation.id ? toAnnotationEditorDomId(annotation.id) : undefined}
					class="space-y-2 rounded-md border px-2 py-2"
				>
					<summary class="theme-text-muted cursor-pointer text-xs">
						{annotation.name ?? `Annotation ${annotationIdx + 1}`}
					</summary>
					<div class="mt-2 space-y-2">
						<label class="space-y-1">
							<span class="theme-text-muted text-xs">Name (optional)</span>
							<input
								class="theme-input w-full rounded-md border px-2 py-1"
								type="text"
								data-annotation-name-input
								value={annotation.name ?? ''}
								oninput={(event) => {
									const target = event.currentTarget as HTMLInputElement;
									updateAnnotationAtIndex(annotationIdx, (entry) => ({
										...entry,
										name: target.value.trim().length > 0 ? target.value : undefined
									}));
								}}
							/>
						</label>

						<label class="space-y-1">
							<span class="theme-text-muted text-xs">Text (optional)</span>
							<textarea
								class="theme-input w-full rounded-md border px-2 py-1"
								rows="3"
								oninput={(event) => {
									const target = event.currentTarget as HTMLTextAreaElement;
									updateAnnotationAtIndex(annotationIdx, (entry) => ({
										...entry,
										text: target.value.trim().length > 0 ? target.value : undefined
									}));
								}}>{annotation.text ?? ''}</textarea
							>
						</label>

						<div class="space-y-2">
							<p class="theme-text-muted text-xs">Reference (optional)</p>
							<div class="mt-2 space-y-1">
								<div class="flex items-center justify-between gap-2 text-xs">
									<label class="flex items-center gap-2">
										<input
											type="radio"
											name={`annotation-ref-template-${annotation.id ?? annotationIdx}`}
											checked={selectedReferenceTemplateKey === NO_REFERENCE_TEMPLATE_KEY}
											onchange={() => {
												applyReferenceTemplateAtIndex(annotationIdx, undefined);
											}}
										/>
										<span class="theme-text-muted">None</span>
									</label>
								</div>
								{#each referenceTemplates as template (template.key)}
									{@const templatePreviewHref = getTemplatePreviewHref(annotation, template)}
									<div class="flex items-center justify-between gap-2 text-xs">
										<label class="flex items-center gap-2">
											<input
												type="radio"
												name={`annotation-ref-template-${annotation.id ?? annotationIdx}`}
												checked={selectedReferenceTemplateKey === template.key}
												onchange={() => {
													applyReferenceTemplateAtIndex(annotationIdx, template.reference);
												}}
											/>
											<span class="theme-text-muted">{template.label}</span>
										</label>
										{#if templatePreviewHref}
											<a
												class="theme-link underline"
												href={templatePreviewHref}
												target="_blank"
												rel="external noopener noreferrer">(view here)</a
											>
										{/if}
									</div>
								{/each}
							</div>
							{#if annotation.ref?.kind === 'pdf'}
								<label class="mt-2 block space-y-1">
									<span class="theme-text-muted text-xs">Page (optional)</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="number"
										step="1"
										min="1"
										value={annotation.ref?.locator.page ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											updatePdfPageAtIndex(annotationIdx, target.value);
										}}
									/>
								</label>
							{/if}
							{#if annotation.ref?.kind === 'url'}
								<label class="mt-2 block space-y-1">
									<span class="theme-text-muted text-xs">Anchor (optional)</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="text"
										value={annotation.ref?.locator.anchor ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											updateUrlAnchorAtIndex(annotationIdx, target.value);
										}}
									/>
								</label>
							{/if}
						</div>

						<div class="flex justify-end">
							<button
								type="button"
								class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs"
								onclick={() => {
									removeAnnotationAtIndex(annotationIdx);
								}}
							>
								Remove
							</button>
						</div>
					</div>
				</details>
			{/each}
		{/if}
	</div>
</details>
