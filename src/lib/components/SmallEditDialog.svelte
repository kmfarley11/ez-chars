<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import DialogShell from './DialogShell.svelte';
	import IconButton from './IconButton.svelte';
	import Badge from './Badge.svelte';
	import ScalarEditInput from './ScalarEditInput.svelte';
	import GridContentAnnotationsEditor from './GridContentAnnotationsEditor.svelte';
	import GridContentAnnotationsDisplay from './GridContentAnnotationsDisplay.svelte';
	import ReferencePdfViewer from './ReferencePdfViewer.svelte';
	import {
		resolveAnnotationReference,
		annotationReferenceSections,
		type InternalAnnotationReference
	} from '$lib/resources/annotationReference';
	import type { GridContentReference } from '$utils/gridContentTypes';
	import type { SmallEditRequest } from './smallEditContext';
	import {
		beginSmallDraft,
		saveSmallDraft,
		createSmallNote,
		changeSmallDraft,
		isSmallDraftDirty,
		parseSmallScalar,
		type ScalarValue,
		type SmallDraft,
		type SmallEditField,
		type SmallEditAction
	} from '$utils/smallEdit';
	import type { Annotation } from '../../schema';
	import { createId } from '../../schema/helpers';

	let { request, onClosed }: { request: SmallEditRequest; onClosed: () => void } = $props();
	type Payload = { raw: string | boolean; clear: boolean; note?: Annotation; remove: boolean };
	type Editor = {
		field: SmallEditField;
		kind: 'value' | 'note';
		before: ScalarValue;
		beforeNote?: Annotation;
		noteIndex?: number;
		noteSiblings?: Array<Annotation>;
		draft: SmallDraft<Payload>;
		invoker: HTMLElement;
	};
	let open = $state(true);
	let editor = $state.raw<Editor>();
	let operation = $state.raw<{
		action: SmallEditAction;
		draft: SmallDraft<Record<string, string | boolean>>;
		invoker: HTMLElement;
	}>();
	let pending = $state.raw<() => void>();
	let notesKey = $state<string>();
	let highlightedKey = $state<string>();
	let removingRecord = $state(false);
	let recordError = $state('');
	let reference = $state.raw<InternalAnnotationReference>();
	let referenceInvoker: HTMLElement | undefined;
	let readingScrollTop = 0;
	let scrollTop = $state(0);
	let shell: ReturnType<typeof DialogShell>;
	const previewReference = (ref: GridContentReference, invoker: HTMLElement) => {
		const resolved = resolveAnnotationReference(ref);
		if (!resolved) return;
		readingScrollTop = scrollTop;
		referenceInvoker = invoker;
		reference = resolved;
		void tick().then(() => shell?.focusHeading());
	};
	const inspectReference = (ref: GridContentReference, invoker: HTMLElement) =>
		navigate(() => previewReference(ref, invoker));
	const leaveReference = async () => {
		reference = undefined;
		await tick();
		shell.restoreScroll(readingScrollTop);
		referenceInvoker?.focus({ preventScroll: true });
	};
	let root: HTMLDivElement;
	let resolution = $state<HTMLDivElement>();
	const fieldElements = new SvelteMap<string, HTMLElement>();
	const buttonClass =
		'theme-btn-light touch-target cursor-pointer rounded-md border px-2 py-1 text-sm';
	const restore = async (el?: HTMLElement) => {
		await tick();
		el?.focus({ preventScroll: true });
	};
	const reveal = async (key?: string) => {
		await tick();
		const el = key ? fieldElements.get(key) : undefined;
		el?.scrollIntoView({ block: 'nearest' });
		el?.focus({ preventScroll: true });
	};
	const opened = () => {
		highlightedKey = request.selectedKey;
		if (request.showNotes) notesKey = request.selectedKey ?? request.model.fields[0]?.key;
		void reveal(request.selectedKey);
	};
	const navigate = (next: () => void) => {
		if ((editor && isSmallDraftDirty(editor.draft)) || operation) {
			pending = next;
			void tick().then(() => resolution?.focus());
		} else {
			editor = undefined;
			operation = undefined;
			next();
		}
	};
	const change = (value: Partial<Payload>) => {
		if (editor)
			editor = {
				...editor,
				draft: changeSmallDraft(editor.draft, { ...editor.draft.value, ...value })
			};
	};
	const start = (
		field: SmallEditField,
		invoker: HTMLElement,
		note?: Annotation,
		newNote = false,
		noteIndex?: number
	) =>
		navigate(() => {
			const before = field.read();
			removingRecord = false;
			highlightedKey = field.key;
			const payload: Payload = {
				raw: field.kind === 'boolean' ? before === true : String(before ?? ''),
				clear: false,
				remove: false
			};
			if (note || newNote) {
				payload.note = note ? $state.snapshot(note) : createSmallNote(createId);
				notesKey = field.key;
			}
			editor = {
				field,
				kind: note || newNote ? 'note' : 'value',
				before,
				beforeNote: note ? $state.snapshot(note) : undefined,
				noteIndex,
				noteSiblings: note && !note.id ? $state.snapshot(field.notes?.read()) : undefined,
				draft: beginSmallDraft(payload),
				invoker
			};
			// A newly requested note is unsaved work, even before its first keystroke.
			if (newNote)
				editor = {
					...editor,
					draft: { ...editor.draft, initial: { ...payload, note: undefined } }
				};
			void tick().then(() =>
				root
					?.querySelector<HTMLElement>(
						'[data-small-editor] input, [data-small-editor] textarea, [data-small-editor] select'
					)
					?.focus()
			);
		});
	const cancel = () => {
		if (operation) {
			const invoker = operation.invoker;
			operation = undefined;
			pending = undefined;
			void restore(invoker);
			return;
		}
		const current = editor;
		editor = undefined;
		pending = undefined;
		void tick().then(() =>
			restore(
				current?.invoker.isConnected
					? current.invoker
					: current
						? fieldElements.get(current.field.key)
						: undefined
			)
		);
	};
	const save = (restoreFocus = true): boolean => {
		if (operation) {
			const current = operation;
			const draft = saveSmallDraft(current.draft, (values) =>
				current.action.commit(
					Object.fromEntries(
						(current.action.fields ?? []).map((field) => [
							field.key,
							parseSmallScalar(field.kind, values[field.key], field.options)
						])
					)
				)
			);
			if (draft) {
				operation = { ...current, draft };
				return false;
			}
			operation = undefined;
			highlightedKey = undefined;
			notesKey = undefined;
			if (restoreFocus)
				void tick().then(() =>
					current.invoker.isConnected ? restore(current.invoker) : shell?.focusHeading()
				);
			return true;
		}
		if (!editor) return true;
		const current = editor;
		const draft = saveSmallDraft(
			current.draft,
			(value) =>
				(current.kind === 'note'
					? current.field.notes?.commit({
							before: current.beforeNote,
							position:
								current.noteSiblings && current.noteIndex !== undefined
									? { index: current.noteIndex, siblings: current.noteSiblings }
									: undefined,
							after: value.remove ? undefined : value.note
						})
					: current.field.commit?.(
							current.before,
							value.clear
								? undefined
								: parseSmallScalar(current.field.kind, value.raw, current.field.options)
						)) ?? { ok: false, message: 'This information is not editable.' }
		);
		if (draft) {
			editor = { ...current, draft };
			void tick().then(() => root?.querySelector<HTMLElement>('[data-small-editor]')?.focus());
			return false;
		}
		editor = undefined;
		if (restoreFocus)
			void tick().then(() =>
				restore(
					current.invoker.isConnected ? current.invoker : fieldElements.get(current.field.key)
				)
			);
		return true;
	};
	const continuePending = (shouldSave: boolean) => {
		if (shouldSave && !save(false)) return;
		const next = pending;
		editor = undefined;
		pending = undefined;
		operation = undefined;
		next?.();
	};
	const close = () => {
		open = false;
	};
	const handleCancel = () => {
		if (reference) leaveReference();
		else navigate(close);
		return false;
	};
