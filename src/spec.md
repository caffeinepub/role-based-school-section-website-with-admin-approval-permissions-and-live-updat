# Specification

## Summary
**Goal:** Simplify Admin Dashboard error handling by hiding verbose technical/admin-check messaging and preventing non-admin sessions from triggering admin-only data fetches.

**Planned changes:**
- Update Admin Dashboard error UI to remove “Service Temporarily Unavailable” / canister-stopped blocks and hide verbose technical details from end users while still logging full errors to the browser console.
- Replace any user-facing “Access Denied” / admin-authorization-check wording with neutral, generic English error messages and a Retry button.
- Gate admin-only queries so they only run on admin-only UI surfaces (e.g., don’t run `useGetAllApplications()` on Home for Student/Visitor sessions; keep existing admin behavior intact).

**User-visible outcome:** Admin pages show short, neutral error messages with a Retry option instead of technical dumps or admin-check wording, and non-admin users no longer trigger admin-only loading/errors on the Home page.
