# Workout & Nutrition Tracker — Frontend

A React + TypeScript single-page app for logging meals, browsing/adding
foods, and building meal plans, backed by the Django REST Framework API in
the sibling `workout_nutrition_log_api` repo. Supports two roles: trainees
log their own meals; trainers view their trainees' progress instead.

## Stack

- React 19 + TypeScript, built with Vite
- `react-router-dom` for client-side routing
- Vitest + `@testing-library/react` for tests
- No external state library — auth state lives in a `Context`
  (`src/context/AuthContext.tsx`); everything else is local component state

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Make sure the backend is running at `http://localhost:8000` (see its
   README) — the API base URL is set in `src/api/http.ts`.
3. Start the dev server:
   ```
   npm run dev
   ```
   Runs at `http://localhost:5173` by default. The backend's CORS config
   expects this exact port.

## Scripts

| Command         | Does                                        |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Start the Vite dev server                   |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm test`      | Run the Vitest test suite                   |
| `npm run lint`  | ESLint                                      |

## Project layout

```
src/
  api/          One file per resource — fetch calls, auth, token storage
  components/   Forms, list views, page-level route components
  context/      AuthContext — token, role, login/logout state
  types/        Shared TypeScript types matching the backend's serializers
  App.tsx       Route definitions
  main.tsx      Entry point — wraps the app in BrowserRouter + AuthProvider
```

## Routing

- `/login` — login/register (public; redirects to `/meals` if already
  logged in)
- `/meals`, `/foods`, `/plans` — the three main views, all wrapped in
  `ProtectedRoute` (`src/components/ProtectedRoute.tsx`), which redirects
  unauthenticated users to `/login`
- Any unmatched path redirects to `/meals` (if logged in) or `/login`

`AppLayout.tsx` renders the persistent nav bar and logout button around
whichever route is active.

## Auth

Token-based, matching the backend. `AuthContext` holds the token (persisted
via `src/api/token.ts`) and exposes `login`/`logout`/role info to the rest
of the app. Both `LoginForm` and `RegisterForm` validate required fields
client-side before calling the API, and surface server-side validation
errors (e.g. "username already taken") separately from client-side ones.

## Testing

```
npm test
```

- `src/api/*.test.ts` — tests the fetch functions directly, mocking
  `global.fetch`
- `src/components/*.test.tsx` — tests form components with
  `@testing-library/react`, mocking the API/auth modules rather than
  `fetch` directly, covering valid submit, client-validation failure, and
  server-rejected submit for both `LoginForm` and `RegisterForm`
- `ProtectedRoute.test.tsx` — confirms unauthenticated users are redirected
  and authenticated users see the protected content

## Known environment note

If you unzip/clone this on a different OS/architecture than it was
installed on, delete `node_modules` and reinstall — some dependencies ship
platform-specific native binaries that won't run cross-platform.
test
