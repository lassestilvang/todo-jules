## 2026-04-12 - Prevent O(N) re-renders during drag-and-drop
**Learning:** `dnd-kit/sortable` triggers a re-render of the parent container on drag operations. Since `arrayMove` preserves exact object references within the array, un-memoized list items (like `SortableTaskItem`) will needlessly re-render O(N) times even though their props remain unchanged.
**Action:** Always wrap individual list item components in `React.memo()` when using `dnd-kit/sortable` to skip reconciliation for unaffected items and ensure O(1) rendering complexity.

## 2026-04-12 - Avoid silent data truncation in queries
**Learning:** Adding a `limit` to `db.query.tasks.findMany` in Server Actions without implementing a corresponding pagination strategy or UI warning causes severe functional regressions (silent data truncation), which violates the "No breaking changes" rule.
**Action:** Never optimize unbounded queries by arbitrarily capping the result set. Implement proper offset/limit or cursor-based pagination across the full stack.

## 2026-04-12 - Pruning Drizzle relations requires type verification
**Learning:** Attempting to optimize Drizzle queries by removing unused relations from the `with` clause (e.g., `subtasks: true`) can cause TypeScript compilation errors if the shared `Task` interface explicitly requires those properties.
**Action:** Always inspect the target interfaces (e.g., in `src/lib/types/index.ts`) before pruning `with` relations to ensure the optimization doesn't break type safety.
