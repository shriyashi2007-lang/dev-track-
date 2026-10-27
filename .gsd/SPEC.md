# Day 7 — Code Quality, Testing, Accessibility & Performance

Status: FINALIZED

## Objective

Stabilize the completed local-first frontend before backend work without adding product features, changing storage keys, or redesigning the application.

## Required behavior

- Preserve corrupted raw storage while loading safe in-memory defaults and surfacing a non-blocking warning.
- Normalize legacy optional fields additively and keep local-calendar date calculations deterministic.
- Lock high-risk behavior with meaningful tests, including storage corruption and shared overlay focus.
- Fix semantic naming, announcements, headings, table headers, focus trapping, and trigger restoration without changing the visual design.
- Keep route-level code splitting, reduced motion, empty states, and chart text alternatives intact.
- Isolate DevTrack quality tooling from nested workspaces and provide deterministic `lint`, `test:run`, and `build` commands.
- Measure production bundles and representative 2,000-record calculations before claiming performance readiness.

## Compatibility decisions

- Keep all five Day 6 owned-key policies and stored shapes unchanged.
- Prefer narrow regression-backed fixes over cross-cutting rewrites.
- Retain the existing manual accessibility audit instead of adding another lint dependency.
- Leave all Day 7 changes uncommitted and unpushed.
