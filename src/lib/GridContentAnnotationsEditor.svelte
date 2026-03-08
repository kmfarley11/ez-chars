<script lang="ts">
	import {
		annotationKinds,
		annotationOrigins,
		annotationRefKinds,
		parseAnnotationTags,
		updateAnnotationRefAtIndex
	} from '$lib/characterGridHelpers';
	import type { GridContentAnnotation, GridContentReference } from '$lib/gridContentTypes';
	import { createId } from '../schema/helpers';

	// `onChange` receives a full replacement annotation array (immutable update contract).
	interface Props {
		annotations: Array<GridContentAnnotation>;
		// eslint-disable-next-line no-unused-vars
		onChange: (_next: Array<GridContentAnnotation>) => void;
	}

	let { annotations, onChange }: Props = $props();

	const updateAnnotationAtIndex = (
		annotationIdx: number,
		updater: (_annotation: GridContentAnnotation) => GridContentAnnotation
	) =>
		onChange(
			annotations.map((entry, entryIdx) => (entryIdx === annotationIdx ? updater(entry) : entry))
		);

	const addAnnotation = () =>
		onChange([
			...annotations,
			{
				id: createId(),
				origin: 'user',
				kind: 'note',
				text: ''
			}
		]);

	const removeAnnotationAtIndex = (annotationIdx: number) =>
		onChange(annotations.filter((_, entryIdx) => entryIdx !== annotationIdx));

	const toOptionalTrimmed = (value: string): string | undefined =>
		value.trim().length > 0 ? value : undefined;

	const updateRefAtIndex = (
		annotationIdx: number,
		updater: (_value: GridContentReference) => GridContentReference
	) => onChange(updateAnnotationRefAtIndex(annotations, annotationIdx, updater));

	const updateRefSourceIdAtIndex = (annotationIdx: number, sourceId: string) =>
		updateRefAtIndex(annotationIdx, (currentRef) => ({
			...currentRef,
			sourceId
		}));

	const updateRefKindAtIndex = (annotationIdx: number, kind: GridContentReference['kind']) =>
		updateRefAtIndex(annotationIdx, (currentRef) => ({
			...currentRef,
			kind
		}));

	const updateLocatorFieldAtIndex = (
		annotationIdx: number,
		field: keyof GridContentReference['locator'],
		value: GridContentReference['locator'][keyof GridContentReference['locator']]
	) =>
		updateRefAtIndex(annotationIdx, (currentRef) => ({
			...currentRef,
			locator: {
				...currentRef.locator,
				[field]: value
			}
		}));
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
				<details class="space-y-2 rounded-md border px-2 py-2">
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

						<details class="space-y-2">
							<summary class="theme-text-muted cursor-pointer text-xs">Reference (optional)</summary
							>
							<div class="mt-2 grid gap-2 md:grid-cols-2">
								<label class="space-y-1">
									<span class="theme-text-muted text-xs">Source ID</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="text"
										value={annotation.ref?.sourceId ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											updateRefSourceIdAtIndex(annotationIdx, target.value);
										}}
									/>
								</label>
								<label class="space-y-1">
									<span class="theme-text-muted text-xs">Ref Kind</span>
									<select
										class="theme-input w-full rounded-md border px-2 py-1"
										value={annotation.ref?.kind ?? 'url'}
										onchange={(event) => {
											const target = event.currentTarget as HTMLSelectElement;
											updateRefKindAtIndex(
												annotationIdx,
												target.value as GridContentReference['kind']
											);
										}}
									>
										{#each annotationRefKinds as optionRefKind (optionRefKind)}
											<option value={optionRefKind}>{optionRefKind}</option>
										{/each}
									</select>
								</label>
								<label class="space-y-1">
									<span class="theme-text-muted text-xs">Page</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="number"
										step="1"
										value={annotation.ref?.locator?.page ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											const parsed = Number(target.value);
											updateLocatorFieldAtIndex(
												annotationIdx,
												'page',
												Number.isFinite(parsed) ? parsed : undefined
											);
										}}
									/>
								</label>
								<label class="space-y-1">
									<span class="theme-text-muted text-xs">URL</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="text"
										value={annotation.ref?.locator?.url ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											updateLocatorFieldAtIndex(
												annotationIdx,
												'url',
												toOptionalTrimmed(target.value)
											);
										}}
									/>
								</label>
								<label class="space-y-1">
									<span class="theme-text-muted text-xs">External ID</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="text"
										value={annotation.ref?.locator?.id ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											updateLocatorFieldAtIndex(
												annotationIdx,
												'id',
												toOptionalTrimmed(target.value)
											);
										}}
									/>
								</label>
								<label class="space-y-1">
									<span class="theme-text-muted text-xs">Anchor</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="text"
										value={annotation.ref?.locator?.anchor ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											updateLocatorFieldAtIndex(
												annotationIdx,
												'anchor',
												toOptionalTrimmed(target.value)
											);
										}}
									/>
								</label>
								<label class="space-y-1">
									<span class="theme-text-muted text-xs">Label</span>
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type="text"
										value={annotation.ref?.locator?.label ?? ''}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											updateLocatorFieldAtIndex(
												annotationIdx,
												'label',
												toOptionalTrimmed(target.value)
											);
										}}
									/>
								</label>
							</div>
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
