<script lang="ts">
	import { collectLeafInputs, normalizeData } from '$utils/gridContentHelpers';
	import {
		appendGridArrayItemAtPath,
		removeGridArrayItemAtPath,
		updateGridDataAtPath
	} from '$utils/characterGridHelpers';
	import { displayOrPlaceholder } from '$utils/displayHelpers';
	import { isGridFieldArray } from '$utils/gridFieldGuards';
	import type { GridContentData, GridContentField } from '$utils/gridContentTypes';

	interface Props {
		id?: string;
		data: GridContentData;
		// eslint-disable-next-line no-unused-vars
		onSave?: (_payload: GridContentData) => void;
	}

	let { id = 'structured-form', data, onSave }: Props = $props();

	let draftData = $state<GridContentData>({});
	let previousDataJson = $state<string | undefined>(undefined);

	$effect(() => {
		if (data) {
			const currentJson = JSON.stringify(data);
			if (currentJson !== previousDataJson) {
				draftData = structuredClone($state.snapshot(normalizeData(data)));
				previousDataJson = currentJson;
			}
		}
	});

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		onSave?.(draftData);
	};

	const addArrayItem = (fieldKey: string, template: GridContentField) => {
		draftData = appendGridArrayItemAtPath(
			draftData,
			[fieldKey],
			structuredClone($state.snapshot(template))
		);
	};

	const removeArrayItem = (fieldKey: string, itemIdx: number) => {
		draftData = removeGridArrayItemAtPath(draftData, [fieldKey], itemIdx);
	};

	const isNumberInput = (field: GridContentField) =>
		field.inputKind === 'number' || typeof field.value === 'number';

	const toEditedFieldValue = (field: GridContentField, rawValue: string): string | number => {
		if (!isNumberInput(field)) return rawValue;
		const parsed = Number(rawValue);
		return Number.isFinite(parsed) ? parsed : 0;
	};
</script>

