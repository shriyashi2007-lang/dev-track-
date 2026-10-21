# DevTrack Technology Stack

## Application

- React 19 renders the component tree and provides context and hooks.
- React Router 7 handles route composition and lazy page loading.
- Vite 8 supplies the development server and production bundling.
- Tailwind CSS 3 provides utility styling over the tokens in `src/styles`.
- Framer Motion and Motion power route, component, and gesture animation.
- Lucide React supplies interface icons.
- Recharts renders analytics charts.
- date-fns supports date calculations where native helpers are not enough.
- clsx composes conditional class names.

## Persistence and integrations

DevTrack is local-first. Browser `localStorage` holds application data, demo session state, and preferences. Browser Blob and object-URL APIs create JSON exports. There is no API server, database, telemetry SDK, or third-party authentication provider.

## Quality tooling

- Vitest 5 runs unit and integration tests in jsdom.
- Testing Library exercises hooks and components through public behavior.
- jest-dom adds accessible DOM assertions.
- ESLint 9 checks JavaScript and React rules.
- PostCSS and Autoprefixer process the production stylesheet.

## Supported workflow

Use `npm run test` for the test suite, `npm run lint` for static checks, `npm run build` for a production bundle, and `npm run dev` for local browser inspection.
