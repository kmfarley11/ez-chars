// Clones at both boundaries so Reset cannot restore a previously edited singleton.
// Validation belongs to the shared domain commit seam, exactly as in the app host.
export const createCanonicalSheetState = <T>(fixture: T) => {
	const baseline = structuredClone(fixture);
	let current = structuredClone(baseline);
	let rejected = false;
	const owner = {
		read: () => current,
		write: (next: T) => {
			current = next;
		},
		reject: () => rejected
	};
	return {
		...owner,
		setRejected(value: boolean) {
			rejected = value;
		},
		reset() {
			current = structuredClone(baseline);
			rejected = false;
		}
	};
};
