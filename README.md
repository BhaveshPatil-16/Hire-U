<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Hire U

This repository is organized as an npm monorepo.

- `apps/web`: Vite + React frontend for Vercel
- `apps/api`: Express API server for Railway or another Node host
- `packages/shared`: shared jobs, companies, and TypeScript models

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` for AI features.
3. Run the frontend:
   `npm run dev:web`
4. Run the API in another terminal:
   `npm run dev:api`

For local frontend API calls, set `VITE_API_URL=http://localhost:3000` in `apps/web/.env.local` or run through the API dev server.

## Build

- Web only: `npm run build`
- Web and API: `npm run build:all`
- Type-check all workspaces: `npm run lint`

## Deploy to Vercel

Import the repository in Vercel and keep the project root at the repository root. The included `vercel.json` configures:

- Install command: `npm install`
- Build command: `npm run build -w @hireu/web`
- Output directory: `apps/web/dist`

Set `VITE_API_URL` in Vercel to the deployed API URL, for example `https://your-api.up.railway.app`.

## Deploy the API

The Express API can stay on Railway. The included `railway.toml` runs `npm run build:all` and starts `@hireu/api`.

Set these API environment variables on Railway:

- `GEMINI_API_KEY`
- `CORS_ORIGIN`, usually your Vercel URL
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` if you want real email delivery
