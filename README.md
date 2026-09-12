# Flashcard

A simple flashcard app for creating decks, editing cards, and reviewing them.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- Zustand (state)
- React Router

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint
- `npm run typecheck` — type-check the app and the Worker
- `npm run cf:dev` — serve the built app plus the API on a local Cloudflare runtime
- `npm run db:migrate:local` — apply the schema to the local D1 database
- `npm run db:migrate:remote` — apply the schema to the production D1 database
- `npm run create-account -- <email> <password> [--remote]` — create the single login account and seed starter decks

## Backend

The API lives in `functions/` and runs inside the Worker under `/api/*`. `functions/index.ts` is the
Worker entry point: it maps request paths to the route modules, which keep the familiar
`onRequestGet` / `onRequestPost` shape. The API uses a D1 database (`DB` binding) for users,
sessions, decks, and cards, and UploadThing for card images. There is no public signup: accounts are
created with the `create-account` script.

## Deploying

The app deploys as a single Cloudflare Worker that serves the built client from `dist` as static
assets and handles `/api/*` itself. Deploys run through Workers Builds: every push to `main` is a
production deploy, and every other branch gets a preview deploy.

### One-time setup

1. In the Cloudflare dashboard, go to Workers & Pages, create a Worker, and connect it to the
   `ohwiredev/flashcard` repository. The Worker must be named `flashcard`, matching `name` in
   `wrangler.toml`.
2. Build settings: build command `npm run build`, deploy command `npx wrangler deploy`, root
   directory `/`. The Node version comes from `.node-version`.
3. Add the UploadThing token as a secret:

   ```bash
   npx wrangler secret put UPLOADTHING_TOKEN
   ```

   Without it the app still runs, but image uploads return a 503.
4. Create the schema and the login account on the production database:

   ```bash
   npm run db:migrate:remote
   npm run create-account -- you@example.com 'a-long-password' --remote
   ```

   Both commands are safe to re-run. The migration uses `CREATE TABLE IF NOT EXISTS`, and
   creating an account that already exists fails without changing anything.

### Notes

- The D1 binding is declared in `wrangler.toml`, so it applies to every deployment without any
  dashboard configuration.
- `run_worker_first` in `wrangler.toml` sends `/api/*` to the Worker. Everything else is served from
  the static assets, and `not_found_handling = "single-page-application"` makes deep links such as
  `/decks/<id>` fall back to `index.html`.
- A Wrangler configuration file overrides bindings and plain environment variables set in the
  dashboard, so keep changes to bindings in `wrangler.toml`.
- `npm run cf:deploy` uploads a build directly from your machine. It is a fallback for when the Git
  integration is unavailable, not the normal path.
