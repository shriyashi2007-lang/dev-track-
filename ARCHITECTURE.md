# DevTrack Architecture

## Overview

DevTrack is a browser-only React application for recording coding problems, reviewing them on a spaced-repetition schedule, and inspecting progress. It has no server dependency: repositories, authentication state, settings, and revision history are stored in the browser through `localStorage`.

## Runtime flow

`src/main.jsx` mounts `src/App.jsx`. The app composes the settings, toast, problem, and command-palette providers around a React Router instance. Routes are loaded lazily and grouped into three shells:

- `PublicLayout` serves the landing, login, and signup routes.
- `AppLayout` serves dashboard, problems, analytics, revision, and settings routes.
- The revision session has a dedicated full-screen route.

An application-level error boundary protects the provider and router tree. Route loading uses a shared skeleton fallback.

## Layers

- `src/pages` assembles route-level experiences.
- `src/layouts` owns public and authenticated navigation shells.
- `src/components` contains domain components and reusable UI primitives.
- `src/context` coordinates settings, problems, notifications, and the command palette.
- `src/hooks` contains reusable browser and animation behavior.
- `src/services` is the persistence and export boundary.
- `src/utils` contains deterministic filtering, sorting, dates, statistics, validation, and spaced-repetition rules.
- `src/styles` defines tokens and motion shared by the component layer.

## Data boundaries

Problem and settings services own normal application writes. `DEVTRACK_STORAGE_REGISTRY` is the exact inventory for portability and deletion. The data-portability utility treats imported JSON as untrusted, validates a versioned envelope, whitelists fields, and prepares merge or replace results without touching storage. The backup service snapshots raw portable values, writes and verifies the prepared result, and attempts a verified rollback after any multi-key failure. Context providers refresh Problems, Revision, Dashboard, Analytics, and Settings state after a successful restore.

Full backups include problems, a derived revision-queue view, independent revision history, preferences, the daily goal, and recent searches. Demo authentication is owned and clearable but intentionally excluded from exports. CSV generation is pure and applies RFC 4180 escaping plus spreadsheet-formula neutralization before the download layer creates a temporary object URL.

Dashboard data follows one deterministic pipeline. The problem service reads stored records, the normalizer repairs legacy shapes without rewriting unreadable source data, and pure metric helpers derive totals, weekly activity, streaks, heatmap cells, and recent activity. Dashboard components receive those derived values and remain focused on rendering and interaction.

## Testing strategy

Vitest and Testing Library cover pure utilities, browser-facing services, hooks, and high-value component behavior. Tests use jsdom and reset browser storage and mocks between cases. Production readiness is checked with the full test suite, ESLint, a Vite production build, and representative browser inspection.
