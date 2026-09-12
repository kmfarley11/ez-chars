import { pushState } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export const openSheetReference = (locatorId: string, returnFocusId: string): void => {
	const sheetUrl = `/charsheets/5e${page.url.search}${window.location.hash}`;
	pushState(resolve(sheetUrl as '/charsheets/5e'), {
		...page.state,
		referenceLocatorId: locatorId,
		referenceOrigin: 'sheet',
		referenceDirectDismissed: false,
		referenceReturnFocusId: returnFocusId
	});
};
