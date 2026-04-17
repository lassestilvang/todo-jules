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
