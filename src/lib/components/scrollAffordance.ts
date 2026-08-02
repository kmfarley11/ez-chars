export type ScrollAffordanceState = {
	canScrollUp: boolean;
	canScrollDown: boolean;
};

export const createScrollAffordanceAttachment = (
	onChange: (state: ScrollAffordanceState) => void
) => {
	return (element: HTMLElement) => {
		let previousState: ScrollAffordanceState | undefined;

		const measure = () => {
			const maximumScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
			const nextState = {
				canScrollUp: maximumScrollTop > 1 && element.scrollTop > 1,
				canScrollDown: maximumScrollTop > 1 && element.scrollTop < maximumScrollTop - 1
			};

			if (
				previousState?.canScrollUp === nextState.canScrollUp &&
				previousState.canScrollDown === nextState.canScrollDown
			) {
				return;
			}

			previousState = nextState;
			onChange(nextState);
		};

		const resizeObserver = new ResizeObserver(measure);
		const mutationObserver = new MutationObserver(measure);
		resizeObserver.observe(element);
		mutationObserver.observe(element, { childList: true, subtree: true, characterData: true });
		element.addEventListener('scroll', measure, { passive: true });
		queueMicrotask(measure);

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			element.removeEventListener('scroll', measure);
		};
	};
};
