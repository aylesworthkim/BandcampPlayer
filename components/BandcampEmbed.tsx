import { embedHeight, normalizeEmbedSrc } from "@/lib/bandcamp";

export default function BandcampEmbed({
  src,
  openUrl,
}: {
  src: string;
  openUrl: string;
}) {
  const embedSrc = normalizeEmbedSrc(src);

  return (
    <div className="mt-3 space-y-3">
      <iframe
        src={embedSrc}
        title="Bandcamp player"
        seamless
        loading="lazy"
        height={embedHeight(embedSrc)}
        className="w-full rounded-2xl border border-zinc-800/70"
      />
      <a
        href={openUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm text-zinc-400 underline hover:text-white"
      >
        Open on Bandcamp ↗
      </a>
    </div>
  );
}
