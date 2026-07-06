// Official Bandcamp embed players are always served from this path. We only ever
// render an <iframe> whose src matches this prefix, so arbitrary user-supplied
// markup can never be turned into an embedded frame.
const EMBED_PREFIX = "https://bandcamp.com/EmbeddedPlayer/";

// Everything we can derive from a pasted URL or embed snippet. Mirrors the
// optional metadata fields on SessionItem (minus id/url).
export type BandcampMetadata = {
  kind: "link" | "embed";
  label: string;
  title?: string;
  artist?: string;
  album?: string;
  artworkUrl?: string;
  sourceUrl: string;
  embedSrc?: string;
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

// Best-effort artwork: only if a Bandcamp image URL is literally present in the
// pasted input. We never fetch pages, so most items have no artwork and fall
// back to a generated placeholder.
function extractArtwork(text: string): string | undefined {
  const match = text.match(
    /https?:\/\/[a-z0-9.-]*bcbits\.com\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif)/i,
  );
  return match ? match[0] : undefined;
}

// "Track Title by Artist" -> { title: "Track Title", artist: "Artist" }.
function splitTitleArtist(text: string): { title: string; artist?: string } {
  const marker = text.toLowerCase().lastIndexOf(" by ");
  if (marker === -1) return { title: text };
  return {
    title: text.slice(0, marker).trim(),
    artist: text.slice(marker + 4).trim() || undefined,
  };
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

// "forty-winks" -> "Forty Winks", "jettison-mind-hatch" -> "Jettison Mind Hatch".
function titleize(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Turn a "/track/forty-winks" or "/album/jettison-mind-hatch" path into a
// title-cased label ("Forty Winks", "Jettison Mind Hatch").
function slugToLabel(url: string): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return undefined;
  }

  const match = pathname.match(/\/(?:track|album)\/([^/?#]+)/i);
  if (!match) return undefined;

  const label = titleize(match[1]);
  return label ? label : undefined;
}

// Standard artist pages live at "<artist>.bandcamp.com", so the subdomain gives
// us the artist name. Custom domains don't follow this pattern, so we return
// undefined and callers fall back to a title-only label.
function artistFromUrl(url: string): string | undefined {
  const host = hostname(url);
  const match = host?.match(/^([^.]+)\.bandcamp\.com$/i);
  return match ? titleize(match[1]) : undefined;
}

function combineLabel(title?: string, artist?: string): string | undefined {
  if (title && artist) return `${title} by ${artist}`;
  return title;
}

// Metadata for a plain track/album/artist URL (no embed).
function linkMetadata(url: string, artworkUrl?: string): BandcampMetadata {
  const title = slugToLabel(url);
  const artist = artistFromUrl(url);
  const isAlbum = /\/album\//i.test(url);
  return {
    kind: "link",
    label: combineLabel(title, artist) ?? hostname(url) ?? url,
    title,
    artist,
    album: isAlbum ? title : undefined,
    artworkUrl,
    sourceUrl: url,
  };
}

/**
 * Interpret a raw pasted string, deriving as much metadata as possible. It may
 * be an embed snippet, a direct EmbeddedPlayer URL, or a plain URL. This runs
 * once when an item is added; components read the stored fields instead.
 */
export function parseBandcampInput(raw: string): BandcampMetadata {
  const input = raw.trim();

  // Case 1: an embed iframe snippet.
  if (input.includes("<iframe")) {
    const src = extractAttr(input, "src");
    const href = extractAttr(input, "href");
    const artworkUrl = extractArtwork(input);

    if (src && isEmbedUrl(src)) {
      const sourceUrl = href ?? src;
      const anchor = extractAnchorText(input);
      const fromAnchor = anchor ? splitTitleArtist(anchor) : null;

      const title = fromAnchor?.title ?? (href ? slugToLabel(href) : undefined);
      const artist =
        fromAnchor?.artist ?? (href ? artistFromUrl(href) : undefined);
      const label =
        anchor ??
        combineLabel(title, artist) ??
        (href ? hostname(href) ?? href : "Bandcamp player");

      return {
        kind: "embed",
        label,
        title,
        artist,
        album: src.includes("album=") ? title : undefined,
        artworkUrl,
        sourceUrl,
        embedSrc: src,
      };
    }

    // An <iframe> that isn't a recognizable Bandcamp embed: never render it.
    return linkMetadata(href ?? input, artworkUrl);
  }

  // Case 2: a direct EmbeddedPlayer URL (no human-readable name available).
  if (isEmbedUrl(input)) {
    return {
      kind: "embed",
      label: "Bandcamp player",
      sourceUrl: input,
      embedSrc: input,
    };
  }

  // Case 3: a plain URL — link only.
  return linkMetadata(input, extractArtwork(input));
}

/**
 * Bandcamp's big-artwork layout buries the track title and transport controls.
 * We normalize embeds to the compact horizontal player (small artwork, no
 * tracklist) so the current track name and play button stay prominent. Only
 * display params are changed — the release id and colours are preserved.
 */
export function normalizeEmbedSrc(src: string): string {
  if (!src.startsWith(EMBED_PREFIX)) return src;

  const params = new Map<string, string>();
  for (const segment of src.slice(EMBED_PREFIX.length).split("/")) {
    if (!segment) continue;
    const eq = segment.indexOf("=");
    if (eq === -1) params.set(segment, "");
    else params.set(segment.slice(0, eq), segment.slice(eq + 1));
  }

  params.set("size", "large");
  params.set("artwork", "small");
  params.set("tracklist", "false");
  if (!params.has("transparent")) params.set("transparent", "true");

  const rebuilt = Array.from(params.entries())
    .map(([key, value]) => (value === "" ? key : `${key}=${value}`))
    .join("/");

  return `${EMBED_PREFIX}${rebuilt}/`;
}

/**
 * Cross-origin iframes can't auto-size to their content, so we pick a height
 * from the size hint encoded in the official embed URL.
 */
export function embedHeight(src: string): number {
  if (src.includes("size=small")) return 42;
  if (src.includes("artwork=small")) return 120;
  if (src.includes("album=")) return 470;
  return 120;
}
