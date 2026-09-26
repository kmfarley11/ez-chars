import type { Annotation, Item } from '../../../../schema';
import {
	cloneAnnotations,
	restoreRemovedDraftAnnotation,
	validateDraftAnnotations,
	type AnnotationRemoval,
	type DraftCommitResult
} from '$utils/focusedDraft';

export type { AnnotationRemoval } from '$utils/focusedDraft';

export type ProofProfileField = {
	body: string;
	annotations: Array<Annotation>;
};

export type ProofFeatureRecord = {
	id: string;
	name: string;
	detail: string;
	owner: 'General' | 'Wizard';
	annotations: Array<Annotation>;
};

export type ProofInventoryRecord = {
	item: Item;
	pinned: boolean;
	provenance: string;
	references: Array<string>;
};

export type ProofSpellRecord = {
	id: string;
	name: string;
	level: number;
	prepared: boolean;
	pinned: boolean;
	detail: string;
	annotations: Array<Annotation>;
	source: string;
};

export type CommitResult<T> = DraftCommitResult<T>;

export const cloneProfileDraft = (value: ProofProfileField): ProofProfileField => ({
	body: value.body,
	annotations: cloneAnnotations(value.annotations)
});

export const cloneInventoryDraft = (value: ProofInventoryRecord): ProofInventoryRecord => ({
	...value,
	item: {
		...value.item,
		tags: value.item.tags ? [...value.item.tags] : undefined,
		annotations: cloneAnnotations(value.item.annotations ?? [])
	},
	references: [...value.references]
});

export const cloneFeatureDraft = (value: ProofFeatureRecord): ProofFeatureRecord => ({
	...value,
	annotations: cloneAnnotations(value.annotations)
});

export const cloneSpellDraft = (value: ProofSpellRecord): ProofSpellRecord => ({
	...value,
	annotations: cloneAnnotations(value.annotations)
});

export const commitProfileDraft = (
	current: ProofProfileField,
	draft: ProofProfileField,
	label = 'Background'
): CommitResult<ProofProfileField> => {
	if (draft.body.trim().length === 0) {
		return { ok: false, message: `${label} cannot be empty.` };
	}
	const annotationError = validateDraftAnnotations(draft.annotations);
	if (annotationError) return { ok: false, message: annotationError };
	return {
		ok: true,
		value: {
			...current,
			body: draft.body.trim(),
			annotations: cloneAnnotations(draft.annotations)
		}
	};
};

export const commitInventoryDraft = (
	current: ProofInventoryRecord,
	draft: ProofInventoryRecord
): CommitResult<ProofInventoryRecord> => {
	if (draft.item.name.trim().length === 0) {
		return { ok: false, message: 'Item name cannot be empty.' };
	}
	const annotationError = validateDraftAnnotations(draft.item.annotations ?? []);
	if (annotationError) return { ok: false, message: annotationError };
	return {
		ok: true,
		value: {
			...current,
			item: {
				...current.item,
				name: draft.item.name.trim(),
				notes: draft.item.notes?.trim(),
				annotations: cloneAnnotations(draft.item.annotations ?? [])
			}
		}
	};
};

export const commitFeatureDraft = (
	current: ProofFeatureRecord,
	draft: ProofFeatureRecord
): CommitResult<ProofFeatureRecord> => {
	if (draft.name.trim().length === 0) {
		return { ok: false, message: 'Feature name cannot be empty.' };
	}
	const annotationError = validateDraftAnnotations(draft.annotations);
	if (annotationError) return { ok: false, message: annotationError };
	return {
		ok: true,
		value: {
			...current,
			name: draft.name.trim(),
			detail: draft.detail.trim(),
			annotations: cloneAnnotations(draft.annotations)
		}
	};
};

export const commitSpellDraft = (
	current: ProofSpellRecord,
	draft: ProofSpellRecord
): CommitResult<ProofSpellRecord> => {
	if (draft.name.trim().length === 0) {
		return { ok: false, message: 'Spell name cannot be empty.' };
	}
	const annotationError = validateDraftAnnotations(draft.annotations);
	if (annotationError) return { ok: false, message: annotationError };
	return {
		ok: true,
		value: {
			...current,
			name: draft.name.trim(),
			detail: draft.detail.trim(),
			prepared: draft.prepared,
			annotations: cloneAnnotations(draft.annotations)
		}
	};
};

export const removeAnnotationForDraft = (
	annotations: ReadonlyArray<Annotation>,
	annotationId: string
): { annotations: Array<Annotation>; removal?: AnnotationRemoval } => {
	const index = annotations.findIndex((annotation) => annotation.id === annotationId);
	if (index < 0) return { annotations: cloneAnnotations(annotations) };
	return {
		annotations: cloneAnnotations(
			annotations.filter((_, candidateIndex) => candidateIndex !== index)
		),
		removal: { annotation: cloneAnnotations([annotations[index]])[0], index }
	};
};

export const restoreRemovedAnnotation = (
	annotations: ReadonlyArray<Annotation>,
	removal: AnnotationRemoval
): Array<Annotation> => restoreRemovedDraftAnnotation(annotations, removal);
