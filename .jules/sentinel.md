## 2026-04-11 - Input Validation on Integer Path Parameters
**Vulnerability:** Missing Input Validation on `[id]` Path Parameters.
**Learning:** `parseInt` can return `NaN` when provided non-numeric strings. Passing `NaN` directly to Drizzle queries (`eq(tasks.id, NaN)`) can result in undefined behavior, skipped database operations without throwing errors, or database type errors.
**Prevention:** Always immediately follow `parseInt` with an `isNaN()` check on path parameters and return a 400 Bad Request to fail securely.
