import type { SessionItem } from "@/types/session";
import Artwork from "@/components/Artwork";
import BandcampEmbed from "@/components/BandcampEmbed";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
        Now Playing
      </p>
      <div className="mt-5">{children}</div>
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

  const primary = item.title ?? item.label ?? item.url;
  const source = item.sourceUrl ?? item.url;

  return (
    <Panel>
      <div className="flex items-center gap-5">
        <Artwork
          item={item}
          large
          className="size-28 shrink-0 overflow-hidden rounded-2xl"
        />
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold text-white">
            {primary}
          </h2>
          {item.artist ? (
            <p className="mt-1 truncate text-zinc-400">{item.artist}</p>
          ) : null}
          <p className="mt-1 truncate text-xs text-zinc-600">{source}</p>
        </div>
      </div>

      {item.embedSrc ? (
        <div className="mt-5">
          <BandcampEmbed src={item.embedSrc} openUrl={source} />
        </div>
      ) : (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
        >
          Open on Bandcamp ↗
        </a>
      )}
    </Panel>
  );
}
