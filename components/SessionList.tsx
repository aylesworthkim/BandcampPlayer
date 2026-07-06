import SessionItemCard from "@/components/SessionItemCard";
import type { SessionItem } from "@/types/session";

export default function SessionList({
  session,
  activeId,
  onPlay,
  onRemove,
  onMove,
}: {
  session: SessionItem[];
  activeId: string | null;
  onPlay: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium uppercase tracking-[0.35em] text-zinc-500">
          Queue
        </h2>
        <span className="text-xs text-zinc-600">
          {session.length} {session.length === 1 ? "track" : "tracks"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {session.map((item, index) => (
          <SessionItemCard
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            isFirst={index === 0}
            isLast={index === session.length - 1}
            onPlay={onPlay}
            onRemove={onRemove}
            onMove={onMove}
          />
        ))}
      </div>
    </section>
  );
}
