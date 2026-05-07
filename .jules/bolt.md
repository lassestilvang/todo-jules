## 2026-06-03 - Separate Optimistic UI updates from Server Actions in startTransition

**Learning:** React's `startTransition` expects a synchronous callback for immediate state updates. When combining optimistic UI updates (e.g., using `useOptimistic`) with asynchronous server actions, any state updates or asynchronous operations after an `await` lose the transition context and delay the UI's perceived responsiveness.

**Action:** Split the logic into two distinct `startTransition` calls: a synchronous one for `setOptimisticState` to ensure the UI reacts instantly, and a separate asynchronous one for the server action to maintain the pending state and track the operation's duration.
