# Tour Guide Marketplace

Monorepo: `fe/` (Vite + React) and `be/` (Express + SQLite).

## Run dev from project root (no `cd fe`)

```bash
cd "tour guide markeplace"
npm install
npm run dev
```

This starts **both** apps:

| App | URL |
|-----|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

Other scripts:

```bash
npm run dev:fe    # frontend only
npm run dev:be    # backend only
npm run build     # build frontend to fe/dist
```

The frontend proxies `/api` → `localhost:3000` in dev (`fe/vite.config.ts`).

---

## Deploy on Vercel (one project)

1. Push the repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Leave defaults; root `vercel.json` is already set:
   - Builds `fe` → static files in `fe/dist`
   - Routes `/api/*` → Express in `api/index.js`
   - SPA fallback for React Router

4. **Environment variables** (Vercel → Project → Settings → Environment Variables):

   | Name | Value |
   |------|--------|
   | `JWT_SECRET` | long random string |
   | `DATABASE_PATH` | `/tmp/marketplace.db` |

5. Deploy.

### Important: SQLite on Vercel

Serverless uses a **temporary** filesystem. Data in `/tmp` can be **lost** when functions cold-start. Fine for demos; for production use [Turso](https://turso.tech), Vercel Postgres, or host `be` on [Railway](https://railway.app) / Render and point the frontend API URL there.

### Frontend-only deploy (mock data, simplest)

If you only need the UI with mock data:

- Set **Root Directory** to `fe` in Vercel, or
- Use root deploy but skip caring about `/api` (mock mode works without backend).

---

## Demo logins (when API is connected)

Password: `password123`

- `traveler@marketplace.test`
- `guide@marketplace.test`
