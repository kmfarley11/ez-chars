import { pushState } from '$app/navigation';
import { page } from '$app/state';

export const openSheetReference = (locatorId: string, returnFocusId: string): void => {
	pushState('', {
		...page.state,
		referenceLocatorId: locatorId,
		referenceOrigin: 'sheet',
		referenceDirectDismissed: false,
		referenceReturnFocusId: returnFocusId
	});
};
