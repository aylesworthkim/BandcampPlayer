"use client";

import { useState } from "react";
import type { SessionItem } from "@/types/session";
import { updateSession } from "@/lib/cloud";
import { closeCloudSession, markCloudSaved } from "@/lib/cloudSession";

export default function CloudSessionBar({
  cloudId,
  title,
  items,
  dirty,
}: {
  cloudId: string;
  title: string;
  items: SessionItem[];
  dirty: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setSaving(true);
    setError(null);
    updateSession(cloudId, title || "Untitled Sesh", items)
      .then(() => markCloudSaved())
      .catch(() => setError("Couldn't save. Please try again."))
      .finally(() => setSaving(false));
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 px-4 py-3">
      <span className="text-sm text-zinc-400">
        Cloud session
        {dirty ? <span className="text-amber-400/80"> · unsaved changes</span> : null}
      </span>
      <div className="flex items-center gap-2">
        {error ? <span className="text-sm text-red-400">{error}</span> : null}
        <button
          onClick={() => closeCloudSession()}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Close
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
