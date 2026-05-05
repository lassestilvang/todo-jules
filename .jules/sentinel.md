## 2025-05-18 - Add standard HTTP security headers to next.config.ts
**Vulnerability:** Missing basic HTTP security headers.
**Learning:** Adding baseline HTTP security headers (like X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options) to `next.config.ts`'s `headers()` function provides strong, low-risk defense-in-depth against clickjacking and MIME-type sniffing. Implementing a strict Content Security Policy (CSP) carries a high risk of breaking functionality (especially in development or with certain UI libraries) unless meticulously tested, so it was purposefully omitted.
**Prevention:** Consider enforcing these standard headers early in project bootstrap and ensure automated tools or templates include basic Next.js security header configurations by default.

## 2026-04-11 - Input Validation on Integer Path Parameters
**Vulnerability:** Missing Input Validation on `[id]` Path Parameters.
**Learning:** `parseInt` can return `NaN` when provided non-numeric strings. Passing `NaN` directly to Drizzle queries (`eq(tasks.id, NaN)`) can result in undefined behavior, skipped database operations without throwing errors, or database type errors.
**Prevention:** Always immediately follow `parseInt` with an `isNaN()` check on path parameters and return a 400 Bad Request to fail securely.
## 2025-05-18 - Missing Input Validation in Server Actions (Mass Assignment)
**Vulnerability:** Server Actions in Next.js (`use server`) are publicly accessible API endpoints. Functions like `updateTask` were implicitly trusting `Partial<typeof tasks.$inferInsert>` and blindly passing it to database `update().set(data)` calls. This allows an attacker to bypass TypeScript types, inject unauthorized fields (e.g., arbitrarily overriding `id`, `listId`, or `createdAt`), and potentially cause internal 500 errors by sending invalid data types.
**Learning:** TypeScript types are erased at runtime and provide zero security for network boundaries. In Next.js App Router, every exported function in a `use server` file must be treated with the same suspicion as a REST endpoint.
**Prevention:** Always validate all incoming data to Server Actions using strict runtime schemas (like Zod) to strip unauthorized fields, and validate all ID parameters before processing.

