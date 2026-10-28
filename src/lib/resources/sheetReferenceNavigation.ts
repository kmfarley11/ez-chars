import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';

const hasOpenReference = (): boolean =>
	page.state.referenceLocatorId !== undefined ||
	(!page.state.referenceDirectDismissed && page.url.searchParams.has('reference'));

// page.url already includes the deployment base and the actual edition route.
const currentSheetUrl = (): URL => {
	const url = new URL(page.url.href);
	url.hash = window.location.hash;
	return url;
};

// Close is dismissal, not navigation: retain the current URL and sheet scroll position.
// Browser Back independently traverses the single entry created when opening the reader.
export const closeSheetReference = (): void => {
	const rest = { ...page.state };
	delete rest.referenceLocatorId;
	delete rest.referenceOrigin;
	delete rest.referenceReturnFocusId;
	replaceState(currentSheetUrl(), {
		...rest,
		referenceDirectDismissed: true
	});
};

// An open reader owns one dismissible history entry, not one per background sheet jump.
export const navigateSheetLandmark = (fragmentId: string): void => {
	const sheetUrl = currentSheetUrl();
	sheetUrl.hash = fragmentId;
	const navigate = hasOpenReference() ? replaceState : pushState;
	navigate(sheetUrl, page.state);
};

export const openSheetReference = (locatorId: string, returnFocusId: string): void => {
	const alreadyOpen = hasOpenReference();
	const navigate = alreadyOpen ? replaceState : pushState;
	navigate(currentSheetUrl(), {
		...page.state,
		referenceLocatorId: locatorId,
		referenceOrigin: alreadyOpen ? page.state.referenceOrigin : 'sheet',
		referenceDirectDismissed: false,
		referenceReturnFocusId: alreadyOpen ? page.state.referenceReturnFocusId : returnFocusId
	});
};

export const selectSheetReference = (locatorId: string): void => {
	replaceState(currentSheetUrl(), { ...page.state, referenceLocatorId: locatorId });
};
