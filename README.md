# DevTrack — DSA & Coding Progress Tracker

DevTrack is a local-first React application for tracking solved coding problems, revision schedules, consistency, and analytics. It also includes a small Express API foundation for health and connectivity checks.

The backend is optional today. Problems, revisions, analytics, settings, and backups still use browser `localStorage`, so the frontend remains fully usable while the API is offline. Database integration is intentionally deferred to a later milestone.

## Project structure

```text
devTrack/
├── src/                    React frontend
│   ├── components/         Shared and domain UI
│   ├── context/            Local application state
│   ├── hooks/              Browser and connection hooks
│   ├── pages/              Route-level screens
│   ├── services/           localStorage, export, and API utilities
│   └── test/               Frontend Vitest suite
├── server/                 Independent Express package
│   ├── src/
│   │   ├── config/         Environment validation
│   │   ├── middleware/     JSON 404 and error handling
│   │   ├── routes/         API and health routes
│   │   ├── app.js          Testable Express app factory
│   │   └── server.js       HTTP startup and graceful shutdown
│   └── tests/              Supertest and configuration tests
├── .env.example            Frontend environment example
└── server/.env.example     Backend environment example
```

Both packages use ES modules. Node 24 or newer is recommended because the backend scripts use the built-in watch mode and environment-file loader.

## Install dependencies

From the repository root:

```bash
npm install
npm --prefix server install
```

Only three backend runtime packages are used: Express for routing, CORS for explicit browser-origin policy, and Helmet for security headers. Supertest and Vitest are development-only test dependencies. Node supplies watch mode and environment loading, so no `nodemon` or `dotenv` dependency is needed.

## Configure environment files

The committed examples contain safe development values. Real `.env` files are ignored by Git.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
```

macOS or Linux:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Frontend variable:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000` | Base URL used only for the API health check. |

Backend variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | HTTP port, validated as an integer from 1 through 65535. |
| `NODE_ENV` | `development` | Must be `development`, `test`, or `production`. |
| `CLIENT_ORIGIN` | `http://localhost:5173` outside production | Allowed browser origin. Comma-separated origins are supported. It is required in production. |

## Run locally

Start the frontend and backend in separate terminals.

Terminal 1 — frontend:

```bash
npm run dev
```

Terminal 2 — backend with file watching:

```bash
npm run server:dev
```

Production-style backend startup:

```bash
npm run server:start
```

The independent package commands also work from `server/`:

```bash
npm run dev
npm start
npm test
```

A combined `dev:all` command is intentionally omitted so both processes remain independently observable without adding a process-manager dependency.

## API contract

`GET /api/health` returns HTTP 200 with only this public shape:

```json
{
  "success": true,
  "status": "ok",
  "service": "devtrack-api",
  "timestamp": "2026-10-28T00:00:00.000Z"
}
```

Quick check:

```bash
curl -i http://localhost:5000/api/health
```

Errors use one stable JSON envelope:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route not found"
  }
}
```

Unknown routes return 404, unsupported methods on `/api/health` return 405, malformed JSON returns 400, oversized JSON returns 413, disallowed browser origins return 403, and unexpected failures return 500 without production stack traces or internal messages.

Helmet uses its defaults, JSON bodies are limited to 100kb, and CORS allows only configured origins. Requests without an `Origin` header continue to work for curl and server-to-server checks. Credentials are disabled because DevTrack has no backend authentication or sessions.

## Verification commands

Backend:

```bash
npm run server:test
```

Frontend:

```bash
npm run test:run
npm run lint
npm run build
```

The frontend connection indicator checks once when the application shell mounts and offers a manual retry when disconnected. It does not poll, block rendering, write to localStorage, or route any existing feature through the API.

## Data and security boundaries

The canonical browser keys remain:

- `devtrack:v1:problems`
- `devtrack:v1:revision_history`
- `devtrack:v1:settings`
- `devtrack:v1:recent_searches`
- `devtrack:v1:demo_auth`

There is no database, backend authentication, session handling, credentialed CORS, telemetry, or placeholder model/controller layer. See [ARCHITECTURE.md](ARCHITECTURE.md), [STACK.md](STACK.md), and [BACKUP_FORMAT.md](BACKUP_FORMAT.md) for more detail.
