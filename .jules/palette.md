
## 2024-04-22 - Retaining visibility of conditionally hidden UI elements during async operations
**Learning:** When UI elements like edit or delete buttons are conditionally revealed on hover (e.g., using `group-hover:opacity-100`), they will disappear while an asynchronous action is executing if the user moves their cursor away. This creates a confusing UX where the user cannot see the "loading" state of the action they just triggered.
**Action:** Always bind the visibility or opacity of conditionally visible action buttons to their loading state as well (e.g., `opacity-100` if `isLoading`, else `opacity-0 group-hover:opacity-100`), ensuring the user sees visual feedback until the operation completes.
