import type { SessionItem, SessionState } from "@/types/session";
import { parseBandcampInput } from "@/lib/bandcamp";

// v0.2 persists the whole session (title + items + active item) under one key.
// v0.1 stored just the items array under LEGACY_KEY; we migrate that on read.
const STORAGE_KEY = "bandcamp-player:state";
const LEGACY_KEY = "bandcamp-player:session";

export const DEFAULT_TITLE = "Untitled Sesh";

// A stable default reference for the server snapshot so useSyncExternalStore
// does not see a changing value between renders.
const EMPTY_STATE: SessionState = {
  title: DEFAULT_TITLE,
  items: [],
  activeId: null,
};

const listeners = new Set<() => void>();

function isSessionItem(value: unknown): value is SessionItem {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SessionItem).id === "string" &&
    typeof (value as SessionItem).url === "string"
  );
}

// Ensure a stored item carries derived metadata. v0.1/v0.2 items only had
// { id, url }, so we parse those on load ("parse once" still holds — richer
// items added in v0.3+ already have `kind` and are returned untouched).
function hydrateItem(item: SessionItem): SessionItem {
  if (item.kind) return item;
  return { ...item, ...parseBandcampInput(item.url) };
}

// Coerce arbitrary parsed JSON into a valid SessionState, dropping anything that
// doesn't fit and clearing activeId if it no longer points at a real item.
function normalize(
  title: unknown,
  items: unknown,
  activeId: unknown,
): SessionState {
  const cleanItems = Array.isArray(items)
    ? items.filter(isSessionItem).map(hydrateItem)
    : [];
  const cleanActive =
    typeof activeId === "string" &&
    cleanItems.some((item) => item.id === activeId)
      ? activeId
      : null;

  return {
    title: typeof title === "string" ? title : DEFAULT_TITLE,
    items: cleanItems,
    activeId: cleanActive,
  };
}

function read(): SessionState {
  if (typeof window === "undefined") return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return normalize(parsed.title, parsed.items, parsed.activeId);
    }

    // Migrate a v0.1 session (a bare items array) if present.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      return normalize(DEFAULT_TITLE, parsed, null);
    }

    return EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

function write(state: SessionState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write failures (e.g. storage full or unavailable).
  }
}

// Cached snapshot. useSyncExternalStore requires getSnapshot to return a stable
// reference until the data actually changes, so we only replace this on writes
// or external storage events.
let cache: SessionState = read();

function emit(): void {
  for (const listener of listeners) listener();
}

function commit(next: SessionState): void {
  cache = next;
  write(next);
  emit();
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

export function getSessionSnapshot(): SessionState {
  return cache;
}

export function getServerSessionSnapshot(): SessionState {
  return EMPTY_STATE;
}

export function setTitle(title: string): void {
  commit({ ...cache, title });
}

export function addSessionItem(url: string): void {
  const item: SessionItem = {
    id: crypto.randomUUID(),
    url,
    ...parseBandcampInput(url),
  };
  commit({
    ...cache,
    items: [item, ...cache.items],
    // Auto-select when nothing is playing so Now Playing is never empty while
    // the queue has items.
    activeId: cache.activeId ?? item.id,
  });
}

export function removeSessionItem(id: string): void {
  commit({
    ...cache,
    items: cache.items.filter((item) => item.id !== id),
    activeId: cache.activeId === id ? null : cache.activeId,
  });
}

export function moveSessionItem(id: string, direction: "up" | "down"): void {
  const index = cache.items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= cache.items.length) return;

  const items = [...cache.items];
  [items[index], items[target]] = [items[target], items[index]];
  commit({ ...cache, items });
}

export function setActiveItem(id: string): void {
  commit({ ...cache, activeId: id });
}
