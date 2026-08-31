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
## 2026-10-28 - Screen Reader Context for Character Limits
**Learning:** When using aria-live to announce character limits or counters (e.g., '123/500'), screen readers may incorrectly announce only the individual changed characters rather than the full updated context if aria-atomic is not set.
**Action:** Always apply aria-atomic="true" along with aria-live when announcing dynamic text updates like character counters to ensure the screen reader reads the full updated context.

## 2024-07-25 - aria-atomic for Character Limits
**Learning:** When using `aria-live` to announce character limits or counters (e.g., '123/500'), screen readers may incorrectly announce only the individual changed characters rather than the full updated context without `aria-atomic="true"`.
**Action:** Always apply `aria-atomic="true"` alongside `aria-live` for character counters to ensure the complete string is read to the user.
## 2026-10-28 - aria-atomic on Character Counters
**Learning:** When using `aria-live` to announce character limits or counters (e.g., '123/500'), screen readers may incorrectly announce only the individual changed characters rather than the full updated context if `aria-atomic` is not used.
**Action:** Always apply `aria-atomic="true"` when using `aria-live` on character counters to ensure the full updated context is announced.

## 2026-10-29 - Semantic Colors for Headers
**Learning:** Hardcoding grayscale tailwind utility classes (e.g., bg-gray-800, text-white) in headers prevents them from matching the design system and failing contrast in different themes.
**Action:** When styling headers, always use semantic theme variables (e.g., bg-card, text-card-foreground) instead of specific gray shades.
## 2024-10-27 - Remove directional copy from empty state subtext
**Learning:** Hardcoding directional copy (like "below") in default props for reusable empty state components creates confusing UX when the component is rendered on pages that don't have the referenced element (like a form) nearby.
**Action:** When designing reusable empty state components, default to non-directional copy to ensure the component remains context-independent.

## 2026-10-25 - Custom Next.js 404 page
**Learning:** The default unstyled 404 page in Next.js applications provides a poor user experience, lacking context or a way for users to return to the active application.
**Action:** Always implement a custom `src/app/not-found.tsx` containing a branded empty state, descriptive copy, and a clear call-to-action (like returning to the home page).
## 2026-08-08 - Branded Custom 404 Page
**Learning:** Next.js default 404 pages are unstyled and provide a poor user experience that breaks out of the application's design system. Creating a custom `src/app/not-found.tsx` allows you to provide a branded, themed empty state with actionable recovery links.
**Action:** When working in Next.js App Router applications, always implement a custom `not-found.tsx` empty state that uses the project's semantic theme variables and includes a clear call-to-action (like returning home) to prevent dead-end user experiences.
## 2026-08-05 - Custom 404 Pages for App Router
**Learning:** Next.js App Router applications provide an unstyled, generic 404 page by default if `not-found.tsx` is omitted. This creates a jarring UX when users hit a broken link or an invalid URL.
**Action:** Always implement a custom `src/app/not-found.tsx` in Next.js applications containing a branded empty state and a clear call-to-action (like returning to the home page) to provide a better user experience.
## 2024-11-20 - Custom Not Found Page
**Learning:** By default, Next.js provides a plain, unbranded 404 page. Navigating to a non-existent URL is jarring if it breaks the applications design system.
**Action:** To improve UX in a Next.js App Router application, implement a custom `src/app/not-found.tsx` containing a branded empty state and a clear call-to-action (like returning to the home page).
## 2024-08-02 - Hide Shortcut Hints on Button Focus
**Learning:** Adding global keyboard shortcut hints (like `<kbd>Cmd+Enter</kbd>`) as absolute overlays on action buttons provides helpful power-user discoverability. However, when keyboard users naturally tab to the button, the `<kbd>` element remains visible on top of the focus state, creating visual clutter and confusing redundancy (since they can just press 'Enter' directly when focused).
**Action:** When placing visual `<kbd>` shortcut hints on interactive buttons, always add the `group` class to the button and use `group-focus-visible:opacity-0 group-focus-within:opacity-0` (or similar focus-based utility classes) on the hint to gracefully fade it out when the button receives focus.
## 2024-05-15 - ARIA label on Icon-only Theme Toggle
**Learning:** Icon-only buttons without an explicit accessible label create a confusing experience for screen reader users, as the underlying SVG typically has `aria-hidden="true"` resulting in an unlabeled interactive element.
**Action:** Always add an `aria-label` directly to `<Button size="icon">` components.

## 2026-10-30 - Redundant sr-only in aria-labeled buttons
**Learning:** Placing a `<span className="sr-only">` inside a button that already has an explicit `aria-label` attribute creates redundant text. Screen readers may announce the text twice (e.g., "Toggle theme, button, Toggle theme"), creating a stuttering effect that harms accessibility.
**Action:** When a button or interactive element has a comprehensive `aria-label`, avoid nesting additional `sr-only` descriptive text within it to ensure a clean, singular screen reader announcement.
## 2026-08-29 - Native Title Attribute for Truncated Text
**Learning:** When visually truncating text in UI components using CSS classes like `truncate` or `line-clamp-*`, users are unable to read the full content, which creates a frustrating UX, especially for important information like task descriptions or long list names.
**Action:** Always add a native HTML `title` attribute containing the full text to the truncated element to ensure users can read the complete content on hover via the OS-level tooltip.

## 2024-11-20 - Tooltips for Truncated Text
**Learning:** When visually truncating text in UI components using CSS classes like `truncate` or `line-clamp-*`, users may not be able to read the complete content.
**Action:** Always add a native HTML `title` attribute containing the full text to the element to ensure users can read the complete content on hover.
## 2024-05-14 - Add hover titles to truncated text
**Learning:** When text is truncated using CSS classes like `truncate` or `line-clamp-*`, users cannot read the full content.
**Action:** Always add a native HTML `title` attribute containing the full text to the truncated element to ensure users can read the complete content on hover as an OS-level tooltip.
## 2024-08-25 - Playwright Screenshots & Native Tooltips
**Learning:** When visually verifying frontend changes using Playwright, tooltips generated by native HTML `title` attributes are OS-level overlays and will not reliably appear in DOM screenshots.
**Action:** Verification should rely on asserting the presence of the DOM attribute or taking a general view screenshot rather than expecting to capture the tooltip visually in Playwright.
## $(date +%Y-%m-%d) - Native Tooltips for Truncated Text
**Learning:** When visually truncating text in UI components using CSS classes like `truncate` or `line-clamp-*`, users lose access to the full content if they cannot hover to reveal it.
**Action:** Always add a native HTML `title` attribute containing the full text to visually truncated elements to ensure users can read the complete content on hover.
## $(date +%Y-%m-%d) - Add Tooltips to Truncated Elements
**Learning:** Truncating text with CSS (e.g., `truncate` or `line-clamp-*`) makes interfaces look clean but hides information. Missing native `title` attributes on truncated elements degrades usability.
**Action:** When applying truncation classes, always add a native HTML `title` attribute with the full text to ensure users can access the complete information via hover.
