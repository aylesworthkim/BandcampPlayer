// Official Bandcamp embed players are always served from this path. We only ever
// render an <iframe> whose src matches this prefix, so arbitrary user-supplied
// markup can never be turned into an embedded frame.
const EMBED_PREFIX = "https://bandcamp.com/EmbeddedPlayer/";

export type BandcampParse = {
  // The official EmbeddedPlayer src, if the input resolves to one. Null means
  // "no embed available" and callers should fall back to a plain link.
  embedSrc: string | null;
  // The best "Open on Bandcamp" destination for this input.
  openUrl: string;
  // A human-friendly label derived from the embed's anchor text or the URL slug.
  label: string;
};

function extractAttr(html: string, attr: "src" | "href"): string | null {
  const match = html.match(
    new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i"),
  );
  return match ? match[1] : null;
}

// Bandcamp embed snippets include an <a> fallback whose text reads like
// "Track Title by Artist" — the nicest label we can get for an embed.
function extractAnchorText(html: string): string | null {
  const match = html.match(/<a[^>]*>([^<]+)<\/a>/i);
  const text = match?.[1]?.trim();
  return text ? text : null;
}

function isEmbedUrl(value: string): boolean {
  return value.startsWith(EMBED_PREFIX);
}

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// Turn a "/track/forty-winks" or "/album/jettison-mind-hatch" path into a
// title-cased label ("Forty Winks", "Jettison Mind Hatch").
function slugToLabel(url: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }

  const match = pathname.match(/\/(?:track|album)\/([^/?#]+)/i);
  if (!match) return null;

  const words = match[1]
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.length ? words.join(" ") : null;
}

/**
 * Interpret a raw pasted string. It may be:
 *   1. A Bandcamp embed snippet (`<iframe src="…EmbeddedPlayer…"><a href="…">`)
 *   2. A direct EmbeddedPlayer URL
 *   3. A plain track/album/artist URL (no embed — link only, prior behavior)
 *
 * This is intentionally permissive: anything we don't recognize as an embed is
 * returned as a link, preserving the original "paste a URL, get a link" flow.
 */
export function parseBandcampInput(raw: string): BandcampParse {
  const input = raw.trim();

  // Case 1: an embed iframe snippet.
  if (input.includes("<iframe")) {
    const src = extractAttr(input, "src");
    const href = extractAttr(input, "href");
    if (src && isEmbedUrl(src)) {
      const openUrl = href ?? src;
      const label =
        extractAnchorText(input) ??
        (href ? slugToLabel(href) : null) ??
        "Bandcamp player";
      return { embedSrc: src, openUrl, label };
    }
    // An <iframe> that isn't a recognizable Bandcamp embed: never render it.
    const openUrl = href ?? input;
    return { embedSrc: null, openUrl, label: labelForLink(openUrl) };
  }

  // Case 2: a direct EmbeddedPlayer URL (no human-readable name available).
  if (isEmbedUrl(input)) {
    return { embedSrc: input, openUrl: input, label: "Bandcamp player" };
  }

  // Case 3: a plain URL — link only.
  return { embedSrc: null, openUrl: input, label: labelForLink(input) };
}

function labelForLink(url: string): string {
  return slugToLabel(url) ?? hostname(url) ?? url;
}

/**
 * Cross-origin iframes can't auto-size to their content, so we pick a height
 * from the size hint encoded in the official embed URL.
 */
export function embedHeight(src: string): number {
  if (src.includes("size=small")) return 42;
  if (src.includes("album=")) return 470;
  return 120;
}
