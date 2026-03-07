<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/stringFormatters';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import type {
		GridContentData,
		GridContentField,
		GridContentFieldValue,
		GridContentNestedFields,
		GridFieldType
	} from '$lib/gridContentTypes';

	interface Props {
		data?: GridContentData;
		dataObject?: Record<string, unknown>;
		// eslint-disable-next-line no-unused-vars
		handleEditSave: (_payload: GridContentData) => void;
		handleEditCancel?: () => void;
	}

	let {
		data = undefined,
		dataObject = undefined,
		handleEditSave,
		handleEditCancel = undefined
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined;
	let draftData = $state<GridContentData>({});

	const inferFieldName = (fieldKey: string) => {
		const spaced = fieldKey
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/[_-]+/g, ' ')
			.trim();
		return capitalizeFirstLetter(spaced.length > 0 ? spaced : fieldKey);
	};

	const inferFieldType = (value: unknown): GridFieldType => {
		if (typeof value === 'string') return 'string';
		if (typeof value === 'number') return 'number';
		return 'object';
	};

	const buildField = (fieldKey: string, raw: unknown): GridContentField => {
		if (typeof raw === 'string' || typeof raw === 'number') {
			return {
				fieldName: inferFieldName(fieldKey),
				fieldType: inferFieldType(raw),
				value: raw
			};
		}

		if (Array.isArray(raw)) {
			const nested: GridContentNestedFields = Object.fromEntries(
				raw.map((item, idx) => {
					const key = `item${idx + 1}`;
					return [key, buildField(key, item)];
				})
			);
			return {
				fieldName: inferFieldName(fieldKey),
				fieldType: 'object',
				value: nested
			};
		}

		if (typeof raw === 'object' && raw !== null) {
			const nested: GridContentNestedFields = Object.fromEntries(
				Object.entries(raw as Record<string, unknown>).map(([key, item]) => [
					key,
					buildField(key, item)
				])
			);
			return {
				fieldName: inferFieldName(fieldKey),
				fieldType: 'object',
				value: nested
			};
		}

		return {
			fieldName: inferFieldName(fieldKey),
			fieldType: 'string',
			value: displayOrPlaceholder(raw, '')
		};
	};

	const normalizedData = $derived<GridContentData>(
		data ??
			Object.fromEntries(
				Object.entries(dataObject ?? {}).map(([fieldKey, value]) => [
					fieldKey,
					buildField(fieldKey, value)
				])
			)
	);

	const isNestedFields = (value: GridContentFieldValue): value is GridContentNestedFields =>
		typeof value === 'object' && value !== null;

	const formatFieldValue = (field: GridContentField, placeholder = '___'): string => {
		if (!isNestedFields(field.value)) return displayOrPlaceholder(field.value, placeholder);

		const nested = field.value;
		if ('min' in nested && 'max' in nested) {
			return `${formatFieldValue(nested.min, placeholder)}/${formatFieldValue(nested.max, placeholder)}`;
		}

		if ('stringValue' in nested || 'intValue' in nested) {
			const text = nested.stringValue ? formatFieldValue(nested.stringValue, '') : '';
			const numeric = nested.intValue ? formatFieldValue(nested.intValue, '') : '';
			const combined = [text, numeric].filter((v) => v.length > 0).join(' ');
			return combined.length > 0 ? combined : placeholder;
		}

		const combined = Object.values(nested)
			.map((entry) => formatFieldValue(entry, ''))
			.filter((entry) => entry.length > 0)
			.join(' / ');
		return combined.length > 0 ? combined : placeholder;
	};

	type DisplayPart = { value: string; label?: string };

	const getLabeledDisplayParts = (field: GridContentField): DisplayPart[] | undefined => {
		if (!isNestedFields(field.value)) return undefined;

		const nested = field.value;
		if ('min' in nested && 'max' in nested) return undefined;
		if ('stringValue' in nested || 'intValue' in nested) return undefined;

		const parts = Object.values(nested)
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

	type LeafInput = { path: string[]; field: GridContentField; joinedLabel?: string };

	const collectLeafInputs = (
		field: GridContentField,
		path: string[],
		inheritedLabel?: string
	): LeafInput[] => {
		const nextLabel = joinLabels(inheritedLabel, field.label);
		if (!isNestedFields(field.value)) return [{ path, field, joinedLabel: nextLabel }];
		return Object.entries(field.value).flatMap(([childKey, childField]) =>
			collectLeafInputs(childField, [...path, childKey], nextLabel)
		);
	};

	const updateNestedValueAtPath = (
		fields: GridContentNestedFields,
		path: string[],
		nextValue: string | number
	): GridContentNestedFields => {
		const [head, ...rest] = path;
		const target = fields[head];
		if (!target) return fields;
		if (rest.length === 0) {
			return {
				...fields,
				[head]: {
					...target,
					value: nextValue
				}
			};
		}
		if (!isNestedFields(target.value)) return fields;
		return {
			...fields,
			[head]: {
				...target,
				value: updateNestedValueAtPath(target.value, rest, nextValue)
			}
		};
	};

	const updateDataAtPath = (
		source: GridContentData,
		path: string[],
		nextValue: string | number
	): GridContentData => {
		const [head, ...rest] = path;
		const target = source[head];
		if (!target) return source;
		if (rest.length === 0) {
			return {
				...source,
				[head]: {
					...target,
					value: nextValue
				}
			};
		}
		if (!isNestedFields(target.value)) return source;
		return {
			...source,
			[head]: {
				...target,
				value: updateNestedValueAtPath(target.value, rest, nextValue)
			}
		};
	};

	const closeDialog = () => {
		dialogEl?.close();
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onOpen = () => {
		draftData = structuredClone(normalizedData);
		dialogEl?.showModal();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleEditSave(draftData);
		closeDialog();
	};
</script>

<div class="group relative">
	<button
		type="button"
		class="theme-btn-light btn absolute top-0 right-0 z-10 rounded-md border p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
		aria-label="Edit"
		title="Edit"
		onclick={onOpen}
	>
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
	<div class="space-y-2 pr-12">
		{#each Object.entries(normalizedData) as [fieldKey, field] (fieldKey)}
			{@const labeledParts = getLabeledDisplayParts(field)}
			<div>
				<p>
					<span class="font-semibold">{field.fieldName}:</span>
					{#if labeledParts}
						{#each labeledParts as part, idx (`${fieldKey}-${idx}`)}
							{#if idx > 0}
								/
							{/if}
							{part.value}
							{#if part.label}
								<span class="italic"> {part.label} </span>
							{/if}
						{/each}
					{:else}
						{formatFieldValue(field)}
					{/if}
				</p>
				{#if field.label}
					<p class="theme-text-muted text-xs italic">{field.label}</p>
				{/if}
			</div>
		{/each}
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
				<p class="font-semibold">{field.fieldName}</p>
				{#if field.label}
					<p class="theme-text-muted text-xs italic">{field.label}</p>
				{/if}
				<div class="space-y-2">
					{#each leafInputs as leaf, idx (`${fieldKey}-${idx}-${leaf.path.join('.')}`)}
						<label class="space-y-1">
							<span class="theme-text-muted text-xs">{leaf.field.fieldName}</span>
							{#if leaf.joinedLabel}
								<span class="theme-text-muted block text-xs italic">{leaf.joinedLabel}</span>
							{/if}
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
						</label>
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
