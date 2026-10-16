// Only the environment effects of the current 2014 sheet, not a system registry.
export interface SheetNavigationHost {
	readFragment: () => string;
	pushFragment: (fragmentId: string) => void;
	subscribe: (onTraversal: () => void) => () => void;
	readonly activeReferenceId: string | undefined;
	readonly referenceReturnFocusId: string | undefined;
	openReference: (locatorId: string, returnFocusId: string) => void;
	selectReference: (locatorId: string) => void;
	closeReference: () => void;
}
