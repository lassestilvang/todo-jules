## 2025-05-18 - Add standard HTTP security headers to next.config.ts
**Vulnerability:** Missing basic HTTP security headers.
**Learning:** Adding baseline HTTP security headers (like X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options) to `next.config.ts`'s `headers()` function provides strong, low-risk defense-in-depth against clickjacking and MIME-type sniffing. Implementing a strict Content Security Policy (CSP) carries a high risk of breaking functionality (especially in development or with certain UI libraries) unless meticulously tested, so it was purposefully omitted.
**Prevention:** Consider enforcing these standard headers early in project bootstrap and ensure automated tools or templates include basic Next.js security header configurations by default.
