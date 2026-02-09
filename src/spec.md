# Specification

## Summary
**Goal:** Add a subtle, shiny/animated credit label to the global app footer that matches the existing school-friendly theme.

**Planned changes:**
- Update the shared layout/footer to display the exact text "Made By Sunyad Ahmed Shrabon" on all pages where the footer appears.
- Style the credit text with a visible but subtle “shine” animation using the existing React + Tailwind CSS approach.
- Respect `prefers-reduced-motion: reduce` by disabling the animation or replacing it with a non-animated style while keeping the text readable.

**User-visible outcome:** Users see a footer credit reading "Made By Sunyad Ahmed Shrabon" on all pages, with a subtle shine effect (or a non-animated equivalent when reduced motion is enabled).
