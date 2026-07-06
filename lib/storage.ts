import type { SessionItem } from "@/types/session";

const STORAGE_KEY = "bandcamp-player:session";

// A stable empty reference for the server snapshot so useSyncExternalStore does
// not see a changing value between renders.
const EMPTY: SessionItem[] = [];

const listeners = new Set<() => void>();

function isSessionItem(value: unknown): value is SessionItem {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SessionItem).id === "string" &&
    typeof (value as SessionItem).url === "string"
  );
}

function read(): SessionItem[] {
  if (typeof window === "undefined") return EMPTY;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    return parsed.filter(isSessionItem);
  } catch {
    return EMPTY;
  }
}

function write(next: SessionItem[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore write failures (e.g. storage full or unavailable).
  }
}

// Cached snapshot. useSyncExternalStore requires getSnapshot to return a stable
// reference until the data actually changes, so we only replace this on writes
// or external storage events.
let cache: SessionItem[] = read();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSessionSnapshot(): SessionItem[] {
  return cache;
}

export function getServerSessionSnapshot(): SessionItem[] {
  return EMPTY;
}

export function setSession(next: SessionItem[]): void {
  cache = next;
  write(next);
  emit();
}

export function addSessionItem(url: string): void {
  setSession([{ id: crypto.randomUUID(), url }, ...cache]);
}

export function removeSessionItem(id: string): void {
  setSession(cache.filter((item) => item.id !== id));
}

export function moveSessionItem(id: string, direction: "up" | "down"): void {
  const index = cache.findIndex((item) => item.id === id);
  if (index === -1) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= cache.length) return;

  const next = [...cache];
  [next[index], next[target]] = [next[target], next[index]];
  setSession(next);
}
