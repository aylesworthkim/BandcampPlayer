import type { SessionItem } from "@/types/session";
import Artwork from "@/components/Artwork";

export default function SessionItemCard({
  item,
  isActive,
  isFirst,
  isLast,
  onPlay,
  onRemove,
  onMove,
}: {
  item: SessionItem;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onPlay: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const primary = item.title ?? item.label ?? item.url;
  const source = item.sourceUrl ?? item.url;

  const controlClass =
    "rounded-lg px-2 py-1 text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-zinc-500";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
        isActive
          ? "border-white/25 bg-zinc-800/60"
          : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700"
      }`}
    >
      {/* Clicking the artwork/title makes this the active track. */}
      <button
        onClick={() => onPlay(item.id)}
        aria-label={`Play ${primary}`}
        aria-pressed={isActive}
        className="group flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="relative size-14 shrink-0">
          <Artwork item={item} className="size-14 overflow-hidden rounded-lg" />
          <span
            className={`absolute inset-0 grid place-items-center rounded-lg text-white transition ${
              isActive
                ? "bg-black/40"
                : "bg-black/50 opacity-0 group-hover:opacity-100"
            }`}
          >
            {isActive ? "♪" : "▶"}
          </span>
        </span>

        <span className="min-w-0">
          <span className="block truncate font-medium text-white">
            {primary}
          </span>
          {item.artist ? (
            <span className="block truncate text-sm text-zinc-400">
              {item.artist}
            </span>
          ) : null}
          <span className="block truncate text-xs text-zinc-600">{source}</span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onMove(item.id, "up")}
          disabled={isFirst}
          aria-label={`Move ${primary} up`}
          className={controlClass}
        >
          ↑
        </button>
        <button
          onClick={() => onMove(item.id, "down")}
          disabled={isLast}
          aria-label={`Move ${primary} down`}
          className={controlClass}
        >
          ↓
        </button>
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${primary}`}
          className={controlClass}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
