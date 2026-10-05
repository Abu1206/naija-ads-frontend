# ADR 0002: Google sign-in and backend session cookie

- Status: accepted
- Date: 2026-10-05
- Amends: frontend auth contract in `AGENTS.md`
- Context: The product owner chose Google sign-in for Naija Ads accounts.
- Decision:
  1. The login page uses Google Identity Services to obtain a Google ID token.
  2. It sends that token and the selected first-account type (`developer` or `business`) to `POST /api/v1/auth/google`.
  3. The backend verifies the ID token and sets an HttpOnly, SameSite cookie. Frontend code must never read, persist, or return the local session token.
  4. Browser API calls include credentials; the UI reads the current user and roles from `GET /api/v1/auth/me`.
- Consequences:
  - The backend `GOOGLE_CLIENT_ID` and frontend `NEXT_PUBLIC_GOOGLE_CLIENT_ID` must be the same OAuth client ID.
  - `DASHBOARD_ORIGIN` must match the deployed dashboard origin for credentialed cross-origin requests.
