# Specification

## Summary
**Goal:** Fix admin authorization initialization so admins who log in with the shared password can access Admin Dashboard data/actions without erroneous access-denied errors, and improve Admin Dashboard error messages to distinguish authorization failures from other failures.

**Planned changes:**
- Ensure admin sessions consistently initialize backend access control with the shared admin secret/token so admin-only backend methods (e.g., applications list and students list) succeed after Admin Login.
- Update frontend actor initialization so `_initializeAccessControlWithSecret(adminToken)` is invoked for admin sessions even when no Internet Identity identity is present (anonymous actor case), using the existing `caffeineAdminToken` URL parameter handling.
- Improve Admin Dashboard error handling for Pending Applications and Approved Students queries to show “Access denied” only for authorization errors, and otherwise show a “Could not load data” message that includes the underlying error text; log errors to `console.error`.

**User-visible outcome:** After logging in via Admin Login with the correct password, the Admin Dashboard loads Pending Applications and Approved Students (when data exists), admin actions (approve/reject/promote/demote/lock toggles) work, non-admin users remain blocked from admin-only methods, and dashboard errors are clearer and more informative.
