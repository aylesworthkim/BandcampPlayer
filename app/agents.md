# Project Sesh / BandcampPlayer

## Mission

Build a beautiful, listener-first interface for creating Bandcamp-powered listening sessions.

This project should support Bandcamp artists by using official Bandcamp links/embeds and routing users back to Bandcamp for purchases and follows.

## Current Goal

Build v0.1: a local-only listening session builder.

## v0.1 Features

- Paste a Bandcamp track or album URL
- Add it to the current listening session
- Show session items as cards
- Render a Bandcamp embed/player when possible
- Allow removing items from the session
- Allow reordering items later
- Persist the session in localStorage
- Keep the UI dark, immersive, minimal, and music-first

## Guardrails

Do not scrape or download audio.

Do not extract raw audio stream URLs.

Do not bypass Bandcamp’s player.

Do not require Bandcamp login.

Use public Bandcamp URLs and official embed behavior only.

Every player should include a clear “Open on Bandcamp” link.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- React state first
- localStorage before database
- No auth yet
- No backend yet

## Suggested Structure

```txt
app/
  page.tsx

components/
  UrlInput.tsx
  SessionList.tsx
  SessionItemCard.tsx
  BandcampEmbed.tsx

lib/
  bandcamp.ts
  storage.ts

types/
  session.ts