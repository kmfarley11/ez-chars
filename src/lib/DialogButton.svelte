<script>
	let {
		shadingVariant = 'light',
		title,
		ariaLabel,
		closeText = 'Close',
		children,
		dialogContent
	} = $props();

	let colors = $derived(
		shadingVariant === 'dark'
			? 'theme-btn-dark'
			: 'theme-btn-light'
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

<div class="p-1">
	<button
		type="button"
		class="btn inline-flex h-10 w-10 items-center justify-center rounded-md border p-1 leading-none {colors}"
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
		<div class="flex justify-end">
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-3 py-1"
				onclick={closeDialog}
			>
				{closeText}
			</button>
		</div>
	</div>
</dialog>
