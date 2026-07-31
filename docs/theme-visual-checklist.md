# Theme Visual Checklist

Run this quick check before deploy when touching theme or UI colors.

## 1) Theme switch behavior

- Switch through every available theme in the desktop navbar selector:
  `Seafarer`, `Verdant Wilds`, `Ember Dusk`, `Rose Court`, and `Arcane Veil`.
- Reload after each theme change and confirm the selected theme persists.
- Hard refresh after each theme change and confirm the page paints in the saved theme on first load.
- Repeat on mobile using collapsed right menu theme actions.

## 2) Core surface contrast

- Navbar text and icons are readable in all themes.
- Menu popups are readable in all themes.
- Table header and row hover states are readable in all themes.

## 3) Interaction states

- Hover states on primary links are visible and on-theme.
- Button outlines remain visible against navbar and page surfaces.
- Dialog backdrop and dialog body maintain clear separation.

## 4) Responsive checks

- Verify navbar at desktop width.
- Verify navbar around small/tablet breakpoint.
- Verify mobile menu opens, actions are fully clickable, and active theme label appears.

## 5) Field interaction checks

- Runtime/state inline edit buttons are keyboard focusable and visibly focused.
- Activating an inline edit button moves focus into the input and selects the current value.
- Enter saves single-line inline edits; Escape cancels and returns focus to the originating edit button.
- Inline Notes buttons are keyboard focusable, open in read mode first, and return focus to the originating button when closed.
- Card actions are available through a compact, always-visible menu with `Edit` and `Notes` items.
- Card `Notes` dialogs show existing field notes first and expose `Add` or `Edit` actions for fields with editable annotation paths.
- Touch users can open edit, notes, and card fallback controls without hover-only gestures.
- Reference/profile field text, spell names, feature names, item names, and note text remain selectable and copyable without entering edit mode.
- Runtime/state primitive fields render inside their cards rather than as separate adjacent controls, while preserving the same keyboard and touch edit behavior.
- Card-wide `Edit` remains available as a value/structure fallback for card fields, while annotation add/edit flows live in note dialogs where equivalent annotation paths exist.

## 6) Accessibility & Mobile

- At a phone-sized viewport with a coarse pointer, verify visible navigation, sheet-region, edit, annotation, card-menu, dialog, spell, inventory, runtime-action, and source-picker controls provide comfortable 44x44px targets without overlapping adjacent actions.
- Confirm compact actions enlarge only their interactive owners: passive rows/cards remain unsized, while dense spell, feature, trait, inventory, and runtime collections wrap without clipped text, obscured controls, or accidental neighboring activation.
- For every checkbox and radio, tap the associated text and surrounding label area—not only the native input—and confirm the named choice changes. The visible native control may remain smaller than 44px when its label supplies the full hit area.
- Check inline reference and attribution links remain visibly identifiable, keyboard focusable, and separable from adjacent prose without being forced into block-sized boxes.
- Traverse the home-to-sheet flow with the keyboard. Confirm visible focus follows the reading/task order, collapsed or responsive-hidden content is skipped, and no positive `tabindex` or visually contradictory order appears.
- Open card menus and dialogs from several sheet depths. Confirm menu Escape returns focus to the invoker, modal focus does not reach background controls, closing restores the invoker, and background document scrolling remains locked without changing sheet position.
- In the runtime-action multi-step dialog, move forward and back and confirm each step announces or focuses its contextual heading while preserving the documented draft behavior.
- Use a screen reader for representative region headings, card actions, annotation controls, source candidates, and associated-label choices; confirm names and reading order communicate the same task order shown visually.
- Record any below-baseline control only under an approved inline-flow, associated-label, or equivalent-action exception in `docs/accessibility-control-audit.md`; visual density alone is not an exception.
