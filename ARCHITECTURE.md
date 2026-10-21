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

Problem and settings services are the only modules that should directly own their storage keys. Context providers expose those operations to the interface and keep React state synchronized. Import validation runs before persistence, and exports create transient object URLs that are revoked after download.

## Testing strategy

Vitest and Testing Library cover pure utilities, browser-facing services, hooks, and high-value component behavior. Tests use jsdom and reset browser storage and mocks between cases. Production readiness is checked with the full test suite, ESLint, a Vite production build, and representative browser inspection.
