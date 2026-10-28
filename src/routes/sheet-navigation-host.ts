import { page } from '$app/state';
import type { SheetNavigationHost } from '$lib/navigation/sheet-navigation-host';
import {
	closeSheetReference,
	navigateSheetLandmark,
	openSheetReference,
	selectSheetReference
} from '$lib/resources/sheetReferenceNavigation';

export const createAppSheetNavigationHost = (): SheetNavigationHost => ({
	readFragment: () => window.location.hash.slice(1),
	pushFragment: navigateSheetLandmark,
	subscribe(onTraversal) {
		window.addEventListener('popstate', onTraversal);
		return () => window.removeEventListener('popstate', onTraversal);
	},
	get activeReferenceId() {
		return (
			page.state.referenceLocatorId ??
			(page.state.referenceDirectDismissed
				? undefined
				: (page.url.searchParams.get('reference') ?? undefined))
		);
	},
	get referenceReturnFocusId() {
		return page.state.referenceReturnFocusId;
	},
	openReference: openSheetReference,
	selectReference: selectSheetReference,
	closeReference: closeSheetReference
});
