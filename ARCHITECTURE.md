# DevTrack Architecture

## Overview

DevTrack is a local-first React application for recording coding problems, reviewing them on a spaced-repetition schedule, and inspecting progress. Problems, settings, authentication state, and revision history remain in browser `localStorage`. A separately packaged Express server provides the initial `/api/health` contract, but the application has no runtime dependency on that server and continues to work offline.

## Runtime flow

`src/main.jsx` mounts `src/App.jsx`. The app composes the settings, toast, problem, and command-palette providers around a React Router instance. Routes are loaded lazily and grouped into three shells:

- `PublicLayout` serves the landing, login, and signup routes.
- `AppLayout` serves dashboard, problems, analytics, revision, and settings routes.
- The revision session has a dedicated full-screen route.

An application-level error boundary protects the provider and router tree. Route loading uses a shared skeleton fallback.

`server/src/server.js` validates runtime configuration, creates the Express application, starts the HTTP listener, and owns graceful process shutdown. `server/src/app.js` remains free of `listen()` so Supertest can exercise the real middleware stack without a network port. The stack is ordered as Helmet, restricted CORS, a 100kb JSON parser, `/api` routes, JSON 404 handling, and centralized error handling.

## Layers

- `src/pages` assembles route-level experiences.
- `src/layouts` owns public and authenticated navigation shells.
- `src/components` contains domain components and reusable UI primitives.
- `src/context` coordinates settings, problems, notifications, and the command palette.
- `src/hooks` contains reusable browser and animation behavior.
- `src/services` is the persistence and export boundary.
- `src/utils` contains deterministic filtering, sorting, dates, statistics, validation, and spaced-repetition rules.
- `src/styles` defines tokens and motion shared by the component layer.
- `server/src/config` validates environment inputs without reading frontend state.
- `server/src/routes` owns the health endpoint and API router composition.
- `server/src/middleware` owns stable JSON 404 and error envelopes.
- `server/tests` uses Supertest against the exported app factory.

## Backend integration boundary

`src/services/api.js` is the only frontend HTTP boundary. It normalizes `VITE_API_BASE_URL`, applies an AbortController timeout, validates the exact public health response, and converts failures into normalized connection results. `useBackendHealth` performs one check when `AppLayout` mounts and exposes an explicit retry; there is no polling. Desktop and mobile indicator views share that single hook state.

The API has no database, models, authentication, sessions, or credentialed requests. CORS accepts configured origins and requests without an `Origin` header, rejects other browser origins with a JSON 403, and never uses a production wildcard. This boundary is intentionally narrow so Day 9 database work can add real data capabilities without coupling today's frontend storage flows to a placeholder API.

## Navigation and visual system

The public landing experience lives at `/`. The DevTrack brand mark and a dedicated `Landing` item in the application sidebar and mobile drawer link back to it, while the compact mobile bottom bar remains focused on the four core workspace destinations plus Settings.

The shared token layer carries the landing page's neon-wave identity across every application route: near-black or cool-white surfaces are accented by cyan, electric blue, ultraviolet, hot pink, and orange. AppLayout adds only a restrained spectrum atmosphere; individual pages continue to consume semantic tokens, preserving green success and amber warning meaning. Dark/light theme selection, reduced-motion behavior, and the isolated full-screen landing composition remain provider-controlled.

## Data boundaries

Problem and settings services own normal application writes. `DEVTRACK_STORAGE_REGISTRY` is the exact inventory for portability and deletion. The data-portability utility treats imported JSON as untrusted, validates a versioned envelope, whitelists fields, and prepares merge or replace results without touching storage. The backup service snapshots raw portable values, writes and verifies the prepared result, and attempts a verified rollback after any multi-key failure. Context providers refresh Problems, Revision, Dashboard, Analytics, and Settings state after a successful restore.

Problem and settings reads return data plus corruption metadata. Problems and legacy records are normalized additively; Settings values are range- and type-normalized in memory. Unreadable JSON is never replaced during a read. Providers surface non-blocking warnings while retaining the original raw browser value for recovery.

Full backups include problems, a derived revision-queue view, independent revision history, preferences, the daily goal, and recent searches. Demo authentication is owned and clearable but intentionally excluded from exports. CSV generation is pure and applies RFC 4180 escaping plus spreadsheet-formula neutralization before the download layer creates a temporary object URL.

Dashboard data follows one deterministic pipeline. The problem service reads stored records, the normalizer repairs legacy shapes without rewriting unreadable source data, and pure metric helpers derive totals, weekly activity, streaks, heatmap cells, and recent activity. Dashboard components receive those derived values and remain focused on rendering and interaction.

## Testing strategy

Frontend Vitest and Testing Library cover pure utilities, browser-facing services, hooks, shared overlay focus behavior, and high-value component flows. Tests use jsdom, reset browser storage and mocks between cases, and are scoped to `src/test` so the nested server package cannot contaminate frontend results. Backend Vitest and Supertest cover environment validation, middleware ordering, health, errors, CORS, and security headers without opening a port. Production readiness is checked with both test suites, ESLint, a Vite production build, real HTTP requests, and representative online/offline browser inspection.
