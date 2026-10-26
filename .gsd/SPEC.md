# Day 6 — Data Export, Import, Backup & Settings

Status: FINALIZED

## Objective

Add safe, documented data portability and strengthen the existing Settings route without creating parallel state, storage, or a backend.

## Required behavior

- Maintain one exact registry of DevTrack-owned keys with portable, clear, and sensitive policies.
- Export a versioned JSON envelope and formula-safe RFC 4180 CSV using native browser APIs.
- Treat imports as untrusted: validate all records and references, whitelist fields, preview changes, and mutate nothing before explicit confirmation.
- Support deterministic, idempotent Merge and complete Replace modes with verified multi-key writes and snapshot rollback.
- Refresh shared problem, history, settings, Dashboard, Revision, and Analytics state after restore without a page reload.
- Preserve early theme initialization and add live System-theme changes; keep the daily goal in the canonical settings object.
- Clear only exact owned keys after typed confirmation, preserve unrelated storage, and verify completion.
- Add focused portability, rollback, CSV, validation, and regression tests; run tests, lint, build, and responsive browser checks.

## Compatibility decisions

- Keep canonical problems in `devtrack:v1:problems`, revision history in `devtrack:v1:revision_history`, and preferences/daily goal in `devtrack:v1:settings`.
- Derive portable queue entries from nested problem revision state; do not add a queue key.
- Exclude `devtrack:v1:demo_auth` from backup but include it in Clear All.
- Do not claim localStorage multi-key writes are atomic; snapshot, verify, and roll back instead.
- Leave all Day 6 changes uncommitted and unpushed.
