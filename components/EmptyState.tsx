export default function EmptyState() {
  return (
    <section className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-16 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-zinc-800/70 text-xl text-zinc-400">
        ♪
      </div>
      <p className="mt-5 text-lg font-medium text-zinc-300">
        Start a session by pasting a Bandcamp track, album, or embed.
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        Everything stays on this device — your queue is saved automatically.
      </p>
    </section>
  );
}
