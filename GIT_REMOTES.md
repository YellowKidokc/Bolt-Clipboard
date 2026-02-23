# Git Remote Configuration

This repository is connected to three GitHub remotes:

## Remotes

- **clipboard**: https://github.com/YellowKidokc/Bolt-Clipboard.git
- **rss**: https://github.com/YellowKidokc/Bolt-RSS-.git
- **prophecy**: https://github.com/YellowKidokc/BOLT-Prophecy.git

## Push to Remotes

```bash
# Push to all remotes
git push clipboard master
git push rss master
git push prophecy master

# Or push to all at once
git push --all
```

## Project Structure

This unified codebase contains:

### 1. ClipSync (Clipboard Manager)
- Frontend: React components in `src/components/clips/`, `src/components/notes/`, etc.
- Features: Clipboard history, notes, bookmarks, prompts, research links, hotkeys
- API Layer: `src/lib/clipSync.ts`

### 2. Media Pipeline (Cloudflare Workers)
- Backend: `worker/` directory
- Database: D1 with Drizzle ORM
- Queue: Cloudflare Queues for job processing
- Routes: Auth, jobs processing
- Migrations: `worker/migrations/`

### 3. Prophecy Tracker (Supabase)
- Components: `src/components/ProphecyDashboard.tsx`, `ProphecyDetail.tsx`, etc.
- Features: Real-time prophecy tracking, priority targets, AI analysis
- Database: Supabase (configured via .env)

## Environment Variables

Copy `.env.example` to `.env` and configure:
- Cloudflare credentials (Workers, D1, R2)
- Supabase credentials
- API keys

## Development

```bash
# Frontend dev server
npm run dev

# Worker dev server
npm run worker:dev

# Build all
npm run build
```

## Deployment

```bash
# Deploy worker to Cloudflare
npm run worker:deploy

# Frontend build (deploy to Pages/static host)
npm run build
```
