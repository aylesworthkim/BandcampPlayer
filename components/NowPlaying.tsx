import type { SessionItem } from "@/types/session";
import { parseBandcampInput } from "@/lib/bandcamp";
import BandcampEmbed from "@/components/BandcampEmbed";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
        Now Playing
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function NowPlaying({ item }: { item: SessionItem | null }) {
  if (!item) {
    return (
      <Panel>
        <p className="text-zinc-500">
          Select a track from your queue to start listening.
        </p>
      </Panel>
    );
  }

  const { embedSrc, openUrl, label } = parseBandcampInput(item.url);

  return (
    <Panel>
      <h2 className="text-2xl font-semibold text-white">{label}</h2>

      {embedSrc ? (
        <div className="mt-4">
          <BandcampEmbed src={embedSrc} openUrl={openUrl} />
        </div>
      ) : (
        <div className="mt-4">
          <p className="break-all text-sm text-zinc-500">{openUrl}</p>
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Open on Bandcamp ↗
          </a>
        </div>
      )}
    </Panel>
  );
}
