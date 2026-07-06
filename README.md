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
- React state + `localStorage` (no backend, no database, no auth yet)

State lives in a small `localStorage`-backed store read through
`useSyncExternalStore`, so the session is hydration-safe and shared across tabs.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a Bandcamp link to
start a session.

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
components/   UI: UrlInput, NowPlaying, SessionList, SessionItemCard, Artwork…
lib/          bandcamp.ts (parse input → metadata), storage.ts (session store)
types/        Shared types (SessionItem, SessionState)
```

## How input is interpreted

When you add something, it is parsed **once** into a music object:

- **Embed code** → renders the official Bandcamp player; title/artist come from
  the embed’s link text.
- **Track / album URL** → a card that opens on Bandcamp; the title comes from the
  URL slug and the artist from the `artist.bandcamp.com` subdomain.

Artwork is shown when a Bandcamp image URL is present in the pasted input;
otherwise a colourful placeholder is generated so the shelf still looks alive.
