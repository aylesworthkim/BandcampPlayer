"use client";

import { useState } from "react";

export default function UrlInput({
  onAdd,
}: {
  onAdd: (url: string) => void;
}) {
  const [url, setUrl] = useState("");

  function handleAdd() {
    if (!url.trim()) return;

    onAdd(url.trim());
    setUrl("");
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
      <label htmlFor="bandcamp-url" className="text-sm text-zinc-400">
        Paste a Bandcamp URL or embed code
      </label>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
        className="mt-3 flex gap-3"
      >
        <input
          id="bandcamp-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://artist.bandcamp.com/track/song-name"
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-white"
        />

        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
        >
          Add
        </button>
      </form>

      <p className="mt-2 text-xs text-zinc-600">
        Track &amp; album links become cards. Paste Bandcamp&rsquo;s embed code to
        get an inline player.
      </p>
    </div>
  );
}
