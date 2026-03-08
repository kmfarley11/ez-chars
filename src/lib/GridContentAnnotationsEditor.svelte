<script lang="ts">
	import { tick } from 'svelte';
	import {
		annotationKinds,
		annotationOrigins,
		parseAnnotationTags
	} from '$lib/characterGridHelpers';
	import type { GridContentAnnotation, GridContentReference } from '$lib/gridContentTypes';
	import {
		DND_BEYOND_BASIC_RULES_REF_5E_2014,
		SRD_REF_5E_2014
	} from '../schema/system.5e2014';
	import { createId } from '../schema/helpers';

	// `onChange` receives a full replacement annotation array (immutable update contract).
	interface Props {
		annotations: Array<GridContentAnnotation>;
		// eslint-disable-next-line no-unused-vars
		onChange: (_next: Array<GridContentAnnotation>) => void;
	}

	let { annotations, onChange }: Props = $props();

	const toAnnotationEditorDomId = (annotationId: string): string => `annotation-editor-${annotationId}`;

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
				origin: 'user',
				kind: 'note',
				text: ''
			}
		]);
		await focusNewAnnotationEditor(newAnnotationId);
	};

	const removeAnnotationAtIndex = (annotationIdx: number) =>
		onChange(annotations.filter((_, entryIdx) => entryIdx !== annotationIdx));

	const applyReferenceTemplateAtIndex = (
		annotationIdx: number,
		referenceTemplate: GridContentReference | undefined
	) =>
		updateAnnotationAtIndex(annotationIdx, (entry) => {
			if (!referenceTemplate) {
				const { ref: _ignored, ...rest } = entry;
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

	type ReferenceTemplateKey = 'none' | 'srd' | 'dndBeyond';

	type TemplateReferenceKey = Exclude<ReferenceTemplateKey, 'none'>;

	const getReferenceTemplateKey = (annotation: GridContentAnnotation): ReferenceTemplateKey => {
		if (!annotation.ref) return 'none';
		if (
			annotation.ref.kind === SRD_REF_5E_2014.kind &&
			annotation.ref.sourceId === SRD_REF_5E_2014.sourceId &&
			annotation.ref.locator.url === SRD_REF_5E_2014.locator.url
		) {
			return 'srd';
		}
		if (
			annotation.ref.kind === DND_BEYOND_BASIC_RULES_REF_5E_2014.kind &&
			annotation.ref.sourceId === DND_BEYOND_BASIC_RULES_REF_5E_2014.sourceId &&
			annotation.ref.locator.url === DND_BEYOND_BASIC_RULES_REF_5E_2014.locator.url
		) {
			return 'dndBeyond';
		}
		return 'none';
	};

	const getReferenceTemplateByKey = (key: TemplateReferenceKey): GridContentReference =>
		key === 'srd' ? SRD_REF_5E_2014 : DND_BEYOND_BASIC_RULES_REF_5E_2014;

	const toReferenceHref = (reference: GridContentReference): string | undefined => {
		const urlValue = reference.locator.url?.trim();
		if (!urlValue) return undefined;

		if (reference.kind === 'pdf') {
			if (typeof reference.locator.page !== 'number' || !Number.isFinite(reference.locator.page)) {
				return urlValue;
			}
			const page = Math.max(1, Math.trunc(reference.locator.page));
			return `${urlValue.split('#', 1)[0]}#page=${page}`;
		}

		if (reference.kind === 'url') {
			const anchorValue = reference.locator.anchor?.trim();
			if (!anchorValue) return urlValue;
			const normalizedAnchor = anchorValue.startsWith('#') ? anchorValue.slice(1) : anchorValue;
			if (normalizedAnchor.length === 0) return urlValue;
			return `${urlValue.split('#', 1)[0]}#${normalizedAnchor}`;
		}

		return undefined;
	};

	const getTemplatePreviewHref = (
		annotation: GridContentAnnotation,
		templateKey: TemplateReferenceKey
	): string | undefined => {
		const templateRef = getReferenceTemplateByKey(templateKey);
		if (getReferenceTemplateKey(annotation) === templateKey && annotation.ref) {
			return toReferenceHref(annotation.ref) ?? toReferenceHref(templateRef);
		}
		return toReferenceHref(templateRef);
	};

	const updatePdfPageAtIndex = (annotationIdx: number, nextPageValue: string) =>
		updateAnnotationAtIndex(annotationIdx, (entry) => {
			if (!entry.ref || entry.ref.kind !== 'pdf') return entry;
			const trimmed = nextPageValue.trim();
			const parsed = Number(trimmed);
			const nextPage =
				trimmed.length === 0 || !Number.isInteger(parsed) ? undefined : Math.max(1, parsed);
			if (nextPage === undefined) {
				const { page: _ignored, ...restLocator } = entry.ref.locator;
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
				const { anchor: _ignored, ...restLocator } = entry.ref.locator;
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
				{@const srdPreviewHref = getTemplatePreviewHref(annotation, 'srd')}
				{@const dndBeyondPreviewHref = getTemplatePreviewHref(annotation, 'dndBeyond')}
				<details
					id={annotation.id ? toAnnotationEditorDomId(annotation.id) : undefined}
					class="space-y-2 rounded-md border px-2 py-2"
				>
					<summary class="theme-text-muted cursor-pointer text-xs">
						{annotation.name ?? `Annotation ${annotationIdx + 1}`}: {annotation.kind}
						({annotation.origin})
					</summary>
					<div class="mt-2 space-y-2">
						<div class="grid gap-2 md:grid-cols-2">
							<label class="space-y-1">
								<span class="theme-text-muted text-xs">Name</span>
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
								<span class="theme-text-muted text-xs">Kind</span>
								<select
									class="theme-input w-full rounded-md border px-2 py-1"
									value={annotation.kind}
									onchange={(event) => {
										const target = event.currentTarget as HTMLSelectElement;
										updateAnnotationAtIndex(annotationIdx, (entry) => ({
											...entry,
											kind: target.value as GridContentAnnotation['kind']
										}));
									}}
								>
									{#each annotationKinds as optionKind (optionKind)}
										<option value={optionKind}>{optionKind}</option>
									{/each}
								</select>
							</label>
							<label class="space-y-1">
								<span class="theme-text-muted text-xs">Origin</span>
								<select
									class="theme-input w-full rounded-md border px-2 py-1"
									value={annotation.origin}
									onchange={(event) => {
										const target = event.currentTarget as HTMLSelectElement;
										updateAnnotationAtIndex(annotationIdx, (entry) => ({
											...entry,
											origin: target.value as GridContentAnnotation['origin']
										}));
									}}
								>
									{#each annotationOrigins as optionOrigin (optionOrigin)}
										<option value={optionOrigin}>{optionOrigin}</option>
									{/each}
								</select>
							</label>
							<label class="space-y-1">
								<span class="theme-text-muted text-xs">Tags (comma separated)</span>
								<input
									class="theme-input w-full rounded-md border px-2 py-1"
									type="text"
									value={(annotation.tags ?? []).join(', ')}
									oninput={(event) => {
										const target = event.currentTarget as HTMLInputElement;
										const nextTags = parseAnnotationTags(target.value);
										updateAnnotationAtIndex(annotationIdx, (entry) => ({
											...entry,
											tags: nextTags.length > 0 ? nextTags : undefined
										}));
									}}
								/>
							</label>
						</div>

						<label class="space-y-1">
							<span class="theme-text-muted text-xs">Text</span>
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

						<details class="space-y-2" open>
							<summary class="theme-text-muted cursor-pointer text-xs">Reference (optional)</summary
							>
							<div class="mt-2 space-y-1">
								<div class="flex items-center justify-between gap-2 text-xs">
									<label class="flex items-center gap-2">
										<input
											type="radio"
											name={`annotation-ref-template-${annotation.id ?? annotationIdx}`}
											checked={selectedReferenceTemplateKey === 'none'}
											onchange={() => {
												applyReferenceTemplateAtIndex(annotationIdx, undefined);
											}}
										/>
										<span class="theme-text-muted">None</span>
									</label>
								</div>
								<div class="flex items-center justify-between gap-2 text-xs">
									<label class="flex items-center gap-2">
										<input
											type="radio"
											name={`annotation-ref-template-${annotation.id ?? annotationIdx}`}
											checked={selectedReferenceTemplateKey === 'srd'}
											onchange={() => {
												applyReferenceTemplateAtIndex(annotationIdx, SRD_REF_5E_2014);
											}}
										/>
										<span class="theme-text-muted">SRD 5.1 (local PDF)</span>
									</label>
									{#if srdPreviewHref}
										<a
											class="theme-link underline"
											href={srdPreviewHref}
											target="_blank"
											rel="external noopener noreferrer">(view here)</a
										>
									{/if}
								</div>
								<div class="flex items-center justify-between gap-2 text-xs">
									<label class="flex items-center gap-2">
										<input
											type="radio"
											name={`annotation-ref-template-${annotation.id ?? annotationIdx}`}
											checked={selectedReferenceTemplateKey === 'dndBeyond'}
											onchange={() => {
												applyReferenceTemplateAtIndex(
													annotationIdx,
													DND_BEYOND_BASIC_RULES_REF_5E_2014
												);
											}}
										/>
										<span class="theme-text-muted">D&D Beyond Basic Rules (2014)</span>
									</label>
									{#if dndBeyondPreviewHref}
										<a
											class="theme-link underline"
											href={dndBeyondPreviewHref}
											target="_blank"
											rel="external noopener noreferrer">(view here)</a
										>
									{/if}
								</div>
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
						</details>

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
