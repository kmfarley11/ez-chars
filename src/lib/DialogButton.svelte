<script>
	let {
		variant = 'light',
		title,
		ariaLabel,
		closeText = 'Close',
		children,
		dialogContent
	} = $props();

	let colors = $derived(
		variant === 'dark'
			? 'bg-slate-700 hover:bg-slate-900 text-white'
			: 'bg-white hover:bg-slate-100 text-black'
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
	class="m-auto w-[min(92vw,34rem)] max-h-[80vh] rounded-md border border-slate-500 p-0 text-black backdrop:bg-black/30"
	oncancel={handleCancel}
>
	<div class="flex min-h-48 flex-col gap-4 p-4">
		<div class="flex flex-1 items-center justify-center text-center">
			{@render dialogContent?.()}
		</div>
		<div class="flex justify-end">
			<button
				type="button"
				class="btn rounded-md border border-slate-500 px-3 py-1 hover:bg-slate-100"
				onclick={closeDialog}
			>
				{closeText}
			</button>
		</div>
	</div>
</dialog>
