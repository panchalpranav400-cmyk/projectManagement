# Flowboard

A project management tool: create projects, invite teammates, assign tasks with
deadlines, and track progress — built with React + Vite (client), Node/Express +
Prisma (server), and Supabase (Postgres + Auth).

## Stack

- **Client:** React 18, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React
  Router, `motion` (Framer Motion), `lucide-react`, `@supabase/supabase-js`
- **Server:** Node.js, Express, Prisma, `@supabase/supabase-js` (admin client for
  token verification)
- **Database & Auth:** Supabase Postgres + Supabase Auth (project `odyqlkafqqwcwtkqymjs`)

## Project layout

```
client/   React app (Vite dev server on :5173, proxies /api to :4000)
server/   Express API (:4000) + Prisma schema
```

## Setup

### 1. Supabase credentials

The client is already configured (`client/.env`) with the project's public URL and
publishable (anon) key — safe to ship in the browser.

The server needs two more values from the [Supabase dashboard](https://supabase.com/dashboard/project/odyqlkafqqwcwtkqymjs):

1. **Project Settings → API** → copy the **secret key** (`sb_secret_...`, *not* the
   publishable one) into `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`.
2. **Project Settings → Database → Connection string (URI)** → copy it into
   `server/.env` as `DATABASE_URL`, filling in your database password.

`server/.env` is gitignored — these values never get committed.

### 2. Install & run

```bash
# server
cd server
npm install
npm run prisma:migrate   # creates the profiles/projects/project_members/tasks tables
npm run dev               # http://localhost:4000

# client (separate terminal)
cd client
npm install
npm run dev                # http://localhost:5173
```

### 3. Try it

1. Sign up at `/signup` (Supabase sends a confirmation email by default — you can
   disable "Confirm email" in Supabase Auth settings for faster local testing).
2. Sign in, create a project, add tasks, invite a teammate by email (they must have
   signed up already), mark tasks done, watch the progress bar and overdue flag update.

## How auth works

The client talks to Supabase Auth directly (`@supabase/supabase-js`) for sign-up/
sign-in — there's no custom `/api/auth` endpoint. The resulting Supabase session
token is attached as a Bearer token to every request to the Express API, which
verifies it via `supabase.auth.getUser(token)` (works regardless of whether the
project signs tokens with a shared secret or asymmetric keys) and lazily creates a
`profiles` row for the user on first call.

## Data model

`profiles` (mirrors `auth.users`) → `projects` (owned by a profile) →
`project_members` (join table, `role`: owner/member) → `tasks` (belongs to a
project, optionally assigned to a profile).

## Not implemented yet (see plan)

Comments/activity feed on tasks, deadline notifications, a Kanban board view, and
real-time updates were scoped as stretch goals, not part of this MVP.
