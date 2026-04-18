## 2024-04-13 - Add Loading Spinners to Form Submit Buttons
**Learning:** Adding a simple visual loading indicator (like a spinner) to submit buttons during async operations significantly improves perceived performance and user confidence, confirming that their action was registered while waiting for the server response.
**Action:** When creating new forms or async actions, always include a visual loading state on the primary submit button, typically by disabling the button and showing a spinner alongside the loading text.
## 2024-04-18 - Required Indicators on Forms
**Learning:** Adding semantic visual indicators (like an asterisk) to `<Label>` components directly mapping to underlying `<Input required />` elements improves basic form UX and validates without breaking ARIA.
**Action:** When the HTML5 `required` attribute is present on an input, always add a visually distinct indicator with `aria-hidden="true"` to the associated label to provide upfront guidance without duplicate screen reader announcements.
