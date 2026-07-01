## 2025-05-31 - Missing Rate Limiting in Next.js Server Actions
**Vulnerability:** Next.js Server Actions lacked rate limiting, bypassing protections applied only to standard App Router API routes.
**Learning:** Next.js Server Actions can be directly invoked by clients and must have standalone rate limiting applied explicitly within each action function. Client-side logging issues are lower priority compared to functional backend vulnerabilities that allow DoS.
**Prevention:** Always ensure any public-facing server function (whether an API route or a Server Action) implements appropriate rate limiting or authentication. Use `headers()` from `next/headers` within Server Actions to retrieve the client IP for rate limiting.

## 2026-06-08 - Missing Pagination Offset Bounds
**Vulnerability:** The API route for fetching tasks allowed unbounded page parameters. Because SQLite processes OFFSET N by scanning and discarding N rows, an excessively large page number could result in high CPU utilization and a Denial of Service (DoS).
**Learning:** Always validate pagination parameters against maximum reasonable bounds or total counts to prevent offset-based database exhaustion.
**Prevention:** Calculate the maximum number of pages and clamp incoming page variables to that limit before passing to the SQL offset clause.

## 2026-06-10 - Missing Cross-Origin Isolation Headers
**Vulnerability:** Missing Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Resource-Policy (CORP) headers in Next.js configuration.
**Learning:** To provide defense-in-depth against cross-origin and side-channel attacks like Spectre, applications must explicitly declare same-origin policies to isolate their browsing context.
**Prevention:** Always include COOP and CORP headers set to same-origin in standard security header configurations.
