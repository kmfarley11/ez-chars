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
