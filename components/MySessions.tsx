"use client";

import { useCallback, useEffect, useState } from "react";
import type { CloudSessionMeta, SessionItem } from "@/types/session";
import {
  createSession,
  deleteSession,
  fetchSession,
  listSessions,
  renameSession,
} from "@/lib/cloud";
import { closeCloudSession, openCloudSession } from "@/lib/cloudSession";

export default function MySessions({
  userId,
  localSession,
  openCloudId,
}: {
  userId: string;
  localSession: { title: string; items: SessionItem[] };
  openCloudId: string | null;
}) {
  const [sessions, setSessions] = useState<CloudSessionMeta[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSessions(await listSessions());
      setError(null);
    } catch {
      setError("Couldn't load your sessions.");
    }
  }, []);

  // Initial load. The fetch is inlined so setState clearly happens after an
  // await (async), not synchronously in the effect body.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await listSessions();
        if (active) setSessions(rows);
      } catch {
        if (active) setError("Couldn't load your sessions.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleNew() {
    void withBusy(async () => {
      const id = await createSession(userId, "Untitled Sesh", []);
      await refresh();
      openCloudSession(await fetchSession(id));
    });
  }

  function handleOpen(id: string) {
    void withBusy(async () => {
      openCloudSession(await fetchSession(id));
    });
  }

  function handleRename(id: string, current: string) {
    const next = window.prompt("Rename session", current);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    void withBusy(async () => {
      await renameSession(id, trimmed);
      await refresh();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this session? This can't be undone.")) return;
    void withBusy(async () => {
      await deleteSession(id);
      if (openCloudId === id) closeCloudSession();
      await refresh();
    });
  }

  function handleMigrate() {
    void withBusy(async () => {
      await createSession(
        userId,
        localSession.title || "Untitled Sesh",
        localSession.items,
      );
      await refresh();
    });
  }

  return (
    <section className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.35em] text-zinc-500">
          My Sessions
        </h2>
        <button
          onClick={handleNew}
          disabled={busy}
          className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:opacity-40"
        >
          + New
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      <ul className="mt-4 space-y-2">
        {sessions.length === 0 ? (
          <li className="text-sm text-zinc-600">
            No cloud sessions yet. Create one, or save your local session below.
          </li>
        ) : (
          sessions.map((session) => {
            const isOpen = session.id === openCloudId;
            return (
              <li
                key={session.id}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                  isOpen
                    ? "border-white/25 bg-zinc-800/60"
                    : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <button
                  onClick={() => handleOpen(session.id)}
                  disabled={busy}
                  className="min-w-0 flex-1 truncate text-left text-zinc-100 disabled:opacity-40"
                >
                  {session.title || "Untitled Sesh"}
                  {isOpen ? (
                    <span className="ml-2 text-xs text-zinc-500">· open</span>
                  ) : null}
                </button>
                <button
                  onClick={() => handleRename(session.id, session.title)}
                  disabled={busy}
                  aria-label={`Rename ${session.title}`}
                  className="rounded-lg px-2 py-1 text-zinc-500 transition hover:text-white disabled:opacity-40"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={busy}
                  aria-label={`Delete ${session.title}`}
                  className="rounded-lg px-2 py-1 text-zinc-500 transition hover:text-white disabled:opacity-40"
                >
                  ✕
                </button>
              </li>
            );
          })
        )}
      </ul>

      <button
        onClick={handleMigrate}
        disabled={busy || localSession.items.length === 0}
        className="mt-4 w-full rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:opacity-40"
      >
        Save this local session to my account
      </button>
    </section>
  );
}
