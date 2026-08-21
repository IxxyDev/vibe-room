# Vibe Room

Monorepo for the Vibe Room instrument catalogue site: a Payload CMS backend and an Astro static frontend, sharing one SQLite database.

## Layout

- `apps/cms` — Payload CMS 3 + Next.js admin/API backend (`@vibe-room/cms`)
- `apps/web` — Astro 5 static frontend that reads content from the CMS at build time (`@vibe-room/web`)
- `nginx/` — reverse proxy config templates for production (see `DEPLOY.md`)
- `scripts/` — container entrypoint and backup scripts

## Requirements

- Node.js 20+ (see `.nvmrc`)
- pnpm 9 (`corepack enable`)

## Getting started

```sh
pnpm install
cp apps/cms/.env.example apps/cms/.env   # fill in PAYLOAD_SECRET
pnpm dev:cms                              # http://localhost:3000/admin
pnpm dev:web                              # separate terminal
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev:cms` | Run the Payload/Next.js CMS in dev mode |
| `pnpm dev:web` | Run the Astro frontend in dev mode |
| `pnpm build:web` | Build the Astro frontend |
| `pnpm typecheck` | Typecheck both apps (`tsc`/`astro check`) |
| `pnpm lint` | Lint `.ts`/`.tsx` sources with ESLint |

## Deployment

See [`DEPLOY.md`](./DEPLOY.md) for the full VPS/Docker deployment guide.
