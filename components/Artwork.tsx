import type { SessionItem } from "@/types/session";

// Deterministic hue from a seed string, so each release gets a stable colour.
function hashHue(seed: string): number {
  let hue = 0;
  for (let index = 0; index < seed.length; index++) {
    hue = (hue * 31 + seed.charCodeAt(index)) % 360;
  }
  return hue;
}

export default function Artwork({
  item,
  className = "",
  large = false,
}: {
  item: SessionItem;
  className?: string;
  large?: boolean;
}) {
  if (item.artworkUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-supplied art on a dynamic Bandcamp CDN host
      <img
        src={item.artworkUrl}
        alt={item.title ? `${item.title} artwork` : "Release artwork"}
        className={`object-cover ${className}`}
      />
    );
  }

  const seed = item.title ?? item.label ?? item.sourceUrl ?? item.id;
  const hue = hashHue(seed);

  return (
    <div
      aria-hidden
      className={`grid place-items-center ${className}`}
      style={{
        background: `linear-gradient(140deg, hsl(${hue} 40% 34%), hsl(${
          (hue + 45) % 360
        } 45% 15%))`,
      }}
    >
      <span className={`text-white/70 ${large ? "text-5xl" : "text-lg"}`}>
        ♪
      </span>
    </div>
  );
}
