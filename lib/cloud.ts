import { supabase } from "@/lib/supabase";
import type {
  CloudSession,
  CloudSessionMeta,
  SessionItem,
} from "@/types/session";

// Shape of a row in the session_items table.
type ItemRow = {
  id: string;
  position: number;
  kind: string;
  input: string;
  label: string | null;
  artist: string | null;
  title: string | null;
  album: string | null;
  artwork_url: string | null;
  source_url: string | null;
  embed_src: string | null;
};

function client() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function rowToItem(row: ItemRow): SessionItem {
  return {
    id: row.id,
    url: row.input,
    kind: row.kind === "embed" ? "embed" : "link",
    label: row.label ?? undefined,
    artist: row.artist ?? undefined,
    title: row.title ?? undefined,
    album: row.album ?? undefined,
    artworkUrl: row.artwork_url ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    embedSrc: row.embed_src ?? undefined,
  };
}

// Maps a SessionItem to an insert row for a given session/position. The row id
// is left to the database default so cloud items get their own stable uuids.
function itemToRow(item: SessionItem, sessionId: string, position: number) {
  return {
    session_id: sessionId,
    position,
    kind: item.kind ?? "link",
    input: item.url,
    label: item.label ?? null,
    artist: item.artist ?? null,
    title: item.title ?? null,
    album: item.album ?? null,
    artwork_url: item.artworkUrl ?? null,
    source_url: item.sourceUrl ?? null,
    embed_src: item.embedSrc ?? null,
  };
}

export async function listSessions(): Promise<CloudSessionMeta[]> {
  const { data, error } = await client()
    .from("sessions")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
  }));
}

export async function fetchSession(id: string): Promise<CloudSession> {
  const supa = client();
  const [{ data: session, error: sErr }, { data: items, error: iErr }] =
    await Promise.all([
      supa.from("sessions").select("id, title, updated_at").eq("id", id).single(),
      supa
        .from("session_items")
        .select("*")
        .eq("session_id", id)
        .order("position", { ascending: true }),
    ]);
  if (sErr) throw sErr;
  if (iErr) throw iErr;
  return {
    id: session.id,
    title: session.title,
    updatedAt: session.updated_at,
    items: (items ?? []).map(rowToItem),
  };
}

async function replaceItems(
  sessionId: string,
  items: SessionItem[],
): Promise<void> {
  const supa = client();
  const { error: delErr } = await supa
    .from("session_items")
    .delete()
    .eq("session_id", sessionId);
  if (delErr) throw delErr;

  if (items.length === 0) return;
  const rows = items.map((item, index) => itemToRow(item, sessionId, index));
  const { error: insErr } = await supa.from("session_items").insert(rows);
  if (insErr) throw insErr;
}

// Creates a new cloud session owned by the user and returns its id.
export async function createSession(
  userId: string,
  title: string,
  items: SessionItem[],
): Promise<string> {
  const { data, error } = await client()
    .from("sessions")
    .insert({ user_id: userId, title })
    .select("id")
    .single();
  if (error) throw error;

  await replaceItems(data.id, items);
  return data.id;
}

// Overwrites a cloud session's title and items (used by "Save changes").
export async function updateSession(
  id: string,
  title: string,
  items: SessionItem[],
): Promise<void> {
  const { error } = await client()
    .from("sessions")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  await replaceItems(id, items);
}

export async function renameSession(id: string, title: string): Promise<void> {
  const { error } = await client()
    .from("sessions")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await client().from("sessions").delete().eq("id", id);
  if (error) throw error;
}
