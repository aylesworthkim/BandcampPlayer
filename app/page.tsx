"use client";

import { useSyncExternalStore } from "react";
import UrlInput from "@/components/UrlInput";
import SessionList from "@/components/SessionList";
import {
  addSessionItem,
  getServerSessionSnapshot,
  getSessionSnapshot,
  moveSessionItem,
  removeSessionItem,
  subscribeSession,
} from "@/lib/storage";

export default function Home() {
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Project Sesh
          </p>
          <h1 className="mt-3 text-5xl font-bold">BandcampPlayer</h1>
          <p className="mt-4 max-w-xl text-zinc-400">
            Build a listening session from Bandcamp links.
          </p>
        </header>

        <UrlInput onAdd={addSessionItem} />

        <SessionList
          session={session}
          onRemove={removeSessionItem}
          onMove={moveSessionItem}
        />
      </section>
    </main>
  );
}
