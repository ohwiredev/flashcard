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
- `npm run typecheck` — type-check the app and the Pages Functions
- `npm run pages:dev` — serve the built app plus API functions on a local Cloudflare runtime
- `npm run db:migrate:local` — apply the schema to the local D1 database
- `npm run db:migrate:remote` — apply the schema to the production D1 database
- `npm run create-account -- <email> <password> [--remote]` — create the single login account and seed starter decks

## Backend

The API lives in `functions/` and runs as Cloudflare Pages Functions under `/api/*`. It uses a D1
database (`DB` binding) for users, sessions, decks, and cards, and UploadThing for card images.
There is no public signup: accounts are created with the `create-account` script.

## Deploying

Deploys run through the Cloudflare Pages Git integration: every push to `main` is a production
deploy, and every other branch gets a preview deploy.

### One-time setup

1. In the Cloudflare dashboard, go to Workers & Pages, create a Pages project, and choose
   Connect to Git with the `ohwiredev/flashcard` repository. The project must be named
   `flashcard`, matching `name` in `wrangler.toml`, or the build will fail.
2. Build settings: framework preset None, build command `npm run build`, root directory `/`.
   Leave the output directory empty; `pages_build_output_dir` in `wrangler.toml` supplies it.
   The Node version comes from `.node-version`.
3. Add the UploadThing token as a secret for both environments:

   ```bash
   npx wrangler pages secret put UPLOADTHING_TOKEN --project-name flashcard
   npx wrangler pages secret put UPLOADTHING_TOKEN --project-name flashcard --env preview
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

- The D1 binding is declared in `wrangler.toml`, so it applies to production and preview
  deployments without any dashboard configuration. Preview deployments share the production
  database.
- A Wrangler configuration file overrides bindings and plain environment variables set in the
  dashboard, so keep changes to bindings in `wrangler.toml`.
- Deep links such as `/decks/<id>` work because the build has no `404.html`, which makes Pages
  fall back to `index.html` for unmatched routes.
- `npm run pages:deploy` uploads a build directly from your machine. It is a fallback for when
  the Git integration is unavailable, not the normal path.
