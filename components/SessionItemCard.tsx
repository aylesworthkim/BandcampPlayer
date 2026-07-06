import type { SessionItem } from "@/types/session";
import { parseBandcampInput } from "@/lib/bandcamp";

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
  const { openUrl, label } = parseBandcampInput(item.url);

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
      {/* Clicking the item (or the play icon) makes it the active track. */}
      <button
        onClick={() => onPlay(item.id)}
        aria-label={`Play ${label}`}
        aria-pressed={isActive}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full text-sm transition ${
            isActive
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-300"
          }`}
        >
          ▶
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium text-white">
            {label}
          </span>
          <span className="block truncate text-xs text-zinc-500">
            {openUrl}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onMove(item.id, "up")}
          disabled={isFirst}
          aria-label={`Move ${label} up`}
          className={controlClass}
        >
          ↑
        </button>
        <button
          onClick={() => onMove(item.id, "down")}
          disabled={isLast}
          aria-label={`Move ${label} down`}
          className={controlClass}
        >
          ↓
        </button>
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${label}`}
          className={controlClass}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
