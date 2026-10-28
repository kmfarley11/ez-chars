import { createResourceCatalog, type ResourceCatalog } from './resourceCatalog';

export const DND5E_2024_SRD_RESOURCE_ID = 'dnd5e-2024.srd-5-2-1';
export const DND5E_2024_GENERAL_LOCATOR_ID = 'dnd5e-2024.srd-5-2-1.general-rules';
export const DND5E_2024_ORIGIN_LOCATOR_ID = 'dnd5e-2024.srd-5-2-1.character-origins';
export const DND5E_2024_ACTIONS_LOCATOR_ID = 'dnd5e-2024.srd-5-2-1.actions';
export const DND5E_2024_EQUIPMENT_LOCATOR_ID = 'dnd5e-2024.srd-5-2-1.equipment';
export const DND5E_2024_CREATION_LOCATOR_ID = 'dnd5e-2024.srd-5-2-1.character-creation';
export const DND5E_2024_CLASSES_LOCATOR_ID = 'dnd5e-2024.srd-5-2-1.classes';
export const DND5E_2024_SPELLS_LOCATOR_ID = 'dnd5e-2024.srd-5-2-1.spells';
export const FULL_2024_SRD_PATH = '/docs/ext/5e2024/SRD_CC_v5.2.1.pdf';

// Exact one-based PDF/printed pages inspected in the adopted SRD for the proof.
// Hosted provenance, checksum, license and attribution remain in THIRD_PARTY_NOTICES.md.
const sections = [
	{
		id: DND5E_2024_GENERAL_LOCATOR_ID,
		topic: 'general-rules',
		label: 'General rules',
		description: 'Open the adopted 2024 SRD for general lookup.',
		page: 1
	},
	{
		id: DND5E_2024_ORIGIN_LOCATOR_ID,
		topic: 'character-origins',
		label: 'Character origins',
		description: 'Find species and background information.',
		page: 83
	},
	{
		id: DND5E_2024_ACTIONS_LOCATOR_ID,
		topic: 'actions',
		label: 'Actions',
		description: 'Look up actions and their timing in play.',
		page: 9
	},
	{
		id: DND5E_2024_EQUIPMENT_LOCATOR_ID,
		topic: 'equipment',
		label: 'Equipment',
		description: 'Find weapons, armor, shields and other gear.',
		page: 89
	},
	{
		id: DND5E_2024_CREATION_LOCATOR_ID,
		topic: 'character-creation',
		label: 'Character creation',
		description: 'Look up character creation and authored character details.',
		page: 19
	},
	{
		id: DND5E_2024_CLASSES_LOCATOR_ID,
		topic: 'classes',
		label: 'Classes',
		description: 'Find class and subclass information.',
		page: 28
	},
	{
		id: DND5E_2024_SPELLS_LOCATOR_ID,
		topic: 'spells',
		label: 'Spells',
		description: 'Find spellcasting rules and spell descriptions.',
		page: 104
	}
];
export const dnd5e2024ResourceCatalog = createResourceCatalog({
	version: 1,
	resources: [
		{
			id: DND5E_2024_SRD_RESOURCE_ID,
			systemId: 'dnd5e-2024',
			rulesVersion: 'SRD 5.2.1 (2024 rules)',
			title: 'System Reference Document 5.2.1',
			publisher: 'Wizards of the Coast LLC',
			delivery: 'self-hosted',
			access: 'included',
			authoritativeHref: 'https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf',
			localAssetPath: FULL_2024_SRD_PATH,
			attributionReference: 'THIRD_PARTY_NOTICES.md#system-reference-document-521',
			availability: 'available',
			pageBasis: 'pdf-and-printed-one-based'
		}
	],
	topics: sections.map((section) => ({
		id: `dnd5e-2024.${section.topic}`,
		systemId: 'dnd5e-2024',
		label: section.label,
		description: section.description,
		preferredLocatorId: section.id
	})),
	locators: sections.map((section) => ({
		id: section.id,
		resourceId: DND5E_2024_SRD_RESOURCE_ID,
		topicId: `dnd5e-2024.${section.topic}`,
		label: section.label,
		description: section.description,
		kind: 'pdf-page',
		page: section.page,
		health: 'verified'
	}))
} satisfies ResourceCatalog);
