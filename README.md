Secure Auth 
A production-ready, highly secure authentication system built with Next.js 16, Auth.js v5 (Beta), and Prisma 7. This project goes beyond standard login/signup by implementing a multi-layered defense strategy against common web vulnerabilities.

Security Features

1. Bot Protection (Honeypot Trap)
Strategy: Implements an invisible "trap" field within the login form.

Mechanism: Bots automatically fill all visible fields in the DOM. Any request containing data in this hidden field is rejected instantly by the authorize callback before reaching the database.

Benefit: Zero friction for humans, high friction for automated scripts.

2. Dual-Guard Rate Limiting
Strategy: Independent tracking of attempts by IP Address and Email.

Mechanism:

IP Guard: Prevents large-scale credential stuffing from a single source.

Email Guard: Prevents targeted brute-force attacks on specific user accounts.

Implementation: Uses a high-performance in-memory Singleton (optimized for single-node VPS deployment) with a sliding window expiration.

3. OAuth Hijacking Prevention
Strategy: Strict account linking policy.

Mechanism: * allowDangerousEmailAccountLinking is disabled.

Explicitly denies Google Sign-In if the email is already registered via the MANUAL (Credentials) provider.

Benefit: Prevents attackers from gaining access to an existing account by creating a social login with a matching email.

4. Role Escalation & Stale Session Defense
Strategy: Jittered JWT Verification.

Mechanism: The system performs periodic, randomized database checks (every 5-6 minutes) within the JWT callback.

Benefit: Ensures that if a user's role is changed or their account is Deactivated, they are kicked out of the system almost instantly, even if their JWT hasn't expired.

5. Secure Data Access Layer
Strategy: Server-side "Freshness Checks."

Mechanism: Critical administrative actions (e.g., moderatePost) perform a direct database query for the user's isActive status and role before execution, bypassing the JWT state entirely for high-stakes operations.

6. Content Security Policy (CSP)
Strategy: Strict Content Security Policy with dynamic nonce generation.

Mechanism: A random nonce is generated for each request and included in the Content-Security-Policy header.

Benefit: Prevents Cross-Site Scripting (XSS) attacks by ensuring scripts are only executed from trusted sources.

🛠️ Tech Stack
Framework: Next.js 16 (App Router)

Auth: Auth.js v5 (NextAuth)

ORM: Prisma 7 (with Singleton Pattern)

Database: PostgreSQL

Security Testing: OWASP ZAP & Burp Suite