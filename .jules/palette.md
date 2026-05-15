
## 2024-04-22 - Retaining visibility of conditionally hidden UI elements during async operations
**Learning:** When UI elements like edit or delete buttons are conditionally revealed on hover (e.g., using `group-hover:opacity-100`), they will disappear while an asynchronous action is executing if the user moves their cursor away. This creates a confusing UX where the user cannot see the "loading" state of the action they just triggered.
**Action:** Always bind the visibility or opacity of conditionally visible action buttons to their loading state as well (e.g., `opacity-100` if `isLoading`, else `opacity-0 group-hover:opacity-100`), ensuring the user sees visual feedback until the operation completes.

## 2024-05-15 - Enhancing Rapid Entry Workflows
**Learning:** In productivity apps, users frequently need to enter multiple items (like tasks) in quick succession. After successfully submitting a form, if the focus drops, the user is forced to use the mouse or manually tab back to the input to add the next item, introducing significant friction.
**Action:** When implementing rapid-entry forms (such as `AddTaskForm`), always use a `useRef` to programmatically restore focus to the primary input field immediately after a successful submission and form reset, enabling seamless continuous entry.
