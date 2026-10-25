# DevTrack Day 3: Problem Management System

Day 3 completes the core problem-management workflow while keeping the existing local-storage schema compatible with earlier DevTrack data.

## Delivered behavior

- Create, edit, delete, select, and bulk-update coding problems.
- Track **To Do**, **Attempted**, **Solved**, and **Revisit** statuses.
- Search titles and combine difficulty, topic, platform, status, and revision filters.
- Sort results with stable ordering and switch between table and board views.
- Use responsive problem cards on smaller screens and safe external problem links.
- Confirm destructive actions and protect unsaved drawer changes.
- Keep dashboard totals, charts, heatmaps, recent solves, and streaks limited to solved records.
- Synchronize problem changes between open browser tabs.

## Data compatibility

Problems remain stored under `devtrack:v1:problems`. DevTrack accepts the Day 3 aliases `topic`, `dateSolved`, and `markedForRevision`, then normalizes them into the canonical `topics`, `solvedDate`, and `revision.marked` fields.

Non-solved problems store a `null` solved date. Changing a problem back to **Solved** assigns the current local calendar date when no prior solved date is available.

## Verification

The automated suite covers normalization, persistence, lifecycle metrics, filtering, stable sorting, validation, drawer safeguards, responsive cards, table links, board actions, filter callbacks, and accessible form descriptions. The production build and lint checks are part of the release verification.
