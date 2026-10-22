# Dashboard Data Contract

The dashboard is a live summary of the problem records stored in the browser. Every widget uses the same normalized collection so totals, charts, streaks, the heatmap, and recent activity stay consistent.

## Record normalization

- Legacy records receive stable identifiers and safe defaults when optional fields are absent.
- Status, difficulty, tags, dates, and links are normalized before metrics are calculated.
- Duplicate legacy identifiers receive deterministic suffixes instead of replacing one another.
- Unreadable stored JSON is reported to the interface and is never overwritten by an ordinary read.

## Metric rules

- A solved problem contributes on its recorded solved date.
- Weekly activity always contains seven local calendar days, including zero-count days.
- Current and longest streaks count consecutive calendar days with at least one solved problem.
- The contribution heatmap covers 52 complete weeks and exposes each cell through an accessible label.
- Recent activity sorts by solved date first and updated time second.

## Verification

Run `npm run test:ci`, `npm run lint`, and `npm run build` before release. Browser checks should include mobile and desktop widths, light and dark themes, refresh persistence, keyboard access, reduced-motion behavior, and a clean console.
