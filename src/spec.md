# Specification

## Summary
**Goal:** Add admin-controlled locking for Class 8 (DOLON) content (master/section/item), show lock status throughout the UI with enforced edit restrictions, and introduce a new premium post-login Home dashboard for all authenticated users.

**Planned changes:**
- Implement backend lock state storage and admin-only APIs to read/update: master lock, per-section locks (Notices, Homework, Routine, Class Time), and per-item locks for entries in those sections.
- Enforce locks server-side for all create/update/delete mutations for Notices, Homework, Class Routine, and Class Time; return clear lock-related errors when blocked.
- Ensure editor permissions remain admin-managed and do not bypass locks (locks take precedence over editor status).
- Add an Admin Lock Control Dashboard inside the existing `/admin` route with master/section/item lock toggles, showing current status and success/error toasts (English), and restricting visibility/access to admins only.
- Display section-level and item-level lock indicators (🔒/🔓) across Notices, Homework, Class Routine, and Class Time pages, including greyed-out locked items, disabled edit controls, and the tooltip text: “This section is locked by admin.”
- Create a new premium dashboard-style Home page (e.g., `/home`) as the primary post-login landing page for all authenticated roles (Admin/Student/Visitor), and update navigation accordingly.
- On Home, show welcome text + user role, latest notices preview, today’s routine (with friendly empty state), and quick-access cards to Notices/Homework/Routine; add Admin-only cards for pending approvals, lock overview, and quick shortcuts.
- Integrate lock state fetching/mutations with React Query (including periodic refetch and invalidation) so lock indicators and disabled controls stay current and handle stale-edit errors gracefully with English messaging.

**User-visible outcome:** Admins can lock/unlock Class 8 (DOLON) editing globally, per section, or per item from the Admin Dashboard, and everyone sees clear lock indicators with editing controls disabled when locked; after login, all authenticated users land on a new Home dashboard showing key class summaries and quick navigation (with extra admin-only overview cards).
