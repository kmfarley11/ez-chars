import { getContext, setContext } from 'svelte';
import type { GridContentData, GridAnnotationEditorConfig } from '$utils/gridContentTypes';
import type { SmallEditModel } from '$utils/smallEdit';

export type SmallEditEntryStyle = 'group' | 'label' | 'button' | 'chevron';
export type SmallEditRequest = {
	model: SmallEditModel;
	selectedKey?: string;
	showNotes?: boolean;
	onClosed?: () => void;
	onRemove?: () => boolean | void;
	removeLabel?: string;
};
export type SmallGridRequest = {
	data: GridContentData;
	title: string;
	selectedKey?: string;
	showNotes?: boolean;
	annotationEditorConfig?: GridAnnotationEditorConfig;
	onClosed?: () => void;
};
export type SmallEditAccess = {
	readonly enabled: boolean;
	readonly entryStyle: SmallEditEntryStyle;
	targeted: (data: GridContentData) => boolean;
	openGrid: (request: SmallGridRequest) => boolean;
	openRecord: (
		key: string,
		onClosed: () => void,
		onRemove?: () => boolean | void,
		removeLabel?: string
	) => boolean;
};
const key = Symbol('small-edit');
export const getSmallEditAccess = (): SmallEditAccess | undefined => getContext(key);
export const setSmallEditAccess = (access: SmallEditAccess): void => {
	setContext(key, access);
};
