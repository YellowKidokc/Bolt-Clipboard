# ClipSync - Cloudflare Native Edition

Personal productivity hub built with Cloudflare Workers, D1, and React.

## Architecture

**Backend**: Hono on Cloudflare Workers
**Database**: Cloudflare D1 (SQLite)
**Frontend**: React + Vite
**Auth**: JWT tokens

## Setup

### 1. Install Dependencies

```bash
npm install
cd worker && npm install && cd ..
```

### 2. Configure Cloudflare D1

Create a D1 database:

```bash
cd worker
npx wrangler d1 create clipsync-db
```

Copy the database ID from the output and update `worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "clipsync-db"
database_id = "your-actual-database-id-here"
```

### 3. Run Database Migrations

```bash
cd worker
npx wrangler d1 execute clipsync-db --local --file=./migrations/0001_initial.sql
npx wrangler d1 execute clipsync-db --file=./migrations/0001_initial.sql
```

### 4. Configure JWT Secret

Update `worker/wrangler.toml` with a secure secret:

```toml
[vars]
JWT_SECRET = "your-secure-random-secret-here"
```

### 5. Start Development

Terminal 1 (Backend):
```bash
cd worker
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

## Deployment

### Deploy Worker

```bash
cd worker
npm run deploy
```

### Build and Deploy Frontend

```bash
npm run build
# Deploy dist/ to your hosting (Cloudflare Pages, Vercel, etc.)
```

Update `.env` with your production worker URL:

```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

## API Endpoints

- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `GET /api/clips` - List clips (requires auth)
- `POST /api/clips` - Create clip (requires auth)
- `PUT /api/clips/:id` - Update clip (requires auth)
- `DELETE /api/clips/:id` - Delete clip (requires auth)
- `GET /api/notes` - List notes (requires auth)
- `POST /api/notes` - Create note (requires auth)
- `GET /api/bookmarks` - List bookmarks (requires auth)
- `POST /api/bookmarks` - Create bookmark (requires auth)

## Migration Notes

This is a complete rewrite from Supabase to Cloudflare-native stack. The following features from the original have been temporarily removed and need reimplementation:

- Tags system
- Prompts/templates
- Custom pages
- Research links
- Hotkeys
- File uploads (needs R2 integration)
- Settings persistence
- Full CRUD operations for all entities

These features can be added back by:
1. Adding routes in `worker/src/routes/`
2. Creating corresponding API client methods in `src/lib/api.ts`
3. Building UI components that consume the API

## Architecture Constraints

This project MUST use:
- Hono on Cloudflare Workers (NOT Express/Fastify)
- D1 with Drizzle ORM (NOT PostgreSQL)
- JWT auth (NOT Supabase Auth)
- R2 for file storage when needed (NOT local filesystem)

No Node.js built-ins (fs, http, net, crypto) are available in Workers runtime.
