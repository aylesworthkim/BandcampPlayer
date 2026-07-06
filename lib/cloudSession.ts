import { useSyncExternalStore } from "react";
import type { CloudSession, SessionItem } from "@/types/session";
import { parseBandcampInput } from "@/lib/bandcamp";

// The cloud session currently open in the editor. This is a working buffer:
// edits mutate it and set `dirty`; "Save changes" pushes it to Supabase. It is
// entirely separate from the local (localStorage) session store, so opening a
// cloud session never touches the user's local session.
export type CloudSessionState = {
  cloudId: string | null;
  title: string;
  items: SessionItem[];
  activeId: string | null;
  dirty: boolean;
};

const STORAGE_KEY = "bandcamp-player:cloud-open";

const EMPTY: CloudSessionState = {
  cloudId: null,
  title: "",
  items: [],
  activeId: null,
  dirty: false,
};

const listeners = new Set<() => void>();

function read(): CloudSessionState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as CloudSessionState;
    if (typeof parsed.cloudId !== "string") return EMPTY;
    return {
      cloudId: parsed.cloudId,
      title: typeof parsed.title === "string" ? parsed.title : "",
      items: Array.isArray(parsed.items) ? parsed.items : [],
      activeId: typeof parsed.activeId === "string" ? parsed.activeId : null,
      dirty: Boolean(parsed.dirty),
    };
  } catch {
    return EMPTY;
  }
}

function write(state: CloudSessionState): void {
  if (typeof window === "undefined") return;
  try {
    if (!state.cloudId) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write failures.
  }
}

let cache: CloudSessionState = read();

function emit(): void {
  for (const listener of listeners) listener();
}

function commit(next: CloudSessionState): void {
  cache = next;
  write(next);
  emit();
}

export function subscribeCloudSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCloudSnapshot(): CloudSessionState {
  return cache;
}

export function getServerCloudSnapshot(): CloudSessionState {
  return EMPTY;
}

export function useCloudSession(): CloudSessionState {
  return useSyncExternalStore(
    subscribeCloudSession,
    getCloudSnapshot,
    getServerCloudSnapshot,
  );
}

export function openCloudSession(session: CloudSession): void {
  commit({
    cloudId: session.id,
    title: session.title,
    items: session.items,
    activeId: session.items[0]?.id ?? null,
    dirty: false,
  });
}

export function closeCloudSession(): void {
  if (!cache.cloudId) return;
  commit(EMPTY);
}

export function markCloudSaved(): void {
  if (!cache.cloudId) return;
  commit({ ...cache, dirty: false });
}

export function setCloudTitle(title: string): void {
  commit({ ...cache, title, dirty: true });
}

export function addCloudItem(url: string): void {
  const item: SessionItem = {
    id: crypto.randomUUID(),
    url,
    ...parseBandcampInput(url),
  };
  commit({
    ...cache,
    items: [item, ...cache.items],
    activeId: cache.activeId ?? item.id,
    dirty: true,
  });
}

export function removeCloudItem(id: string): void {
  commit({
    ...cache,
    items: cache.items.filter((item) => item.id !== id),
    activeId: cache.activeId === id ? null : cache.activeId,
    dirty: true,
  });
}

export function moveCloudItem(id: string, direction: "up" | "down"): void {
  const index = cache.items.findIndex((item) => item.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= cache.items.length) return;
  const items = [...cache.items];
  [items[index], items[target]] = [items[target], items[index]];
  commit({ ...cache, items, dirty: true });
}

export function setCloudActive(id: string): void {
  commit({ ...cache, activeId: id, dirty: cache.dirty });
}
