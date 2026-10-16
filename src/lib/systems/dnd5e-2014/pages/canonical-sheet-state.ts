import type { CharacterDocument5e2014 } from '../../../../schema';
import type { SheetEditOwner } from '../editing/sheet-edit-session';

// Clones at both boundaries so Reset cannot restore a previously edited singleton.
// Validation belongs to the shared domain commit seam, exactly as in the app host.
export const createCanonicalSheetState = (fixture: CharacterDocument5e2014) => {
	const baseline = structuredClone(fixture);
	let current = structuredClone(baseline);
	let rejected = false;
	const owner: SheetEditOwner = {
		read: () => current,
		write: (next) => {
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
