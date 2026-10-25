# Day 3 — DSA Problems Management System

Status: FINALIZED

## Objective

Complete the existing local-first problems workflow without changing storage keys or destructively rewriting saved data. Preserve the established DevTrack visual system and shared state architecture.

## Required behavior

- Extend the existing problem service and normalizer for full CRUD, legacy aliases, corrupted data safety, local calendar solved dates, and `Revisit` status.
- Count a problem as completed only when its normalized status is `Solved`; dated non-solved records must not affect dashboard metrics.
- Keep the Problems page and Dashboard on the shared `ProblemsContext`, with immediate local updates and storage-event refreshes across tabs.
- Provide combined search, difficulty, topic, platform, and status filters; supported sorting; stable ordering; result counts; reset; and distinct empty states.
- Provide responsive desktop table and mobile cards, linked safe URLs, status/revision indicators, and confirmed deletion.
- Make add/edit validation accessible, retain input on errors, focus the first invalid field, warn about likely duplicates, and confirm dirty dismissal.
- Preserve reduced-motion support and use existing tokens, icons, primitives, and toasts.
- Add focused tests and execute tests, lint, build, and representative browser checks.

## Compatibility decisions

- Continue using `devtrack:v1:problems`.
- Continue using canonical `topics[]`, `solvedDate`, and nested `revision` fields. Accept `topic`, `dateSolved`, and `markedForRevision` as read/write aliases.
- Continue storing the internal status value `Todo`, display it as “To Do,” and add `Revisit`.
- Do not commit or push changes.