<form {id} class="flex flex-col gap-3" onsubmit={onSubmit}>
	{#each Object.entries(draftData) as [fieldKey, field] (fieldKey)}
		<div class="space-y-1">
			<div class="flex items-center justify-between gap-2">
				<p class="font-semibold">
					{field.fieldName}
					{#if field.label}
						<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
					{/if}
				</p>
				{#if isGridFieldArray(field.value) && field.addItemTemplate}
					<button
						type="button"
						class="theme-btn-light touch-target btn rounded-md border px-2 py-0.5 text-xs"
						onclick={() => addArrayItem(fieldKey, field.addItemTemplate!)}
					>
						{field.addItemLabel ?? 'Add'}
					</button>
				{/if}
			</div>
			{#if isGridFieldArray(field.value)}
				<div class="space-y-2">
					{#if field.value.length === 0}
						<p class="theme-text-muted text-xs italic">No entries yet.</p>
					{/if}
					{#each field.value as arrayItem, itemIdx (`${fieldKey}-${itemIdx}`)}
						{@const itemLeafInputs = collectLeafInputs(
							arrayItem,
							[fieldKey, itemIdx],
							undefined,
							field.bindPath,
							itemIdx
						)}
						{@const visibleItemLeafInputs = itemLeafInputs.filter((leaf) => !leaf.field.hidden)}
						<div class="space-y-2 rounded-md border px-2 py-2">
							<div class="flex items-center justify-between gap-2">
								<p class="text-sm font-semibold">
									{arrayItem.fieldName ?? `${field.fieldName} ${itemIdx + 1}`}
								</p>
								<button
									type="button"
									class="theme-btn-light touch-target btn rounded-md border px-2 py-0.5 text-xs"
									onclick={() => removeArrayItem(fieldKey, itemIdx)}
								>
									Remove
								</button>
							</div>
							{#each visibleItemLeafInputs as leaf, leafIdx (`${fieldKey}-${itemIdx}-${leafIdx}-${leaf.path.join('.')}`)}
								<div class="space-y-2 rounded-md border px-2 py-2">
									<div class="space-y-1">
										<span class="theme-text-muted text-xs">
											{leaf.field.fieldName}
											{#if leaf.joinedLabel}
												<span class="theme-text-muted text-xs italic">
													({leaf.joinedLabel})
												</span>
											{/if}
										</span>
										{#if typeof leaf.field.value === 'boolean'}
											<label class="touch-target flex cursor-pointer items-center gap-2">
												<input
													class="theme-input h-4 w-4 rounded border"
													type="checkbox"
													checked={leaf.field.value}
													aria-label={field.fieldName === leaf.field.fieldName
														? field.fieldName
														: `${field.fieldName} ${leaf.field.fieldName}`}
													onchange={(event) => {
														const target = event.currentTarget as HTMLInputElement;
														draftData = updateGridDataAtPath(draftData, leaf.path, target.checked);
													}}
												/>
												<span class="theme-text-muted text-xs">Enabled</span>
											</label>
										{:else if leaf.field.multiline}
											<textarea
												class="theme-input w-full rounded-md border px-2 py-1 font-mono text-sm"
												rows="5"
												aria-label={field.fieldName === leaf.field.fieldName
													? field.fieldName
													: `${field.fieldName} ${leaf.field.fieldName}`}
												oninput={(event) => {
													const target = event.currentTarget as HTMLTextAreaElement;
													draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
												}}>{displayOrPlaceholder(leaf.field.value, '')}</textarea
											>
										{:else if leaf.field.options && typeof leaf.field.value === 'string'}
											<select
												class="theme-input w-full rounded-md border px-2 py-1"
												value={leaf.field.value}
												aria-label={field.fieldName === leaf.field.fieldName
													? field.fieldName
													: `${field.fieldName} ${leaf.field.fieldName}`}
												onchange={(event) => {
													const target = event.currentTarget as HTMLSelectElement;
													draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
												}}
											>
												{#each leaf.field.options as option (option)}
													<option value={option}>{option}</option>
												{/each}
											</select>
										{:else}
											<input
												class="theme-input w-full rounded-md border px-2 py-1"
												type={isNumberInput(leaf.field) ? 'number' : 'text'}
												step={isNumberInput(leaf.field) ? '1' : undefined}
												value={displayOrPlaceholder(leaf.field.value, '')}
												aria-label={field.fieldName === leaf.field.fieldName
													? field.fieldName
													: `${field.fieldName} ${leaf.field.fieldName}`}
												oninput={(event) => {
													const target = event.currentTarget as HTMLInputElement;
													draftData = updateGridDataAtPath(
														draftData,
														leaf.path,
														toEditedFieldValue(leaf.field, target.value)
													);
												}}
											/>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/each}
				</div>
			{:else}
				{@const leafInputs = collectLeafInputs(field, [fieldKey])}
				<div class="space-y-2">
					{#if leafInputs.length === 0}
						<p class="theme-text-muted text-xs italic">No entries yet.</p>
					{/if}
					{#each leafInputs.filter((leaf) => !leaf.field.hidden) as leaf, idx (`${fieldKey}-${idx}-${leaf.path.join('.')}`)}
						<div class="space-y-2 rounded-md border px-2 py-2">
							<div class="space-y-1">
								<span class="theme-text-muted text-xs">
									{leaf.field.fieldName}
									{#if leaf.joinedLabel}
										<span class="theme-text-muted text-xs italic">
											({leaf.joinedLabel})
										</span>
									{/if}
								</span>
								{#if typeof leaf.field.value === 'boolean'}
									<label class="touch-target flex cursor-pointer items-center gap-2">
										<input
											class="theme-input h-4 w-4 rounded border"
											type="checkbox"
											checked={leaf.field.value}
											aria-label={field.fieldName === leaf.field.fieldName
												? field.fieldName
												: `${field.fieldName} ${leaf.field.fieldName}`}
											onchange={(event) => {
												const target = event.currentTarget as HTMLInputElement;
												draftData = updateGridDataAtPath(draftData, leaf.path, target.checked);
											}}
										/>
										<span class="theme-text-muted text-xs">Enabled</span>
									</label>
								{:else if leaf.field.multiline}
									<textarea
										class="theme-input w-full rounded-md border px-2 py-1 font-mono text-sm"
										rows="5"
										aria-label={field.fieldName === leaf.field.fieldName
											? field.fieldName
											: `${field.fieldName} ${leaf.field.fieldName}`}
										oninput={(event) => {
											const target = event.currentTarget as HTMLTextAreaElement;
											draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
										}}>{displayOrPlaceholder(leaf.field.value, '')}</textarea
									>
								{:else if leaf.field.options && typeof leaf.field.value === 'string'}
									<select
										class="theme-input w-full rounded-md border px-2 py-1"
										value={leaf.field.value}
										aria-label={field.fieldName === leaf.field.fieldName
											? field.fieldName
											: `${field.fieldName} ${leaf.field.fieldName}`}
										onchange={(event) => {
											const target = event.currentTarget as HTMLSelectElement;
											draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
										}}
									>
										{#each leaf.field.options as option (option)}
											<option value={option}>{option}</option>
										{/each}
									</select>
								{:else}
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type={isNumberInput(leaf.field) ? 'number' : 'text'}
										step={isNumberInput(leaf.field) ? '1' : undefined}
										value={displayOrPlaceholder(leaf.field.value, '')}
										aria-label={field.fieldName === leaf.field.fieldName
											? field.fieldName
											: `${field.fieldName} ${leaf.field.fieldName}`}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											draftData = updateGridDataAtPath(
												draftData,
												leaf.path,
												toEditedFieldValue(leaf.field, target.value)
											);
										}}
									/>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</form>
