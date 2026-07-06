"use client";

import { useSyncExternalStore } from "react";
import UrlInput from "@/components/UrlInput";
import SessionTitle from "@/components/SessionTitle";
import NowPlaying from "@/components/NowPlaying";
import SessionList from "@/components/SessionList";
import EmptyState from "@/components/EmptyState";
import AccountBar from "@/components/AccountBar";
import MySessions from "@/components/MySessions";
import CloudSessionBar from "@/components/CloudSessionBar";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useUser } from "@/lib/auth";
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
import {
  addCloudItem,
  moveCloudItem,
  removeCloudItem,
  setCloudActive,
  setCloudTitle,
  useCloudSession,
} from "@/lib/cloudSession";

export default function Home() {
  const local = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const cloud = useCloudSession();
  const user = useUser();

  const signedIn = Boolean(user && isSupabaseConfigured);
  const cloudOpen = signedIn && Boolean(cloud.cloudId);

  // The editor is driven by whichever session is active: the open cloud session
  // when signed in and one is open, otherwise the local (localStorage) session.
  const view = cloudOpen
    ? {
        title: cloud.title,
        items: cloud.items,
        activeId: cloud.activeId,
        onTitle: setCloudTitle,
        onAdd: addCloudItem,
        onPlay: setCloudActive,
        onRemove: removeCloudItem,
        onMove: moveCloudItem,
      }
    : {
        title: local.title,
        items: local.items,
        activeId: local.activeId,
        onTitle: setTitle,
        onAdd: addSessionItem,
        onPlay: setActiveItem,
        onRemove: removeSessionItem,
        onMove: moveSessionItem,
      };

  const activeItem =
    view.items.find((item) => item.id === view.activeId) ?? null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-600">
              Project Sesh
            </p>
            <AccountBar />
          </div>
          <SessionTitle title={view.title} onChange={view.onTitle} />
        </header>

        <UrlInput onAdd={view.onAdd} />

        {signedIn && user ? (
          <MySessions
            userId={user.id}
            localSession={{ title: local.title, items: local.items }}
            openCloudId={cloud.cloudId}
          />
        ) : null}

        {cloudOpen && cloud.cloudId ? (
          <CloudSessionBar
            cloudId={cloud.cloudId}
            title={cloud.title}
            items={cloud.items}
            dirty={cloud.dirty}
          />
        ) : null}

        {view.items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <NowPlaying item={activeItem} />
            <SessionList
              session={view.items}
              activeId={view.activeId}
              onPlay={view.onPlay}
              onRemove={view.onRemove}
              onMove={view.onMove}
            />
          </>
        )}
      </section>
    </main>
  );
}
