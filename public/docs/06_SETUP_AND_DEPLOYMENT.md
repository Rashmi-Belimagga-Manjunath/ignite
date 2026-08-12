# Setup & Deployment

## Requirements

- Node.js 22+ (developed on v26 with `node:sqlite` for tooling; the app itself is browser-only)
- npm
- An OpenAI API key (`sk-…`)

## Local development

```bash
npm install          # install deps
npm run seed         # generate public/ignite.db (real SQLite business database)
npm run dev          # http://localhost:5173
```

Provide the key either way:

- **Easiest:** run the app, open **Settings**, paste your key (stored in localStorage only).
- **Or** set it at start: `VITE_OPENAI_API_KEY=sk-… npm run dev`

> The key is never bundled into the repository. `.gitignore` excludes `.env` / `.env.local`.

## Smoke test

```bash
npm run smoke        # Node SSR: loads the DB, runs the full 5-agent pipeline with live tools
```

Expect: all five deliverables produced, prototype fence present, Manager GO decision, and ≥3
Manager tool calls at decision time (independent re-verification).

## Production build

```bash
npm run build        # outputs dist/
npm run preview      # serve dist/ locally to verify
```

## Deploy to GitHub Pages

1. Push the repo to GitHub.
2. In the repo: **Settings → Secrets and variables → Actions**, add
   `VITE_OPENAI_API_KEY` with your key (used as a build secret).
3. Add `.github/workflows/pages.yml` (Vite build → upload-pages-artifact → deploy-pages).
   `vite.config.js` already sets `base: "./"`.
4. Trigger the workflow manually:
   ```bash
   gh workflow run "Deploy to GitHub Pages" --repo <org>/<repo>
   gh run watch --repo <org>/<repo>
   ```
5. Verify the live site at `https://<org>.github.io/<repo>/` — check `ignite.db` loads (200)
   and the bundle contains the demo markers.

> Note: with GitHub Pages, pushing alone has not reliably triggered the workflow in this
> environment — trigger it explicitly with `gh workflow run`.

## Live pages have no server

IGNITE is a fully static site. "Backends" are browser-side: sql.js opens `ignite.db`, the MCP
registry calls public APIs directly, and the OpenAI client streams straight from the browser. This
is what lets the whole organisation run on GitHub Pages with zero infrastructure.