## 2024-05-18 - Add Permissions-Policy Security Header
**Vulnerability:** The application was missing a `Permissions-Policy` header in the Next.js config, leaving powerful browser APIs (camera, microphone, geolocation) accessible to the origin.
**Learning:** Adding standard defense-in-depth security headers is crucial to restrict access to unused APIs, even if no direct exploit is present, to adhere to the principle of least privilege.
**Prevention:** Include a comprehensive set of security headers (like `Permissions-Policy`, `Strict-Transport-Security`, etc.) in the `next.config.ts` from the start of the project.
## 2026-04-17 - [MEDIUM] Add Input Length Limits to Prevent DoS
**Vulnerability:** Input fields (like descriptions and arrays of subtasks) in Zod schemas lacked maximum length boundaries, exposing the application to payload-based Denial of Service (DoS) attacks.
**Learning:** Even internal or single-user applications can suffer from memory exhaustion or database crashes if untrusted input sizes are not properly bounded before reaching ORM operations.
**Prevention:** Always append explicit `.max()` constraints to all `z.string()` and `z.array()` properties in validation schemas, unless there is a specific, well-justified reason to allow unbounded data.
## 2025-04-19 - [MEDIUM] Fix DoS risk in List API routes
**Vulnerability:** The API routes \`POST /api/lists\` and \`PUT /api/lists/[id]\` used locally defined Zod schemas without any length constraints (\`.max()\`). This could allow attackers to send excessively large payloads for list \`name\`, \`color\`, or \`emoji\` fields, potentially causing a Denial of Service (DoS) or memory exhaustion.
**Learning:** Developers sometimes duplicate simple schemas locally within API routes for convenience, but they often forget to apply strict validation rules like max limits that are centrally enforced. In Next.js, exported server actions or routes acts as public APIs and should always use strict centralized schemas.
**Prevention:** Always define validation schemas centrally (e.g. in \`src/lib/validators.ts\`) and import them into API routes. Ensure all string inputs have explicit \`.max()\` length constraints to bound payloads.

## 2024-04-20 - [MEDIUM] Unhandled Zod Validation Errors
**Vulnerability:** Next.js API endpoints (`src/app/api/tasks/route.ts` and `src/app/api/tasks/[id]/route.ts`) were using `schema.parse(body)` directly. When invalid data was submitted, it threw an unhandled Promise rejection, resulting in a 500 Internal Server Error.
**Learning:** While unhandled promise rejections are technically DoS vectors or can leak information in the default error response depending on environment configurations, using `schema.parse(body)` in a public Next.js API route completely bypasses graceful error handling for expected client input validation failures.
**Prevention:** Always use `schema.safeParse(body)` in Next.js API route handlers to gracefully handle validation failures and return a 400 Bad Request with a controlled, formatted error response instead of throwing unhandled exceptions.

## 2026-04-21 - Validate parameters manually in server actions
**Vulnerability:** Next.js server actions are public API endpoints but TypeScript types like `taskId: number` are erased at runtime.
**Learning:** Trusting TypeScript types in server actions without runtime validation allows attackers to send arbitrary types.
**Prevention:** Always use runtime checks (like `typeof id !== 'number' || isNaN(id)`) or Zod schema validation for all parameters.

## 2026-04-21 - Prevent silent string truncation in URL searchParams
**Vulnerability:** URL `searchParams.get()` returning string with trailing garbage (e.g. "123foo") is silently truncated by `parseInt()`.
**Learning:** Relying solely on `parseInt()` for URL parameter parsing can inadvertently process malformed requests silently.
**Prevention:** Compare the string representation of the parsed integer against the original string parameter (e.g., `String(parsed) !== originalParam`).

## 2026-04-21 - Prevent payload DoS from raw database queries
**Vulnerability:** Raw FTS match queries processing large user strings can cause long regex replacements and database event loop blocking.
**Learning:** Unconstrained query strings passed into database operations via API endpoints open the service up to Denial of Service (DoS) attacks.
**Prevention:** Apply a maximum character limit check on incoming query strings directly at the API edge.
## 2026-04-22 - [MEDIUM] Prevent payload DoS from raw database queries
**Vulnerability:** Unconstrained query strings passed into database operations via API endpoints open the service up to Denial of Service (DoS) attacks.
**Learning:** The `GET /api/search` endpoint accepted an arbitrarily long `query` parameter from the URL and passed it directly to an SQLite FTS5 `MATCH` query. Maliciously long queries could block the Node.js event loop due to regex replacements and exhaust database resources.
**Prevention:** Apply a strict maximum character limit check on incoming query strings directly at the API edge, immediately returning a 400 Bad Request if the limit is exceeded.

## 2026-05-18 - [MEDIUM] Server Action Payload DoS via Unbounded Arrays
**Vulnerability:** Server Actions like `reorderTasks` accepted arrays (`items: { id: number; order: number }[]`) without enforcing a maximum length.
**Learning:** In Next.js Server Actions that accept arrays as arguments (and don't strictly use bounded Zod validation), attackers can bypass client limitations and send enormously large payloads to exhaust memory or block the event loop in processing loops or database query builders.
**Prevention:** Always implement manual runtime length checks (e.g., `if (items.length > 1000)`) at the start of Server Actions to bound array sizes and prevent payload-based Denial of Service (DoS) attacks.
## 2026-04-22 - [MEDIUM] Missing Runtime Validation on primitive argument in server actions
**Vulnerability:** Next.js server actions are public API endpoints but TypeScript types like `taskId: number` or primitive array boundaries are erased at runtime.
**Learning:** Functions like `reorderTasks(items: ...)` and `getTaskHistory(taskId: number)` were implicitly trusting the array bounds and type of arguments respectively. An attacker could potentially cause memory exhaustion passing massive arrays to `reorderTasks` or crash the backend with an incorrect type in `getTaskHistory`.
**Prevention:** Always use runtime checks (like `!Number.isSafeInteger(taskId)`) and explicit length bounds (like `items.length > 1000`) for arguments directly inside Next.js server actions.
## 2024-05-01 - Dependency Audit Overrides
**Vulnerability:** Found 3 moderate vulnerabilities in `esbuild` and `postcss` development dependencies during `pnpm audit`.
**Learning:** For resolving dependency issues via overrides in `pnpm`, it is necessary to use `"pnpm": { "overrides": { ... } }` in the root `package.json`. Avoid using `pnpm-workspace.yaml` as it is not processed for overrides by pnpm natively on mono-root setups without specific configurations, and never manually modify the auto-generated `pnpm-lock.yaml`.
**Prevention:** In the future, use `pnpm audit --fix` to inject overrides automatically into `package.json`, or manually add the `"pnpm": { "overrides": {} }` object in `package.json` to manage vulnerable deep dependencies cleanly.
## 2026-05-04 - [Content Security Policy]
**Vulnerability:** Missing Content Security Policy (CSP) headers, which help prevent Cross-Site Scripting (XSS), clickjacking, and other code injection attacks.
**Learning:** CSP is an important defense-in-depth mechanism that is missing by default in Next.js applications unless explicitly added in next.config.ts headers.
**Prevention:** Always ensure a baseline CSP is configured in Next.js via next.config.ts headers, and aim to harden it by removing 'unsafe-inline' and 'unsafe-eval' as the application matures.
## 2025-05-18 - Missing Input Validation in Server Actions (Mass Assignment)
**Vulnerability:** Server Actions in Next.js (`use server`) are publicly accessible API endpoints. Functions like `updateTask` and `createTask` were blindly passing validated data directly to database `insert().values()` and `update().set()` calls. Because the validation schemas (`updateTaskSchema`, `createTaskSchema`) also included nested relational array fields (like `subtasks`, `labels`, `reminders`), malicious or valid payloads containing these arrays would be incorrectly passed as column values to the SQLite query builder, causing "FOREIGN KEY constraint failed" or SQLite schema errors depending on the exact payload.
**Learning:** Even when using Zod validation (`.safeParse()`), the resulting data object may still contain nested properties intended for relational operations, not direct table inserts. Blindly passing this object to Drizzle's `.values()` or `.set()` for a single table can crash the application or open mass assignment vectors.
**Prevention:** Always explicitly destructure and extract only the properties intended for the specific table operation (e.g., `const { subtasks, labels, ...taskData } = validatedData`) before passing the object to `.values()` or `.set()`.
## 2024-05-04 - [Fix SQLite FTS5 MATCH Syntax Error/DoS]
**Vulnerability:** The `/api/search` route passed un-sanitized user input directly into an SQLite FTS5 `MATCH` query using the Drizzle `sql` tag. While Drizzle's `sql` tag parameterized the value to prevent traditional SQL injection, it did not prevent FTS5 syntax errors. Inputs containing special characters like `-`, `^`, or unclosed quotes could cause the FTS engine to throw an error, leading to a 500 Internal Server Error and potential Denial of Service (DoS) if repeatedly triggered.
**Learning:** Parameterization prevents SQL injection but does not protect against domain-specific syntax errors (like FTS5 `MATCH` expressions) that are evaluated within the database engine itself. FTS input must be treated as a domain-specific language and sanitized accordingly. Additionally, checking for empty strings after sanitization is necessary to prevent invalid empty `MATCH` queries.
**Prevention:** Always sanitize FTS search inputs by stripping special FTS control characters (e.g., using `query.replace(/[^a-zA-Z0-9\s]/g, '')`) before constructing the query.
## 2026-05-18 - Missing Input Validation in API Route (Mass Assignment)
**Vulnerability:** API routes in Next.js (`src/app/api/tasks/[id]/route.ts`) were blindly passing validated data directly to database `update().set()` calls. Because the validation schemas (`updateTaskSchema`) also included nested relational array fields (like `subtasks`, `labels`, `reminders`, `attachments`), malicious or valid payloads containing these arrays would be incorrectly passed as column values to the SQLite query builder.
**Learning:** Even when using Zod validation (`.safeParse()`), the resulting data object may still contain nested properties intended for relational operations, not direct table updates. Blindly passing this object to Drizzle's `.set()` for a single table can crash the application or open mass assignment vectors.
**Prevention:** Always explicitly destructure and extract only the properties intended for the specific table operation (e.g., `const { subtasks, labels, reminders, attachments, ...taskData } = validatedData;`) before passing the object to `.set()`.
