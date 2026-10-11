import { pushState, replaceState } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

const hasOpenReference = (): boolean =>
	page.state.referenceLocatorId !== undefined ||
	(!page.state.referenceDirectDismissed && page.url.searchParams.has('reference'));

// Close is dismissal, not navigation: retain the current URL and sheet scroll position.
// Browser Back independently traverses the single entry created when opening the reader.
export const closeSheetReference = (): void => {
	const rest = { ...page.state };
	delete rest.referenceLocatorId;
	delete rest.referenceOrigin;
	delete rest.referenceReturnFocusId;
	const sheetUrl = `/charsheets/5e${page.url.search}${window.location.hash}`;
	replaceState(resolve(sheetUrl as '/charsheets/5e'), {
		...rest,
		referenceDirectDismissed: true
	});
};

// An open reader owns one dismissible history entry, not one per background sheet jump.
export const navigateSheetLandmark = (fragmentId: string): void => {
	const sheetUrl = `/charsheets/5e${page.url.search}#${fragmentId}`;
	const navigate = hasOpenReference() ? replaceState : pushState;
	navigate(resolve(sheetUrl as '/charsheets/5e'), page.state);
};

export const openSheetReference = (locatorId: string, returnFocusId: string): void => {
	const alreadyOpen = hasOpenReference();
	const sheetUrl = `/charsheets/5e${page.url.search}${window.location.hash}`;
	const navigate = alreadyOpen ? replaceState : pushState;
	navigate(resolve(sheetUrl as '/charsheets/5e'), {
		...page.state,
		referenceLocatorId: locatorId,
		referenceOrigin: alreadyOpen ? page.state.referenceOrigin : 'sheet',
		referenceDirectDismissed: false,
		referenceReturnFocusId: alreadyOpen ? page.state.referenceReturnFocusId : returnFocusId
	});
};
