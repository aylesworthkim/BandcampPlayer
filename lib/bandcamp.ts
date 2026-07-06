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
};

function extractAttr(html: string, attr: "src" | "href"): string | null {
  const match = html.match(
    new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i"),
  );
  return match ? match[1] : null;
}

function isEmbedUrl(value: string): boolean {
  return value.startsWith(EMBED_PREFIX);
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
      return { embedSrc: src, openUrl: href ?? src };
    }
    // An <iframe> that isn't a recognizable Bandcamp embed: never render it.
    return { embedSrc: null, openUrl: href ?? input };
  }

  // Case 2: a direct EmbeddedPlayer URL.
  if (isEmbedUrl(input)) {
    return { embedSrc: input, openUrl: input };
  }

  // Case 3: a plain URL — link only.
  return { embedSrc: null, openUrl: input };
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
