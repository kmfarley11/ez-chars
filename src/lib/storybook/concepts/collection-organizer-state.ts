import type { Annotation } from '../../../schema';

// Local state for the explicitly deferred organizer; never a production adapter.
export type ProofFeatureRecord = {
	id: string;
	name: string;
	detail: string;
	owner: 'General' | 'Wizard';
	annotations: Array<Annotation>;
};

export const cloneFeatureDraft = (value: ProofFeatureRecord): ProofFeatureRecord =>
	structuredClone(value);
