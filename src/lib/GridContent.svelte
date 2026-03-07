<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/stringFormatters';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import type {
		GridContentData,
		GridContentField,
		GridContentFieldValue,
		GridContentNestedFields
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

	const buildField = (fieldKey: string, raw: unknown): GridContentField => {
		if (typeof raw === 'string' || typeof raw === 'number') {
			return {
				fieldName: inferFieldName(fieldKey),
				value: raw
			};
		}

		if (Array.isArray(raw)) {
			const nested = raw.map((item, idx) => buildField(`item${idx + 1}`, item));
			return {
				fieldName: inferFieldName(fieldKey),
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
				value: nested
			};
		}

		return {
			fieldName: inferFieldName(fieldKey),
			value: displayOrPlaceholder(raw, '')
		};
	};

	const isFieldArray = (value: GridContentFieldValue): value is Array<GridContentField> =>
		Array.isArray(value);

	const isNestedFields = (value: GridContentFieldValue): value is GridContentNestedFields =>
		typeof value === 'object' && value !== null && !Array.isArray(value);

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

	const normalizedData = $derived<GridContentData>(
		normalizeData(
			data ??
				Object.fromEntries(
					Object.entries(dataObject ?? {}).map(([fieldKey, value]) => [
						fieldKey,
						buildField(fieldKey, value)
					])
				)
		)
	);

	const formatFieldValue = (
		field: GridContentField,
		placeholder = '___',
		nestedJoiner = ' / '
	): string => {
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return displayOrPlaceholder(field.value, placeholder);
		}

		if (isFieldArray(field.value)) {
			const combined = field.value
				.map((entry) => formatFieldValue(entry, '', ' '))
				.filter((entry) => entry.length > 0)
				.join(' / ');
			return combined.length > 0 ? combined : placeholder;
		}

		const nested = field.value;
		if ('min' in nested && 'max' in nested) {
			return `${formatFieldValue(nested.min, placeholder)}/${formatFieldValue(nested.max, placeholder)}`;
		}

		const combined = Object.values(nested)
			.map((entry) => formatFieldValue(entry, '', nestedJoiner))
			.filter((entry) => entry.length > 0)
			.join(nestedJoiner);
		return combined.length > 0 ? combined : placeholder;
	};

	type DisplayPart = { value: string; label?: string };

	const getLabeledDisplayParts = (field: GridContentField): DisplayPart[] | undefined => {
		if (isFieldArray(field.value) || !isNestedFields(field.value)) return undefined;

		const nested = field.value;
		if ('min' in nested && 'max' in nested) return undefined;

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

	type PathSegment = string | number;
	type LeafInput = { path: PathSegment[]; field: GridContentField; joinedLabel?: string };

	const collectLeafInputs = (
		field: GridContentField,
		path: PathSegment[],
		inheritedLabel?: string
	): LeafInput[] => {
		const nextLabel = joinLabels(inheritedLabel, field.label);
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return [{ path, field, joinedLabel: nextLabel }];
		}

		if (isFieldArray(field.value)) {
			return field.value.flatMap((childField, idx) =>
				collectLeafInputs(childField, [...path, idx], nextLabel)
			);
		}

		return Object.entries(field.value).flatMap(([childKey, childField]) =>
			collectLeafInputs(childField, [...path, childKey], nextLabel)
		);
	};

	const updateFieldAtPath = (
		field: GridContentField,
		path: PathSegment[],
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
		path: PathSegment[],
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