</script>

<DialogShell
	bind:this={shell}
	bind:open
	bind:scrollTop
	title={reference?.resource.title ?? request.model.title}
	fullHeightMobile
	wide={!!reference}
	scrollAffordance={!reference}
	onClose={onClosed}
	onOpened={opened}
	onCancel={handleCancel}
	showBack
	onBack={handleCancel}
>
	<div bind:this={root} class="space-y-3" hidden={!!reference} inert={!!reference}>
		{#if request.model.badges}<div class="flex flex-wrap items-center gap-1">
				{#each request.model.badges() as label, index (index)}<Badge {label} />{/each}
			</div>{/if}
		{#each request.model.fields as field (field.key)}
			<section
				class="small-edit-field border-b pb-3 last:border-0"
				class:highlighted={highlightedKey === field.key}
				aria-current={highlightedKey === field.key ? 'location' : undefined}
				aria-label={field.label}
			>
				<h3
					tabindex="-1"
					class="font-semibold focus:outline-offset-2"
					{@attach (el) => {
						fieldElements.set(field.key, el);
						return () => {
							fieldElements.delete(field.key);
						};
					}}
				>
					{field.label}
				</h3>
				{#if editor?.field.key === field.key && editor.kind === 'value'}
					{@render editBody()}
				{:else}
					<div class="flex items-start justify-between gap-2">
						<p class="min-w-0 whitespace-pre-wrap break-words">
							{typeof (field.display?.() ?? field.read()) === 'boolean'
								? (field.display?.() ?? field.read())
									? 'Yes'
									: 'No'
								: (field.display?.() ?? field.read() ?? '—')}
						</p>
						{#if field.commit}<IconButton
								variant="edit"
								size="sm"
								ariaLabel={`Edit ${field.label}`}
								onclick={(event) => start(field, event.currentTarget as HTMLElement)}
							/>{/if}
					</div>
				{/if}
				{#if field.explanation}<details class="text-sm">
						<summary class="touch-target cursor-pointer">About {field.label}</summary
						>{field.explanation}
					</details>{/if}
				{#if field.notes}
					{@const notes = field.notes.read()}
					<div class="mt-1 flex flex-wrap items-center gap-2">
						{#if notes.length}<button
								type="button"
								class={buttonClass}
								aria-expanded={notesKey === field.key}
								onclick={() =>
									navigate(() => {
										notesKey = notesKey === field.key ? undefined : field.key;
									})}>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</button
							>{/if}
						<button
							type="button"
							class={buttonClass}
							onclick={(event) => {
								start(field, event.currentTarget, undefined, true);
							}}>Add note<span class="sr-only"> for {field.label}</span></button
						>
					</div>
					{#if notesKey === field.key}
						{#each notes as note, index (note.id ?? index)}
							<div class="mt-2">
								{#if editor?.kind === 'note' && editor.field.key === field.key && editor.beforeNote && (note.id ? editor.beforeNote.id === note.id : editor.noteIndex === index)}
									{@render editBody()}
								{:else}
									<GridContentAnnotationsDisplay
										annotations={[note]}
										onInspectReference={inspectReference}
										canInspectReference={(ref) => !!resolveAnnotationReference(ref)}
									/>
									<button
										type="button"
										class={buttonClass}
										onclick={(event) => start(field, event.currentTarget, note, false, index)}
										>Edit note<span class="sr-only"> {note.name ?? index + 1}</span></button
									>
								{/if}
							</div>
						{/each}
						{#if editor?.kind === 'note' && editor.field.key === field.key && editor.beforeNote && !notes.some( (note, index) => (note.id ? note.id === editor?.beforeNote?.id : index === editor?.noteIndex) )}
							{@render editBody()}
						{/if}
					{/if}
					{#if editor?.field.key === field.key && editor.kind === 'note' && !editor.beforeNote}{@render editBody()}{/if}
				{/if}
			</section>
		{/each}
		{#each request.model.actions ?? [] as action (action.key)}
			<button
				class={buttonClass}
				onclick={(event) => {
					const invoker = event.currentTarget;
					navigate(() => {
						removingRecord = false;
						operation = {
							action,
							invoker,
							draft: beginSmallDraft(
								Object.fromEntries(
									(action.fields ?? []).map((field) => [
										field.key,
										field.kind === 'boolean' ? field.read() === true : String(field.read() ?? '')
									])
								)
							)
						};
						void tick().then(() => {
							const target = root?.querySelector<HTMLElement>('[data-small-editor]');
							target?.scrollIntoView({ block: 'nearest' });
							target?.focus();
						});
					});
				}}>{action.label}</button
			>
		{/each}
		{#if operation}
			<div
				data-small-editor
				tabindex="-1"
				role="group"
				aria-label={operation.action.label}
				class="space-y-2 rounded-md border p-2"
			>
				<h3 class="font-semibold">{operation.action.label}</h3>
				{#if operation.action.confirmation}<p>{operation.action.confirmation}</p>{/if}
				{#each operation.action.fields ?? [] as field (field.key)}
					<div class="space-y-1">
						<p class="text-sm font-medium">{field.label}</p>
						<ScalarEditInput
							label={field.label}
							kind={field.kind}
							options={field.options}
							value={operation.draft.value[field.key]}
							onChange={(value) => {
								if (operation)
									operation = {
										...operation,
										draft: changeSmallDraft(operation.draft, {
											...operation.draft.value,
											[field.key]: value
										})
									};
							}}
						/>
					</div>
				{/each}
				{#if operation.draft.error}<p role="alert">{operation.draft.error}</p>{/if}
				<button
					class={buttonClass}
					onclick={() => {
						if (save()) pending = undefined;
					}}>{operation.action.confirmation ? 'Confirm removal' : operation.action.label}</button
				>
				<button class={buttonClass} onclick={cancel}>Cancel</button>
			</div>
		{/if}
		{#if request.onRemove}
			{#if removingRecord}
				<p>Remove this record? This cannot be undone.</p>
				<button
					class={buttonClass}
					onclick={() => {
						if (request.onRemove?.() !== false) close();
						else recordError = 'Unable to remove this record.';
					}}>Confirm removal</button
				>
				<button class={buttonClass} onclick={() => (removingRecord = false)}>Keep record</button>
				{#if recordError}<p role="alert">{recordError}</p>{/if}
			{:else}<button
					class={buttonClass}
					onclick={() =>
						navigate(() => {
							removingRecord = true;
						})}>{request.removeLabel ?? 'Remove record'}</button
				>{/if}
		{/if}
	</div>
	{#if reference}
		<div class="flex h-[min(64dvh,44rem)] min-h-[18rem]">
			<ReferencePdfViewer
				title={reference.resource.title}
				url={reference.generalHref}
				browserHref={reference.browserHref}
				initialPage={reference.locator.page!}
				curatedSections={annotationReferenceSections(reference)}
			/>
		</div>
	{/if}
	{#snippet actions()}
		{#if pending}
			<div
				bind:this={resolution}
				tabindex="-1"
				class="flex min-w-0 flex-wrap gap-2"
				role="group"
				aria-label="Unsaved changes"
			>
				<p class="w-full text-sm">Save this edit before continuing?</p>
				<button class={buttonClass} onclick={() => continuePending(true)}>Save and continue</button>
				<button class={buttonClass} onclick={() => continuePending(false)}
					>Discard and continue</button
				>
				<button
					class={buttonClass}
					onclick={() => {
						pending = undefined;
						void tick().then(() =>
							root?.querySelector<HTMLElement>('[data-small-editor]')?.focus()
						);
					}}>Keep editing</button
				>
			</div>
		{/if}
	{/snippet}
</DialogShell>

{#snippet editBody()}
	{#if editor}
		<div
			data-small-editor
			tabindex="-1"
			class="mt-2 space-y-2 rounded-md border p-2"
			role="group"
			aria-label={`Editing ${editor.field.label}`}
		>
			{#if editor.draft.value.remove || editor.draft.value.clear}
				<p>
					{editor.draft.value.remove
						? 'Note will be removed.'
						: 'Value will be cleared. Attached notes will remain.'}
				</p>
				<button class={buttonClass} onclick={() => change({ remove: false, clear: false })}
					>Undo</button
				>
			{:else if editor.kind === 'note' && editor.draft.value.note}
				<GridContentAnnotationsEditor
					singleNote
					onInspectReference={previewReference}
					canInspectReference={(ref) => !!resolveAnnotationReference(ref)}
					annotations={[editor.draft.value.note]}
					referenceTemplates={request.model.annotationEditorConfig?.referenceTemplates}
					onChange={(notes) => change({ note: notes[0] })}
				/>
			{:else}
				<ScalarEditInput
					label={editor.field.label}
					kind={editor.field.kind}
					value={editor.draft.value.raw}
					options={editor.field.options}
					onChange={(raw) => change({ raw })}
				/>
			{/if}
			{#if editor.draft.error}<p role="alert" class="text-sm">{editor.draft.error}</p>{/if}
			<div class="flex flex-wrap items-center gap-2">
				<IconButton
					variant="confirm"
					ariaLabel={editor.draft.value.remove
						? 'Confirm note removal'
						: `Save ${editor.kind === 'note' ? 'note' : editor.field.label}`}
					onclick={() => {
						if (save()) pending = undefined;
					}}
				/>
				<IconButton
					variant="cancel"
					ariaLabel={`Cancel ${editor.kind === 'note' ? 'note' : editor.field.label} edit`}
					onclick={cancel}
				/>
				{#if editor.kind === 'value' && editor.field.canClear && !editor.draft.value.clear}<button
						class={buttonClass}
						onclick={() => change({ clear: true })}>Clear {editor.field.label}</button
					>{/if}
				{#if editor.kind === 'note' && editor.beforeNote && !editor.draft.value.remove}<button
						class={buttonClass}
						onclick={() => change({ remove: true })}>Remove note</button
					>{/if}
			</div>
		</div>
	{/if}
{/snippet}

<style>
	.small-edit-field {
		border-inline-start: 3px solid transparent;
		padding-inline: 0.5rem;
		scroll-margin-block: 0.5rem;
	}
	.small-edit-field.highlighted {
		border-inline-start-color: var(--color-brand);
		background-color: color-mix(in srgb, var(--color-brand) 10%, transparent);
	}
</style>
