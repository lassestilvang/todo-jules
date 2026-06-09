
## 2024-04-22 - Retaining visibility of conditionally hidden UI elements during async operations
**Learning:** When UI elements like edit or delete buttons are conditionally revealed on hover (e.g., using `group-hover:opacity-100`), they will disappear while an asynchronous action is executing if the user moves their cursor away. This creates a confusing UX where the user cannot see the "loading" state of the action they just triggered.
**Action:** Always bind the visibility or opacity of conditionally visible action buttons to their loading state as well (e.g., `opacity-100` if `isLoading`, else `opacity-0 group-hover:opacity-100`), ensuring the user sees visual feedback until the operation completes.

## 2024-05-15 - Enhancing Rapid Entry Workflows
**Learning:** In productivity apps, users frequently need to enter multiple items (like tasks) in quick succession. After successfully submitting a form, if the focus drops, the user is forced to use the mouse or manually tab back to the input to add the next item, introducing significant friction.
**Action:** When implementing rapid-entry forms (such as `AddTaskForm`), always use a `useRef` to programmatically restore focus to the primary input field immediately after a successful submission and form reset, enabling seamless continuous entry.

## 2024-05-18 - Adding Context to Destructive Actions
**Learning:** Native `window.confirm` dialogs often lack context. When a user is performing a destructive action (like deleting a task or list), a generic message like "Are you sure you want to delete this?" can cause hesitation, especially if the user clicked quickly or the UI shifted.
**Action:** Always interpolate the specific name or title of the item being deleted into the confirmation message (e.g., `Are you sure you want to delete the task "${task.name}"?`) to provide clear, cognitive reassurance and prevent accidental deletions.

## 2024-06-03 - Textarea Resizing with Absolute Children
**Learning:** When designing form textareas that contain absolute-positioned child elements (such as character counters) inside their wrappers, allowing manual resizing by users can break the layout or cause overlaps.
**Action:** Always apply `resize-none` to the textarea to restrict manual resizing, preventing layout breakage and overlap with the absolute-positioned child elements, while still allowing the input area to be expanded programmatically if necessary.

## 2026-06-07 - Dynamic Character Counter Color
**Learning:** Character limit counters that only update a number can be easily missed by users typing quickly. Adding dynamic, peripheral visual feedback (like changing color to amber then red as the limit approaches) significantly improves the UX of constrained input fields.
**Action:** When implementing character limit counters, always use dynamic CSS classes to change the text color (e.g., to amber at 80% capacity, and destructive red at 95%) to provide immediate, peripheral visual feedback.
