"use client";

import { useSyncExternalStore } from "react";
import UrlInput from "@/components/UrlInput";
import SessionTitle from "@/components/SessionTitle";
import NowPlaying from "@/components/NowPlaying";
import SessionList from "@/components/SessionList";
import EmptyState from "@/components/EmptyState";
import {
  addSessionItem,
  getServerSessionSnapshot,
  getSessionSnapshot,
  moveSessionItem,
  removeSessionItem,
  setActiveItem,
  setTitle,
  subscribeSession,
} from "@/lib/storage";

export default function Home() {
  const { title, items, activeId } = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  const activeItem = items.find((item) => item.id === activeId) ?? null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-600">
            Project Sesh
          </p>
          <SessionTitle title={title} onChange={setTitle} />
        </header>

        <UrlInput onAdd={addSessionItem} />

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <NowPlaying item={activeItem} />
            <SessionList
              session={items}
              activeId={activeId}
              onPlay={setActiveItem}
              onRemove={removeSessionItem}
              onMove={moveSessionItem}
            />
          </>
        )}
      </section>
    </main>
  );
}
