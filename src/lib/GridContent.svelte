<script lang="ts">
	import GridContainer from '$lib/GridContainer.svelte';
	import GridContainerAuto from '$lib/GridContainerAuto.svelte';
	import { capitalizeFirstLetter } from '$lib/stringFormatters';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import { createId } from '../schema/helpers';
	import type {
		GridContentAnnotation,
		GridContentBindPath,
		GridContentData,
		GridContentField,
		GridContentFieldValue,
		GridContentNestedFields,
		GridContentPatch,
		GridContentPathSegment,
		GridContentReference
	} from '$lib/gridContentTypes';

	interface Props {
		data: GridContentData;
		// eslint-disable-next-line no-unused-vars
		handleEditSave?: (_payload: GridContentData) => void;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches?: (_patches: Array<GridContentPatch>) => void;
		handleEditCancel?: () => void;
	}

	let {
		data,
		handleEditSave,
		handleEditSavePatches,
		handleEditCancel = undefined
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined;
	let helpDialogEl: HTMLDialogElement | undefined;
	let draftData = $state<GridContentData>({});

	const inferFieldName = (fieldKey: string) => {
		const spaced = fieldKey
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/[_-]+/g, ' ')
			.trim();
		return capitalizeFirstLetter(spaced.length > 0 ? spaced : fieldKey);
	};

	const isFieldArray = (value: GridContentFieldValue): value is Array<GridContentField> =>
		Array.isArray(value);

	const isNestedFields = (value: GridContentFieldValue): value is GridContentNestedFields =>
		typeof value === 'object' && value !== null && !Array.isArray(value);

	const shouldRenderField = (field: GridContentField) => !field.editOnly;

	// Ensure every field (including nested ones) has a stable display name before render/edit.
	const normalizeField = (fieldKey: string, field: GridContentField): GridContentField => {
		const normalizedName =
			displayOrPlaceholder(field.fieldName, '').trim() || inferFieldName(fieldKey);
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return {
				...field,
				fieldName: normalizedName
			};
		}

		if (isFieldArray(field.value)) {
			return {
				...field,
				fieldName: normalizedName,
				value: field.value.map((child, idx) => normalizeField(`item${idx + 1}`, child))
			};
		}

		const normalizedNested: GridContentNestedFields = Object.fromEntries(
			Object.entries(field.value).map(([childKey, childField]) => [
				childKey,
				normalizeField(childKey, childField)
			])
		);
		return {
			...field,
			fieldName: normalizedName,
			value: normalizedNested
		};
	};

	const normalizeData = (source: GridContentData): GridContentData =>
		Object.fromEntries(
			Object.entries(source).map(([fieldKey, field]) => [fieldKey, normalizeField(fieldKey, field)])
		);

	const normalizedData = $derived<GridContentData>(normalizeData(data));

	// Render any field shape generically: primitives, nested objects, and arrays of nested entries.
	const formatFieldValue = (
		field: GridContentField,
		placeholder = '___',
		nestedJoiner = ' / '
	): string => {
		if (!shouldRenderField(field)) return '';
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return displayOrPlaceholder(field.value, placeholder);
		}

		if (isFieldArray(field.value)) {
			const combined = field.value
				.filter((entry) => shouldRenderField(entry))
				.map((entry) => formatFieldValue(entry, '', ' '))
				.filter((entry) => entry.length > 0)
				.join(' / ');
			return combined.length > 0 ? combined : placeholder;
		}

		const nested = field.value;
		const combined = Object.values(nested)
			.filter((entry) => shouldRenderField(entry))
			.map((entry) => formatFieldValue(entry, '', nestedJoiner))
			.filter((entry) => entry.length > 0)
			.join(nestedJoiner);
		return combined.length > 0 ? combined : placeholder;
	};

	type DisplayPart = { value: string; label?: string };

	const getLabeledDisplayParts = (field: GridContentField): DisplayPart[] | undefined => {
		if (isFieldArray(field.value) || !isNestedFields(field.value)) return undefined;

		const nested = field.value;

		const parts = Object.values(nested)
			.filter((entry) => shouldRenderField(entry))
			.map((entry) => ({
				value: formatFieldValue(entry, ''),
				label: entry.label
			}))
			.filter((entry) => entry.value.length > 0);

		return parts.some((entry) => entry.label) ? parts : undefined;
	};

	const joinLabels = (...labels: Array<string | undefined>): string | undefined => {
		const parts = labels
			.map((label) => displayOrPlaceholder(label, '').trim())
			.filter((label) => label.length > 0);
		if (parts.length === 0) return undefined;
		return parts.join(' / ');
	};

	type LeafInput = {
		path: Array<GridContentPathSegment>;
		field: GridContentField;
		joinedLabel?: string;
		bindPath?: GridContentBindPath;
	};

	const annotationOrigins: Array<GridContentAnnotation['origin']> = ['user', 'source'];
	const annotationKinds: Array<GridContentAnnotation['kind']> = [
		'note',
		'reference',
		'summary',
		'tag'
	];
	const annotationRefKinds: Array<GridContentReference['kind']> = [
		'pdf_page',
		'url',
		'external_id'
	];

	// Bind path resolution order: explicit field `bindPath`, then inherited parent bind path + this segment.
	const resolveBindPath = (
		field: GridContentField,
		inheritedBindPath: GridContentBindPath | undefined,
		pathSegment: GridContentPathSegment | undefined
	): GridContentBindPath | undefined => {
		if (field.bindPath && field.bindPath.length > 0) return field.bindPath;
		if (!inheritedBindPath) return undefined;
		if (typeof pathSegment === 'undefined') return inheritedBindPath;
		return [...inheritedBindPath, pathSegment];
	};

	// Flatten nested field trees into editable leaves while carrying UI labels + resolved bind paths.
	const collectLeafInputs = (
		field: GridContentField,
		path: Array<GridContentPathSegment>,
		inheritedLabel?: string,
		inheritedBindPath?: GridContentBindPath,
		pathSegment?: GridContentPathSegment
	): LeafInput[] => {
		const nextLabel = joinLabels(inheritedLabel, field.label);
		const nextBindPath = resolveBindPath(field, inheritedBindPath, pathSegment);
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return [{ path, field, joinedLabel: nextLabel, bindPath: nextBindPath }];
		}

		if (isFieldArray(field.value)) {
			return field.value.flatMap((childField, idx) =>
				collectLeafInputs(childField, [...path, idx], nextLabel, nextBindPath, idx)
			);
		}

		return Object.entries(field.value).flatMap(([childKey, childField]) =>
			collectLeafInputs(childField, [...path, childKey], nextLabel, nextBindPath, childKey)
		);
	};

	// Immutable deep update for a single edited leaf by traversing path segments recursively.
	const updateFieldAtPath = (
		field: GridContentField,
		path: Array<GridContentPathSegment>,
		nextValue: string | number
	): GridContentField => {
		const [head, ...rest] = path;
		if (head === undefined) {
			return {
				...field,
				value: nextValue
			};
		}

		if (isFieldArray(field.value)) {
			if (typeof head !== 'number') return field;
			const target = field.value[head];
			if (!target) return field;
			return {
				...field,
				value: field.value.map((entry, idx) =>
					idx === head ? updateFieldAtPath(target, rest, nextValue) : entry
				)
			};
		}

		if (!isNestedFields(field.value) || typeof head !== 'string') return field;
		const target = field.value[head];
		if (!target) return field;
		return {
			...field,
			value: {
				...field.value,
				[head]: updateFieldAtPath(target, rest, nextValue)
			}
		};
	};

	const updateDataAtPath = (
		source: GridContentData,
		path: Array<GridContentPathSegment>,
		nextValue: string | number
	): GridContentData => {
		const [head, ...rest] = path;
		if (typeof head !== 'string') return source;
		const target = source[head];
		if (!target) return source;
		return {
			...source,
			[head]: updateFieldAtPath(target, rest, nextValue)
		};
	};

	const updateFieldAnnotationsAtPath = (
		field: GridContentField,
		path: Array<GridContentPathSegment>,
		nextAnnotations: Array<GridContentAnnotation>
	): GridContentField => {
		const [head, ...rest] = path;
		if (head === undefined) {
			return {
				...field,
				annotations: nextAnnotations
			};
		}

		if (isFieldArray(field.value)) {
			if (typeof head !== 'number') return field;
			const target = field.value[head];
			if (!target) return field;
			return {
				...field,
				value: field.value.map((entry, idx) =>
					idx === head ? updateFieldAnnotationsAtPath(target, rest, nextAnnotations) : entry
				)
			};
		}

		if (!isNestedFields(field.value) || typeof head !== 'string') return field;
		const target = field.value[head];
		if (!target) return field;
		return {
			...field,
			value: {
				...field.value,
				[head]: updateFieldAnnotationsAtPath(target, rest, nextAnnotations)
			}
		};
	};

	const updateDataAnnotationsAtPath = (
		source: GridContentData,
		path: Array<GridContentPathSegment>,
		nextAnnotations: Array<GridContentAnnotation>
	): GridContentData => {
		const [head, ...rest] = path;
		if (typeof head !== 'string') return source;
		const target = source[head];
		if (!target) return source;
		return {
			...source,
			[head]: updateFieldAnnotationsAtPath(target, rest, nextAnnotations)
		};
	};

	const parseTags = (value: string): Array<string> =>
		value
			.split(',')
			.map((entry) => entry.trim())
			.filter((entry) => entry.length > 0);

	const hasLocatorValue = (value: unknown): boolean => {
		if (typeof value === 'number') return Number.isFinite(value);
		if (typeof value === 'string') return value.trim().length > 0;
		return false;
	};

	const updateAnnotationRefAtIndex = (
		annotations: Array<GridContentAnnotation>,
		annotationIdx: number,
		updater: (_value: GridContentReference) => GridContentReference
	): Array<GridContentAnnotation> =>
		annotations.map((entry, idx) => {
			if (idx !== annotationIdx) return entry;
			const baseRef: GridContentReference = entry.ref ?? {
				sourceId: '',
				kind: 'url',
				locator: {}
			};
			const nextRef = updater(baseRef);
			const hasSource = nextRef.sourceId.trim().length > 0;
			const hasLocator = Object.values(nextRef.locator).some((locatorValue) =>
				hasLocatorValue(locatorValue)
			);
			if (!hasSource && !hasLocator) {
				const { ref: _ignored, ...rest } = entry;
				return rest;
			}
			return {
				...entry,
				ref: nextRef
			};
		});

	const closeDialog = () => {
		dialogEl?.close();
	};

	const closeHelpDialog = () => {
		helpDialogEl?.close();
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onHelpCancel = () => {
		closeHelpDialog();
	};

	const onOpen = () => {
		draftData = structuredClone(normalizedData);
		dialogEl?.showModal();
	};

	const onHelpOpen = () => {
		helpDialogEl?.showModal();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onHelpBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onHelpCancel();
		}
	};

	// Convert current draft into atomic write operations for model-level patch handlers.
	const collectPatchesFromData = (source: GridContentData): Array<GridContentPatch> =>
		Object.entries(source).flatMap(([fieldKey, field]) =>
			collectLeafInputs(field, [fieldKey], undefined, undefined, fieldKey).flatMap((leaf) => {
				if (isFieldArray(leaf.field.value) || isNestedFields(leaf.field.value)) return [];
				const patches: Array<GridContentPatch> = [
					{
						path: leaf.bindPath ?? leaf.path,
						value: leaf.field.value
					}
				];
				if (leaf.field.annotationBindPath) {
					patches.push({
						path: leaf.field.annotationBindPath,
						value: leaf.field.annotations ?? []
					});
				}
				return patches;
			})
		);

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		// Preferred path: emit bind-path patches; fallback preserves legacy payload-based integration.
		if (handleEditSavePatches) {
			handleEditSavePatches(collectPatchesFromData(draftData));
		} else {
			handleEditSave?.(draftData);
		}
		closeDialog();
	};
