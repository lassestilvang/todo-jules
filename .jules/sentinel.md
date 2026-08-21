## 2025-05-31 - Missing Rate Limiting in Next.js Server Actions
**Vulnerability:** Next.js Server Actions lacked rate limiting, bypassing protections applied only to standard App Router API routes.
**Learning:** Next.js Server Actions can be directly invoked by clients and must have standalone rate limiting applied explicitly within each action function. Client-side logging issues are lower priority compared to functional backend vulnerabilities that allow DoS.
**Prevention:** Always ensure any public-facing server function (whether an API route or a Server Action) implements appropriate rate limiting or authentication. Use `headers()` from `next/headers` within Server Actions to retrieve the client IP for rate limiting.

## 2026-06-08 - Missing Pagination Offset Bounds
**Vulnerability:** The API route for fetching tasks allowed unbounded page parameters. Because SQLite processes OFFSET N by scanning and discarding N rows, an excessively large page number could result in high CPU utilization and a Denial of Service (DoS).
**Learning:** Always validate pagination parameters against maximum reasonable bounds or total counts to prevent offset-based database exhaustion.
**Prevention:** Calculate the maximum number of pages and clamp incoming page variables to that limit before passing to the SQL offset clause.
## 2026-07-07 - Add Cross-Origin headers for Defense in Depth against Side-Channel Attacks
**Vulnerability:** The application was missing Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy headers in `next.config.ts`. This gap left the application more vulnerable to cross-origin data leakage and side-channel attacks like Spectre.
**Learning:** Even if an application uses modern frameworks like Next.js, relying solely on default settings is insufficient. Implementing defense-in-depth measures, such as setting COOP and CORP to `same-origin`, ensures that sensitive data processed in the browser is isolated from malicious cross-origin documents.
**Prevention:** Always verify that security headers (COOP, CORP, CSP, etc.) are explicitly defined and appropriately configured for all endpoints, including static and server-rendered routes.

## 2026-08-06 - Preserve duplicate defense-in-depth security headers
**Learning:** In configuration files like `next.config.ts`, what appears to be a duplicate security header (like `Cross-Origin-Opener-Policy`) may actually be a deliberate fallback mechanism to ensure older browsers respect a less restrictive policy while newer browsers apply a more secure `same-origin` policy. Removing these perceived duplicates degrades the application's defense-in-depth posture against side-channel attacks.
**Action:** Never remove perceived duplicate security headers without fully understanding their fallback behavior. Focus strictly on adding missing protections or fixing verifiable vulnerabilities.
## 2024-05-24 - Unbounded Data Fetching in Task History
**Vulnerability:** The `getTaskHistory` server action used a `db.select().from(taskHistory).where(...).all()` query without a `.limit()` clause, returning an unbounded number of records.
**Learning:** In applications where users can rapidly generate state changes (like task updates), fetching the entire history logs can lead to memory exhaustion and server-side DoS if an attacker automates thousands of updates on a single task.
**Prevention:** Always enforce a `.limit()` clause on database queries that fetch lists of user-generated records, especially for historical or audit logs that grow linearly over time.
