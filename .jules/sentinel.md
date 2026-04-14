## 2025-05-18 - Add standard HTTP security headers to next.config.ts
**Vulnerability:** Missing basic HTTP security headers.
**Learning:** Adding baseline HTTP security headers (like X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options) to `next.config.ts`'s `headers()` function provides strong, low-risk defense-in-depth against clickjacking and MIME-type sniffing. Implementing a strict Content Security Policy (CSP) carries a high risk of breaking functionality (especially in development or with certain UI libraries) unless meticulously tested, so it was purposefully omitted.
**Prevention:** Consider enforcing these standard headers early in project bootstrap and ensure automated tools or templates include basic Next.js security header configurations by default.

## 2026-04-11 - Input Validation on Integer Path Parameters
**Vulnerability:** Missing Input Validation on `[id]` Path Parameters.
**Learning:** `parseInt` can return `NaN` when provided non-numeric strings. Passing `NaN` directly to Drizzle queries (`eq(tasks.id, NaN)`) can result in undefined behavior, skipped database operations without throwing errors, or database type errors.
**Prevention:** Always immediately follow `parseInt` with an `isNaN()` check on path parameters and return a 400 Bad Request to fail securely.
