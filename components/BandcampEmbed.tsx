import { embedHeight } from "@/lib/bandcamp";

export default function BandcampEmbed({
  src,
  openUrl,
}: {
  src: string;
  openUrl: string;
}) {
  return (
    <div className="mt-3 space-y-3">
      <iframe
        src={src}
        title="Bandcamp player"
        seamless
        loading="lazy"
        height={embedHeight(src)}
        className="w-full rounded-xl border border-zinc-800"
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
