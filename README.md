# Project Sesh — BandcampPlayer

A beautiful, listener-first way to build **Bandcamp-powered listening sessions**.
Paste a track, album, or embed and Project Sesh turns it into a queue of playable
music objects — a small record shelf and listening room in the browser.

Project Sesh is built to **support Bandcamp artists**: it uses official Bandcamp
links and embeds, and always routes listeners back to Bandcamp to play, buy, and
follow.

## Features

- Paste a Bandcamp **track URL, album URL, or embed code**
- Builds a **queue** of your session
- **Now Playing** area with the official Bandcamp player (or an “Open on
  Bandcamp” link when no embed is available)
- Rich **music cards** — title, artist, artwork placeholder, and source link
- **Reorder** (move up/down) and **remove** items
- **Name your session**
- Everything **persists locally** and syncs across browser tabs
- Dark, immersive, minimal, music-first UI

## Guardrails

Project Sesh respects Bandcamp and its artists:

- No scraping of Bandcamp pages
- No audio downloading or raw stream extraction
- No bypassing the Bandcamp player
- No Bandcamp login required
- Only public Bandcamp URLs and official embed behaviour
- Every player includes a clear **Open on Bandcamp** link

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- React state + `localStorage` for the local session
- [Supabase](https://supabase.com) (optional) for accounts + cloud sessions

State lives in a small `localStorage`-backed store read through
`useSyncExternalStore`, so the session is hydration-safe and shared across tabs.
Supabase is **optional**: without the env vars below, the app runs exactly as a
local-only session builder — no account UI, no network calls.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a Bandcamp link to
start a session. This works with no configuration — cloud features below are
opt-in.

## Accounts & cloud sessions (Supabase)

Signing in lets a user sync their sessions across devices. Signed-out users keep
using the local (`localStorage`) session exactly as before.

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then grab the API
values from **Project Settings → API**.

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Both are browser-safe (the anon key is protected by Row Level Security). Never
commit `.env.local` or any `service_role`/secret key. `.env*` is gitignored.

### 3. Database schema

Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) in
the Supabase SQL editor. It creates two tables and enables Row Level Security so
users can only read/write their own rows:

- **`sessions`** — `id`, `user_id`, `title`, `created_at`, `updated_at`
- **`session_items`** — `id`, `session_id`, `position`, `kind`, `input`,
  `label`, `artist`, `title`, `album`, `artwork_url`, `source_url`, `embed_src`,
  `created_at`

### 4. Google auth

In the Supabase dashboard, enable **Authentication → Providers → Google** and add
your Google OAuth client ID/secret (from the Google Cloud console).

**Redirect URLs.** The app signs in with `redirectTo: window.location.origin`,
so add every origin you run on to **Authentication → URL Configuration →
Redirect URLs**, e.g.:

- `http://localhost:3000` (local dev — note the port; `next dev` may pick 3001 if
  3000 is taken)
- your deployed site origin (e.g. `https://your-app.vercel.app`)

In the Google Cloud console, add Supabase's callback
(`https://your-project-ref.supabase.co/auth/v1/callback`) as an authorized
redirect URI.

### What signing in enables

- **My Sessions** — list, create, open, rename, and delete cloud sessions.
- **Save this local session to my account** — copies your current local session
  to the cloud (the local copy is kept, never deleted).
- **Save changes** — when a cloud session is open, pushes edits back to Supabase.

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the dev server              |
| `npm run build` | Production build                  |
| `npm start`     | Serve the production build        |
| `npm run lint`  | Lint with ESLint                  |

## Project structure

```txt
app/          Next.js App Router entry (page, layout)
components/   UI: UrlInput, NowPlaying, SessionList, SessionItemCard, Artwork,
              AccountBar, MySessions, CloudSessionBar…
lib/          bandcamp.ts (parse input → metadata), storage.ts (local session),
              supabase.ts (client), auth.ts (user store), cloud.ts (Supabase
              CRUD), cloudSession.ts (open cloud-session buffer)
types/        Shared types (SessionItem, SessionState, CloudSession)
supabase/     SQL migrations (schema + Row Level Security)
```

## How input is interpreted

When you add something, it is parsed **once** into a music object:

- **Embed code** → renders the official Bandcamp player; title/artist come from
  the embed’s link text.
- **Track / album URL** → a card that opens on Bandcamp; the title comes from the
  URL slug and the artist from the `artist.bandcamp.com` subdomain.

Artwork is shown when a Bandcamp image URL is present in the pasted input;
otherwise a colourful placeholder is generated so the shelf still looks alive.
