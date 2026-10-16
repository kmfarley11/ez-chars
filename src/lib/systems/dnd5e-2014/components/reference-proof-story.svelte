<script lang="ts">
	import { asset } from '$app/paths';
	import { tick } from 'svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import PanelSurface from '$lib/ui/molecules/panel-surface.svelte';
	import ReferencePdfViewer from '$lib/ui/organisms/reference-pdf-viewer.svelte';
	import RulesResourceLibrary from '$lib/ui/organisms/rules-resource-library.svelte';
	import {
		DND5E_2014_CLASS_LOCATOR_ID,
		dnd5e2014ResourceCatalog
	} from '$lib/resources/dnd5e2014ResourceCatalog';
	import { mixedResourceCatalogFixture } from '$lib/resources/resourceCatalogFixtures';
	import { resolveResourceLocator, type ResourceDisposition } from '$lib/resources/resourceCatalog';
	import { openPdfDocument, type OpenPdfDocument } from '$lib/resources/pdfViewer';

	type InternalResourceDisposition = Extract<ResourceDisposition, { kind: 'internal' }>;
	type StaleInternalResourceDisposition = Extract<
		ResourceDisposition,
		{ kind: 'stale'; safeOpenKind: 'internal' }
	>;
	type ProofViewerRequest = {
		disposition: InternalResourceDisposition | StaleInternalResourceDisposition;
		initialPage: number;
		browserHref: string;
		staleLocator: boolean;
	};
	let { mode = 'viewer' } = $props<{ mode?: 'viewer' | 'mixed' }>();
	let activeViewerRequest = $state<ProofViewerRequest>();
	let viewerReturnElement = $state<HTMLElement>();
	let viewerHeadingEl = $state<HTMLHeadingElement>();
	let failure = $state<'none' | 'initialization' | 'text'>('none');
	const proofLoader = $derived.by((): OpenPdfDocument => {
		const selectedFailure = failure;
		return async (url) => {
			if (selectedFailure === 'initialization')
				throw new Error('Deliberate initialization failure for reader review.');
			const opened = await openPdfDocument(url);
			if (selectedFailure === 'none') return opened;
			// Story-only fault injection at the public PDF boundary; canvas rendering still works.
			const document = new Proxy(opened.document, {
				get(target, key) {
					if (key === 'getPage')
						return async (number: number) =>
							new Proxy(await target.getPage(number), {
								get(page, member) {
									if (member === 'streamTextContent')
										return () =>
											new ReadableStream({
												start(controller) {
													controller.error(new Error('Deliberate text extraction failure.'));
												}
											});
									const value = Reflect.get(page, member, page);
									return typeof value === 'function' ? value.bind(page) : value;
								}
							});
					const value = Reflect.get(target, key, target);
					return typeof value === 'function' ? value.bind(target) : value;
				}
			});
			return { ...opened, document };
		};
	});
	const resolveAssetHref = (path: string) => asset(path as Parameters<typeof asset>[0]);
	const viewerDisposition = resolveResourceLocator(
		dnd5e2014ResourceCatalog,
		DND5E_2014_CLASS_LOCATOR_ID,
		{ resolveAssetHref }
	);
	const curatedSections = dnd5e2014ResourceCatalog.locators.flatMap((entry) =>
		entry.kind === 'pdf-page' && entry.page ? [{ label: entry.label, page: entry.page }] : []
	);
	const standaloneViewerRequest = $derived(
		mode === 'viewer' && viewerDisposition?.kind === 'internal'
			? {
					disposition: viewerDisposition,
					initialPage: viewerDisposition.locator.page!,
					browserHref: viewerDisposition.browserHref,
					staleLocator: false
				}
			: undefined
	);
	const displayedViewerRequest = $derived(activeViewerRequest ?? standaloneViewerRequest);

	const openInternalReference = async (
		disposition: InternalResourceDisposition | StaleInternalResourceDisposition,
		returnElement: HTMLElement
	) => {
		activeViewerRequest = {
			disposition,
			initialPage: disposition.kind === 'internal' ? disposition.locator.page! : 1,
			browserHref: disposition.browserHref,
			staleLocator: disposition.kind === 'stale'
		};
		viewerReturnElement = returnElement;
		await tick();
		viewerHeadingEl?.focus();
	};

	const closeInternalReference = async () => {
		const returnElementId = viewerReturnElement?.id;
		activeViewerRequest = undefined;
		await tick();
		if (!returnElementId) return;
		const returnElement = document.getElementById(returnElementId);
		if (returnElement instanceof HTMLElement) returnElement.focus();
	};

	const openLibraryReference = (locatorId: string, invoker: HTMLElement) => {
		const disposition = resolveResourceLocator(mixedResourceCatalogFixture, locatorId, {
			resolveAssetHref
		});
		if (
			disposition?.kind === 'internal' ||
			(disposition?.kind === 'stale' && disposition.safeOpenKind === 'internal')
		) {
			void openInternalReference(disposition, invoker);
		}
	};
</script>

{#if displayedViewerRequest}
	<details class="p-2 text-sm">
		<summary class="touch-target cursor-pointer">Reviewer setup (not reader UI)</summary>
		<label
			>Failure fixture <select class="theme-input touch-target" bind:value={failure}
				><option value="none">Working document</option><option value="initialization"
					>Cannot open document</option
				><option value="text">Page text and Find failure</option></select
			></label
		>
		<p>
			At a phone viewport, try Find → armor → result, Outline → Equipment, and Page → 100. Return to
			the document and check position. Widen the viewport to review the resizable sidebar. The
			failure fixture leaves canvas painting available but makes text selection and Find fail;
			choose Working document to recover.
		</p>
	</details>
	<div class="h-[82dvh] p-2">
		<PanelSurface classes="m-0 flex h-full min-h-0 flex-col p-3">
			<header class="mb-3 flex items-start justify-between gap-3 border-b pb-3">
				<div>
					<p class="theme-text-muted text-xs font-semibold uppercase tracking-wide">
						Rules reference
					</p>
					<h1 bind:this={viewerHeadingEl} class="text-xl font-bold" tabindex="-1">
						{displayedViewerRequest.disposition.locator.label}
					</h1>
				</div>
				{#if activeViewerRequest}
					<BaseButton size="sm" onclick={() => void closeInternalReference()}>
						Back to source states
					</BaseButton>
				{/if}
			</header>
			{#if displayedViewerRequest.staleLocator}
				<p class="theme-muted-surface mb-3 rounded-md border p-2 text-sm" role="status">
					The exact page needs review. The verified document opened at its beginning instead.
				</p>
			{/if}
			<ReferencePdfViewer
				loadDocument={proofLoader}
				title={displayedViewerRequest.disposition.resource.title}
				url={displayedViewerRequest.disposition.generalHref}
				browserHref={displayedViewerRequest.browserHref}
				initialPage={displayedViewerRequest.initialPage}
				{curatedSections}
			/>
		</PanelSurface>
	</div>
{:else if mode === 'mixed'}
	<div
		class="mx-auto flex h-[82dvh] max-w-3xl flex-col gap-4 p-4"
		aria-label="Mixed reference source states"
	>
		<header>
			<h1 class="text-xl font-bold">Rules resource discovery</h1>
			<p class="theme-text-muted text-sm">
				Search the catalog and compare the quiet included path with external, user-owned, alternate,
				stale, unavailable, empty-query, and no-match behavior.
			</p>
		</header>
		<RulesResourceLibrary
			catalog={mixedResourceCatalogFixture}
			systemId="dnd5e-2014"
			onOpenInternal={openLibraryReference}
		/>
	</div>
{/if}
