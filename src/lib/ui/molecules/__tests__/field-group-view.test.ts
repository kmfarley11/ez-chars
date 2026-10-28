import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import FieldGroupView from '../field-group-view.svelte';
import GridContentListRow from '../grid-content-list-row.svelte';
import QuickReference from '../../organisms/quick-reference.svelte';
import ReadonlyCheckbox from '../../atoms/readonly-checkbox.svelte';
import { getLabeledDisplayParts } from '$lib/utils/gridContentHelpers';
import type { GridContentField } from '$lib/utils/gridContentTypes';

describe('compact shared read-first presentation', () => {
	it.each([undefined, 'indicators'] as const)(
		'avoids repeating identical parent/leaf checkbox labels in %s presentation',
		(displayLayout) => {
			const { body } = render(FieldGroupView, {
				props: {
					interactive: false,
					data: {
						ready: {
							fieldName: 'Ready',
							displayLayout,
							value: {
								status: { fieldName: 'Ready', label: 'Ready', value: false },
								quantity: { fieldName: 'Quantity', label: 'Quantity', value: 3 }
							}
						}
					}
				}
			});
			expect(body).toContain('aria-label="Ready: disabled"');
			expect(body).not.toContain('Ready Ready');
		}
	);
	it('renders neutral status metadata for scalar and grouped fields without checkbox controls', () => {
		const { body } = render(FieldGroupView, {
			props: {
				interactive: false,
				data: {
					access: {
						fieldName: 'Access',
						value: 'Reserved',
						displayStatus: { mark: 'R', label: 'Reserved' }
					},
					group: {
						fieldName: 'Training',
						displayStatus: { mark: 'E', label: 'Expert' },
						value: {
							enabled: { fieldName: 'Enabled', label: 'Enabled', value: true },
							bonus: { fieldName: 'Bonus', label: 'Bonus', value: 8 }
						}
					}
				}
			}
		});
		expect(body).toContain('aria-label="Access: Reserved"');
		expect(body).toContain('aria-label="Training: Expert"');
		expect(body).toContain('8 Bonus');
		expect(body).not.toContain('type="checkbox"');
	});
	it('puts indicator tooltips on a hoverable wrapper instead of the disabled input', () => {
		const { body } = render(ReadonlyCheckbox, {
			props: {
				value: true,
				label: 'Expertise',
				explanation: 'Double proficiency, not the whole bonus.'
			}
		});
		expect(body).toMatch(
			/<span[^>]*title="Expertise: enabled\. Double proficiency, not the whole bonus\. Open the label to edit\."/
		);
		expect(body).toMatch(/<input[^>]*pointer-events-none/);
		const descriptionId = body.match(/aria-describedby="([^"]+)"/)?.[1];
		expect(descriptionId).toBeTruthy();
		expect(body).toContain(`id="${descriptionId}" class="sr-only"`);
		expect(body).toContain('class="sr-only">Double proficiency, not the whole bonus.</span>');
	});
	it('renders boolean pair leaves as checkboxes, preserving unknown versus false', () => {
		const field: GridContentField = {
			fieldName: 'Check',
			value: {
				enabled: { fieldName: 'Enabled', label: 'Enabled', value: true },
				disabled: { fieldName: 'Disabled', label: 'Disabled', value: false },
				unknown: { fieldName: 'Unknown', label: 'Unknown', value: '', displayAs: 'checkbox' },
				bonus: { fieldName: 'Bonus', label: 'Bonus', value: 3 }
			}
		};
		expect(getLabeledDisplayParts(field)).toHaveLength(4);
		const { body } = render(FieldGroupView, {
			props: { data: { check: field }, interactive: false }
		});
		expect(body.match(/type="checkbox"/g)).toHaveLength(3);
		expect(body).toContain('Check Enabled: enabled');
		expect(body).toContain('Check Disabled: disabled');
		expect(body).toContain('Check Unknown: not set');
		expect(body).not.toContain('[x]');
		expect(body).not.toContain('[ ]');
	});

	it('shows compact unlabeled indicators with accessible context and no indeterminate state', () => {
		const { body } = render(FieldGroupView, {
			props: {
				interactive: false,
				data: {
					check: {
						fieldName: 'Investigation',
						displayLayout: 'indicators',
						value: {
							proficiency: { fieldName: 'Proficiency', label: 'Proficiency', value: false },
							expertise: {
								fieldName: 'Expertise',
								label: 'Expertise',
								value: '',
								displayAs: 'checkbox'
							}
						}
					}
				}
			}
		});
		expect(body.match(/type="checkbox"/g)).toHaveLength(2);
		expect(body).toContain('Investigation Proficiency: disabled');
		expect(body).toContain('Investigation Expertise: not set');
		expect(body).not.toContain('indeterminate');
		expect(body).not.toMatch(/<input[^>]*\schecked(?:\s|>)/);
		expect(body).not.toMatch(/>\s*(?:Proficiency|Expertise)\s*</);
	});

	it('keeps reference stats compact even with editable primitive bindings', () => {
		const { body } = render(QuickReference, {
			props: {
				liveData: {},
				referenceData: {
					defense: {
						fieldName: 'Defense',
						value: 12,
						bindPath: ['defense'],
						capabilities: { canEditValue: true },
						interaction: { tier: 'read-first' }
					}
				}
			}
		});
		expect(body).toContain('Defense:');
		expect(body).toContain('12');
		expect(body).not.toContain('grid min-h-16');
	});

	it('keeps compact collection metadata, notes and actions while deferring long detail', () => {
		const { body } = render(GridContentListRow, {
			props: {
				presentation: 'compact',
				row: {
					key: 'sample',
					label: 'Explorer',
					detail: 'Long detail for the dialog',
					badges: ['Level 3'],
					annotations: [{ id: 'note', origin: 'user', kind: 'note', text: 'Keep track' }]
				},
				onOpenRow: () => {},
				onTogglePinRow: () => {}
			}
		});
		expect(body).toContain('Explorer');
		expect(body).toContain('Level 3');
		expect(body).toContain('1 note');
		expect(body).toContain('aria-label="Pin Explorer');
		expect(body).toContain('aria-label="View Explorer');
		expect(body).not.toContain('rounded-md border px-3 py-2');
	});
});
