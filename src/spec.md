# Specification

## Summary
**Goal:** Restore correct admin authorization and ensure student applications/approvals and student login work end-to-end.

**Planned changes:**
- Fix Admin shared-password session/identity handling so admin-only backend methods succeed and the Admin Dashboard can load data for real admins.
- Ensure Student Apply submissions reliably create backend pending application records and appear in the Admin Dashboard Pending Applications list (with visible English errors if loading fails).
- Fix the approval pipeline so approving a student completes successfully (remove any broken principal-generation behavior), updates pending/approved lists correctly, and allows approved students to log in with their submitted credentials.
- Improve Admin Dashboard error messaging to distinguish true unauthorized states from other load failures, showing clearer English guidance and the underlying error message for debugging.

**User-visible outcome:** Admins can log in via the shared password and use the Admin Dashboard without misleading “Access Denied/I am not admin” errors, see new student applications, approve them successfully, and approved students can log in and reach the correct pages based on approval status.
