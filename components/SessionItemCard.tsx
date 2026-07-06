import type { SessionItem } from "@/types/session";
import { parseBandcampInput } from "@/lib/bandcamp";
import BandcampEmbed from "@/components/BandcampEmbed";

export default function SessionItemCard({
  item,
  index,
  isFirst,
  isLast,
  onRemove,
  onMove,
}: {
  item: SessionItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const { embedSrc, openUrl } = parseBandcampInput(item.url);

  const controlClass =
    "rounded-lg px-2 text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-zinc-500";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-zinc-500">Track {index + 1}</p>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onMove(item.id, "up")}
            disabled={isFirst}
            aria-label={`Move track ${index + 1} up`}
            className={controlClass}
          >
            ↑
          </button>
          <button
            onClick={() => onMove(item.id, "down")}
            disabled={isLast}
            aria-label={`Move track ${index + 1} down`}
            className={controlClass}
          >
            ↓
          </button>
          <button
            onClick={() => onRemove(item.id)}
            aria-label={`Remove track ${index + 1}`}
            className={controlClass}
          >
            ✕
          </button>
        </div>
      </div>

      {embedSrc ? (
        <BandcampEmbed src={embedSrc} openUrl={openUrl} />
      ) : (
        <a
          href={openUrl}
          target="_blank"
          className="break-all text-zinc-200 underline hover:text-white"
        >
          {openUrl}
        </a>
      )}
    </div>
  );
}
