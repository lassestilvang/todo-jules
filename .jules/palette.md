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
