## 2025-01-20 - Configurable Empty State Copy
**Learning:** Reusable components like lists and tables often contain empty state subtext (e.g., "Add a task below"). This instructional copy becomes confusing and disorienting on pages where the referenced form or call-to-action does not exist (like read-only "Upcoming" views).
**Action:** Always make directional empty state subtext configurable via props rather than hardcoding it into the component, ensuring the copy accurately reflects the capabilities of the specific page context.

## 2026-06-13 - Add Clear Search Button to Empty State
**Learning:** Users encountering an empty search result state often want to start over. Forcing them to manually clear the search bar or URL query parameters creates friction.
**Action:** Always include an actionable 'Clear Search' button or link in empty state components for search or filter interfaces, returning users directly to the base route.

## 2025-01-20 - Global Keyboard Shortcuts in Forms
**Learning:** Implementing global keyboard shortcuts (like `/` to focus search) using `react-hotkeys-hook` can unintentionally interfere with user input in other form fields (e.g., typing a date or URL in a description).
**Action:** When implementing global keyboard shortcuts to focus primary form inputs using `react-hotkeys-hook`, always use `{ enableOnFormTags: false }` to prevent triggering the shortcut while typing in other fields.
## 2026-06-22 - Screen Reader Context for State Transitions
**Learning:** When displaying state changes using visual symbols like arrows, screen readers may read it confusingly or out of context.
**Action:** Always prepend old and new values with descriptive screen-reader-only text (e.g., 'changed from', 'to') and hide visual transition symbols using `aria-hidden="true"` to provide clear context.

## 2026-06-24 - Redundant sr-only Tags in Nested Transitions
**Learning:** When creating accessible transitions or status changes containing old and new values, using redundant `<span className="sr-only">`/aria tags inside and outside the old/new values (e.g., nesting "changed from" inside "changed from") causes screen readers to redundantly announce "changed from changed from".
**Action:** Ensure these `sr-only` tags are not redundantly duplicated inside nested elements to prevent screen readers from stuttering and announcing duplicated conversational context text.

## 2026-10-25 - Native HTML Accessibility for Keyboard Shortcuts
**Learning:** Providing custom keyboard shortcuts (like `/` for search, `n` for adding tasks, or `Meta+Enter` for form submission) is a great power-user UX feature. However, using generic `<kbd>` visual hints with conditional `aria-describedby` rendering can cause screen readers to announce the shortcut out of context, creating confusion.
**Action:** Always apply the native `aria-keyshortcuts` HTML attribute directly to the focusable `<input>` or `<button>` elements that trigger the shortcut. This provides proper semantic context, ensuring screen readers accurately announce the available shortcut directly when the element receives focus.
## 2026-06-25 - Semantic Theme Variables for State
**Learning:** When indicating semantic state in UI components, avoid hardcoding specific Tailwind color shades (e.g., text-red-400, text-green-500), as they often fail color contrast requirements across different themes (like dark mode) and break design system consistency.
**Action:** Always use semantic theme variables (e.g., text-destructive, text-muted-foreground, text-foreground).

## 2026-10-26 - Consolidate Multiple ARIA Key Shortcuts
**Learning:** When assigning multiple keyboard shortcuts to an element via `aria-keyshortcuts`, duplicating the prop violates ARIA specifications and breaks React linting (react/jsx-no-duplicate-props).
**Action:** Always use a single space-separated string (e.g., `aria-keyshortcuts="n Alt+N"`) rather than duplicating the prop.
## 2025-01-20 - Combine Multiple aria-keyshortcuts
**Learning:** When assigning multiple keyboard shortcuts to an element via `aria-keyshortcuts`, duplicating the prop violates ARIA specifications and breaks React linting.
**Action:** Always use a single space-separated string (e.g., `aria-keyshortcuts="n Alt+N"`) rather than duplicating the prop.
## 2024-07-13 - Multiple ARIA Keyboard Shortcuts
**Learning:** When assigning multiple keyboard shortcuts to an element via `aria-keyshortcuts`, the ARIA specification requires them to be provided as a single space-separated string (e.g., `aria-keyshortcuts="n Alt+N"`), rather than duplicating the prop on the element, which breaks React linting and accessibility parsing.
**Action:** Always combine multiple keyboard shortcuts into a single `aria-keyshortcuts` attribute string to ensure proper screen reader announcement and avoid linting errors.
## 2024-07-12 - Fix Keyboard Hint Interaction & ARIA Shortcuts
**Learning:** React linting throws errors when duplicate `aria-keyshortcuts` are added to elements, they should be combined into a space-separated string (e.g. `aria-keyshortcuts="n Alt+N"`). Additionally, `<kbd>` absolute overlays on buttons block mouse clicks and prevent interaction.
**Action:** Use a single `aria-keyshortcuts` string, and always apply `pointer-events-none` to visual hints (like `<kbd>`) that are placed absolutely over interactive input elements or buttons.
## 2024-07-10 - Space-separated aria-keyshortcuts
**Learning:** When assigning multiple keyboard shortcuts to an element using aria-keyshortcuts, passing duplicate props breaks the build and linting. Instead, native aria-keyshortcuts supports multiple shortcuts via a space-separated string (e.g., 'n Alt+N'). Also, visually positioned keyboard hints (<kbd>) over inputs should have 'pointer-events-none' to prevent click interception.
**Action:** Use a single space-separated string for multiple shortcuts in aria-keyshortcuts and add pointer-events-none to overlaid visual hints.

## 2025-01-20 - Screen Reader Context for Semantic Colors
**Learning:** When using semantic colors to visually indicate a state change (e.g., turning text red for an overdue status), ensure the context is accessible to screen readers by conditionally updating the associated screen-reader-only text (e.g., changing 'Deadline:' to 'Overdue deadline:').
**Action:** Always ensure the context is accessible to screen readers by conditionally updating the associated screen-reader-only text when the visual state changes.
## 2026-10-27 - Screen Reader Context for Semantic State
**Learning:** When using semantic colors to visually indicate a state change (like turning text red for an overdue status), screen reader users miss this context if the screen-reader-only text remains static.
**Action:** Always conditionally update the associated screen-reader-only text (e.g., changing 'Deadline:' to 'Overdue deadline:') to provide accessible context that matches the visual semantic color state change.
## 2025-01-20 - Semantic Color State Screen Reader Context
**Learning:** When using semantic colors to visually indicate a state change (e.g., turning text red for an overdue status), the context is lost for visually impaired users relying on screen readers.
**Action:** Ensure the context is accessible to screen readers by conditionally updating the associated screen-reader-only text (e.g., changing 'Deadline:' to 'Overdue deadline:').

## 2026-10-28 - aria-atomic on Character Counters
**Learning:** When using `aria-live` to announce character limits or counters (e.g., '123/500'), screen readers may incorrectly announce only the individual changed characters rather than the full updated context if `aria-atomic` is not used.
**Action:** Always apply `aria-atomic="true"` when using `aria-live` on character counters to ensure the full updated context is announced.
