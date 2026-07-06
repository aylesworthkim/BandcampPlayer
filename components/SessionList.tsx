import SessionItemCard from "@/components/SessionItemCard";
import type { SessionItem } from "@/types/session";

export default function SessionList({
  session,
  onRemove,
  onMove,
}: {
  session: SessionItem[];
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <section className="mt-10 flex-1">
      <h2 className="text-2xl font-semibold">Current Session</h2>

      {session.length === 0 ? (
        <p className="mt-4 text-zinc-500">
          No links yet. Paste a Bandcamp track or album URL to start.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {session.map((item, index) => (
            <SessionItemCard
              key={item.id}
              item={item}
              index={index}
              isFirst={index === 0}
              isLast={index === session.length - 1}
              onRemove={onRemove}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