</script>

<div class="group relative">
	<div
		class="absolute top-0 right-0 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
	>
		<button
			type="button"
			class="theme-btn-light btn rounded-md border p-1 cursor-pointer"
			aria-label="Help"
			title="Help"
			onclick={onHelpOpen}
		>
			<span
				class="inline-block h-4 w-4 text-center text-sm leading-4 font-semibold"
				aria-hidden="true"
			>
				?
			</span>
		</button>
		<button
			type="button"
			class="theme-btn-light btn rounded-md border p-1 cursor-pointer"
			aria-label="Edit"
			title="Edit"
			onclick={onOpen}
		>
			<!-- TODO - consider edits at individual field level rather than group -->
			<svg
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				class="h-4 w-4 stroke-current"
				aria-hidden="true"
			>
				<path d="M12 20h9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
				<path
					d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				></path>
			</svg>
		</button>
	</div>
	<div class="pr-16">
		<GridContainerAuto maxCols={3} classes="gap-2">
			{#each Object.entries(normalizedData) as [fieldKey, field] (fieldKey)}
				{@const labeledParts = getLabeledDisplayParts(field)}
				<GridContainer classes="min-w-0">
					<p class="min-w-0">
						<span data-grid-auto-item class="inline-block">
							<span class="font-semibold">{field.fieldName}:</span>
							{#if labeledParts}
								{#each labeledParts as part, idx (`${fieldKey}-${idx}`)}
									{#if idx > 0}
										<span aria-hidden="true" class="mx-1">/</span>
									{/if}
									{part.value}
									{#if part.label}
										<span class="theme-text-muted text-xs italic">&nbsp;({part.label})</span>
									{/if}
								{/each}
							{:else}
								{formatFieldValue(field)}
							{/if}
							{#if field.label}
								<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
							{/if}
						</span>
					</p>
				</GridContainer>
			{/each}
		</GridContainerAuto>
	</div>
</div>

<dialog
	bind:this={dialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	oncancel={onCancel}
	onclick={onBackdropClick}
>
	<form class="flex flex-col gap-3 p-4" onsubmit={onSubmit}>
		<h3 class="text-lg leading-none font-semibold">Edit Meta Fields</h3>
		{#each Object.entries(draftData) as [fieldKey, field] (fieldKey)}
			{@const leafInputs = collectLeafInputs(field, [fieldKey])}
			<div class="space-y-1">
				<p class="font-semibold">
					{field.fieldName}
					{#if field.label}
						<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
					{/if}
				</p>
				<div class="space-y-2">
					{#each leafInputs as leaf, idx (`${fieldKey}-${idx}-${leaf.path.join('.')}`)}
						<div class="space-y-2 rounded-md border px-2 py-2">
							<label class="space-y-1">
								<span class="theme-text-muted text-xs">
									{leaf.field.fieldName}
									{#if leaf.joinedLabel}
										<span class="theme-text-muted text-xs italic"> ({leaf.joinedLabel}) </span>
									{/if}
								</span>
								{#if leaf.field.multiline}
									<textarea
										class="theme-input w-full rounded-md border px-2 py-1 font-mono text-sm"
										rows="5"
										aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
										oninput={(event) => {
											const target = event.currentTarget as HTMLTextAreaElement;
											draftData = updateDataAtPath(draftData, leaf.path, target.value);
										}}>{displayOrPlaceholder(leaf.field.value, '')}</textarea
									>
								{:else}
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type={typeof leaf.field.value === 'number' ? 'number' : 'text'}
										step={typeof leaf.field.value === 'number' ? '1' : undefined}
										value={displayOrPlaceholder(leaf.field.value, '')}
										aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											const parsed = Number(target.value);
											const nextValue =
												typeof leaf.field.value === 'number' && Number.isFinite(parsed)
													? parsed
													: target.value;
											draftData = updateDataAtPath(draftData, leaf.path, nextValue);
										}}
									/>
								{/if}
							</label>

							{#if leaf.field.annotationBindPath}
								{@const annotations = leaf.field.annotations ?? []}
								<div class="space-y-2 rounded-md border px-2 py-2">
									<div class="flex items-center justify-between">
										<span class="theme-text-muted text-xs font-semibold">Annotations</span>
										<button
											type="button"
											class="theme-btn-light btn rounded-md border px-2 py-0.5 text-xs"
											onclick={() => {
												draftData = updateDataAnnotationsAtPath(draftData, leaf.path, [
													...annotations,
													{
														id: createId(),
														origin: 'user',
														kind: 'note',
														text: ''
													}
												]);
											}}
										>
											Add
										</button>
									</div>

									{#if annotations.length === 0}
										<p class="theme-text-muted text-xs italic">No annotations.</p>
									{:else}
										{#each annotations as annotation, annotationIdx (`${fieldKey}-${idx}-annotation-${annotation.id ?? annotationIdx}`)}
											<div class="space-y-2 rounded-md border px-2 py-2">
												<div class="grid gap-2 md:grid-cols-2">
													<label class="space-y-1">
														<span class="theme-text-muted text-xs">Kind</span>
														<select
															class="theme-input w-full rounded-md border px-2 py-1"
															value={annotation.kind}
															onchange={(event) => {
																const target = event.currentTarget as HTMLSelectElement;
																draftData = updateDataAnnotationsAtPath(
																	draftData,
																	leaf.path,
																	annotations.map((entry, entryIdx) =>
																		entryIdx === annotationIdx
																			? {
																					...entry,
																					kind: target.value as GridContentAnnotation['kind']
																				}
																			: entry
																	)
																);
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
																draftData = updateDataAnnotationsAtPath(
																	draftData,
																	leaf.path,
																	annotations.map((entry, entryIdx) =>
																		entryIdx === annotationIdx
																			? {
																					...entry,
																					origin: target.value as GridContentAnnotation['origin']
																				}
																			: entry
																	)
																);
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
																const nextTags = parseTags(target.value);
																draftData = updateDataAnnotationsAtPath(
																	draftData,
																	leaf.path,
																	annotations.map((entry, entryIdx) =>
																		entryIdx === annotationIdx
																			? {
																					...entry,
																					tags: nextTags.length > 0 ? nextTags : undefined
																				}
																			: entry
																	)
																);
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
															draftData = updateDataAnnotationsAtPath(
																draftData,
																leaf.path,
																annotations.map((entry, entryIdx) =>
																	entryIdx === annotationIdx
																		? {
																				...entry,
																				text:
																					target.value.trim().length > 0 ? target.value : undefined
																			}
																		: entry
																)
															);
														}}>{annotation.text ?? ''}</textarea
													>
												</label>

												<details class="space-y-2">
													<summary class="theme-text-muted cursor-pointer text-xs">
														Reference (optional)
													</summary>
													<div class="mt-2 grid gap-2 md:grid-cols-2">
														<label class="space-y-1">
															<span class="theme-text-muted text-xs">Source ID</span>
															<input
																class="theme-input w-full rounded-md border px-2 py-1"
																type="text"
																value={annotation.ref?.sourceId ?? ''}
																oninput={(event) => {
																	const target = event.currentTarget as HTMLInputElement;
																	draftData = updateDataAnnotationsAtPath(
																		draftData,
																		leaf.path,
																		updateAnnotationRefAtIndex(
																			annotations,
																			annotationIdx,
																			(currentRef) => ({
																				...currentRef,
																				sourceId: target.value
																			})
																		)
																	);
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
																	draftData = updateDataAnnotationsAtPath(
																		draftData,
																		leaf.path,
																		updateAnnotationRefAtIndex(
																			annotations,
																			annotationIdx,
																			(currentRef) => ({
																				...currentRef,
																				kind: target.value as GridContentReference['kind']
																			})
																		)
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
																	draftData = updateDataAnnotationsAtPath(
																		draftData,
																		leaf.path,
																		updateAnnotationRefAtIndex(
																			annotations,
																			annotationIdx,
																			(currentRef) => ({
																				...currentRef,
																				locator: {
																					...currentRef.locator,
																					page: Number.isFinite(parsed) ? parsed : undefined
																				}
																			})
																		)
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
																	draftData = updateDataAnnotationsAtPath(
																		draftData,
																		leaf.path,
																		updateAnnotationRefAtIndex(
																			annotations,
																			annotationIdx,
																			(currentRef) => ({
																				...currentRef,
																				locator: {
																					...currentRef.locator,
																					url:
																						target.value.trim().length > 0
																							? target.value
																							: undefined
																				}
																			})
																		)
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
																	draftData = updateDataAnnotationsAtPath(
																		draftData,
																		leaf.path,
																		updateAnnotationRefAtIndex(
																			annotations,
																			annotationIdx,
																			(currentRef) => ({
																				...currentRef,
																				locator: {
																					...currentRef.locator,
																					id:
																						target.value.trim().length > 0
																							? target.value
																							: undefined
																				}
																			})
																		)
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
																	draftData = updateDataAnnotationsAtPath(
																		draftData,
																		leaf.path,
																		updateAnnotationRefAtIndex(
																			annotations,
																			annotationIdx,
																			(currentRef) => ({
																				...currentRef,
																				locator: {
																					...currentRef.locator,
																					anchor:
																						target.value.trim().length > 0
																							? target.value
																							: undefined
																				}
																			})
																		)
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
																	draftData = updateDataAnnotationsAtPath(
																		draftData,
																		leaf.path,
																		updateAnnotationRefAtIndex(
																			annotations,
																			annotationIdx,
																			(currentRef) => ({
																				...currentRef,
																				locator: {
																					...currentRef.locator,
																					label:
																						target.value.trim().length > 0
																							? target.value
																							: undefined
																				}
																			})
																		)
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
															draftData = updateDataAnnotationsAtPath(
																draftData,
																leaf.path,
																annotations.filter((_, entryIdx) => entryIdx !== annotationIdx)
															);
														}}
													>
														Remove
													</button>
												</div>
											</div>
										{/each}
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
		<div class="mt-1 flex justify-end gap-2">
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-3 py-1"
				onclick={onCancel}
			>
				Cancel
			</button>
			<button type="submit" class="theme-btn-dark btn rounded-md border px-3 py-1">Save</button>
		</div>
	</form>
</dialog>

<dialog
	bind:this={helpDialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	oncancel={onHelpCancel}
	onclick={onHelpBackdropClick}
>
	<div class="flex flex-col gap-3 p-4">
		<h3 class="text-lg leading-none font-semibold">Help</h3>
		<p class="theme-text-muted text-sm">Help content coming soon.</p>
		<div class="mt-1 flex justify-end">
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-3 py-1"
				onclick={onHelpCancel}
			>
				Close
			</button>
		</div>
	</div>
</dialog>
