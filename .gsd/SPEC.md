# Day 4 — Smart Revision Tracker

Status: FINALIZED

## Objective

Upgrade the existing revision route into a persistent, deterministic spaced-repetition workflow without disrupting the Day 1–3 dashboard or problem-management features.

## Required behavior

- Keep active queue metadata linked to the canonical problem record by ID and store append-only completed-session history independently.
- Migrate marked legacy records idempotently, preserve valid existing metadata, repair invalid schedules to tomorrow, and never overwrite corrupted storage.
- Use the fixed local-calendar interval ladder 1, 3, 7, 14, and 30 days. Complete from the actual local completion date and repeat 30-day maintenance after the final stage.
- Prevent duplicate completion of the same problem, stage, and due date; validate manual rescheduling without altering stage or completion counts.
- Compute five summary cards from saved queue and history data.
- Provide responsive queue table/cards, combined search and filters, overdue-first stable sorting, revise/reschedule/remove actions, confirmations, and distinct empty states.
- Show durable global and per-problem history, retaining snapshot titles after problem deletion.
- Keep Problems and Dashboard revision toggles synchronized through shared context and service actions.
- Preserve theme tokens, keyboard access, focus handling, reduced-motion behavior, and screen-reader announcements.
- Add focused scheduler, migration, persistence, guard, sorting, stats, and integration tests; run tests, lint, build, and UI verification where available.

## Compatibility decisions

- Continue using `devtrack:v1:problems` for problem records and active revision metadata.
- Add `devtrack:v1:revision_history` for append-only completed sessions.
- Preserve legacy nested `revision.history` arrays while migrating their entries into the independent history store exactly once.
- Keep history after queue removal or problem deletion; store `snapshotTitle` on each history record.
- Do not commit or push changes.
