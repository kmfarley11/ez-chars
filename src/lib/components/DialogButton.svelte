<script>
	let {
		shadingVariant = 'light',
		title,
		ariaLabel,
		closeText = 'Close',
		triggerVariant = 'icon',
		children = undefined,
		dialogContent = undefined,
		actions = undefined
	} = $props();

	let colors = $derived(shadingVariant === 'dark' ? 'theme-btn-dark' : 'theme-btn-light');
	let normalizedTriggerVariant = $derived(triggerVariant === 'compact' ? 'compact' : 'icon');
	let triggerWrapperClass = $derived(normalizedTriggerVariant === 'compact' ? '' : 'p-1');
	let triggerButtonClass = $derived(
		normalizedTriggerVariant === 'compact'
			? 'btn inline-flex px-2 py-1 text-sm items-center justify-center rounded-md border p-1 leading-none'
			: 'btn inline-flex h-10 w-10 items-center justify-center rounded-md border p-1 leading-none'
	);

	/** @type {HTMLDialogElement | undefined} */
	let dialogEl;

	const openDialog = () => {
		dialogEl?.showModal();
	};

	const closeDialog = () => {
		dialogEl?.close();
	};

	/** @param {Event} event */
	const handleCancel = (event) => {
		event.preventDefault();
		closeDialog();
	};

	/** @param {MouseEvent} event */
	const handleBackdropClick = (event) => {
		if (event.target === event.currentTarget) {
			closeDialog();
		}
	};
</script>

<div class={triggerWrapperClass}>
	<button
		type="button"
		class="{triggerButtonClass} cursor-pointer {colors}"
		aria-label={ariaLabel ?? title}
		{title}
		onclick={openDialog}
	>
		{@render children?.()}
	</button>
</div>

<dialog
	bind:this={dialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,34rem)] max-h-[80vh] rounded-md border p-0"
	oncancel={handleCancel}
	onclick={handleBackdropClick}
>
	<div class="flex min-h-48 flex-col p-4">
		<div class="flex-1 pb-4">
			{@render dialogContent?.()}
		</div>
		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="theme-btn-light btn cursor-pointer rounded-md border px-3 py-1"
				onclick={closeDialog}
			>
				{closeText}
			</button>
			{@render actions?.(closeDialog)}
		</div>
	</div>
</dialog>
