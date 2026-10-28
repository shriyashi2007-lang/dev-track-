# DevTrack Technology Stack

## Application

- React 19 renders the component tree and provides context and hooks.
- React Router 7 handles route composition and lazy page loading.
- Vite 8 supplies the development server and production bundling.
- Tailwind CSS 3 provides utility styling over the tokens in `src/styles`.
- Motion (`motion/react`, backed by its transitive Framer Motion runtime) powers route, component, and gesture animation.
- Lucide React supplies interface icons.
- Recharts renders analytics charts.
- date-fns supports date calculations where native helpers are not enough.
- clsx composes conditional class names.

## Persistence and integrations

DevTrack is local-first. Browser `localStorage` holds application data, demo session state, and preferences. Native `Blob`, object-URL, `File.text()`, `TextEncoder`, and JSON APIs provide versioned backup and formula-safe CSV portability without another dependency. Multi-key storage writes are verified and use in-memory raw snapshots for best-effort rollback; localStorage itself is not transactional.

An optional Node 24 / Express 5 server exposes a health endpoint. Express provides routing and JSON parsing, Helmet adds security headers, and CORS enforces explicit allowed origins. The frontend uses native `fetch` and AbortController for a single health check. There is no database, telemetry SDK, backend authentication provider, session middleware, or credentialed CORS.

## Quality tooling

- Vitest 5 runs unit and integration tests in jsdom.
- Testing Library exercises hooks and components through public behavior.
- jest-dom adds accessible DOM assertions.
- ESLint 9 checks JavaScript and React rules.
- PostCSS and Autoprefixer process the production stylesheet.
- Supertest exercises the Express app in memory without binding a network port.
- The backend reuses Vitest 5 to match the frontend testing convention.

## Supported workflow

Use `npm test` for frontend watch mode, `npm run test:run` (or its `test:ci` alias) for a deterministic frontend verification run, `npm run server:test` for backend tests, `npm run lint` for static checks, `npm run build` for a production bundle, `npm run dev` for the Vite frontend, and `npm run server:dev` for the watched API. Dashboard verification also covers narrow and wide layouts, persisted refreshes, keyboard navigation, reduced motion, backend online/offline states, and browser console errors.

## Environment configuration

| Variable | Package | Required | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Frontend | No | Optional API base; defaults to `http://localhost:5000`. |
| `PORT` | Backend | No | Valid listener port; defaults to `5000`. |
| `NODE_ENV` | Backend | No | `development`, `test`, or `production`. |
| `CLIENT_ORIGIN` | Backend | Production only | Comma-separated browser origins accepted by CORS. |
