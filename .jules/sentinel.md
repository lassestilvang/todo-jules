## 2025-05-31 - Missing Rate Limiting in Next.js Server Actions
**Vulnerability:** Next.js Server Actions lacked rate limiting, bypassing protections applied only to standard App Router API routes.
**Learning:** Next.js Server Actions can be directly invoked by clients and must have standalone rate limiting applied explicitly within each action function. Client-side logging issues are lower priority compared to functional backend vulnerabilities that allow DoS.
**Prevention:** Always ensure any public-facing server function (whether an API route or a Server Action) implements appropriate rate limiting or authentication. Use `headers()` from `next/headers` within Server Actions to retrieve the client IP for rate limiting.
