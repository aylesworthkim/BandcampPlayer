export type SessionItem = {
  id: string;
  // The raw pasted input, kept so metadata can be re-derived if needed.
  url: string;

  // Metadata derived once, when the item is added (see lib/bandcamp.ts).
  kind?: "link" | "embed";
  label?: string;
  artist?: string;
  title?: string;
  album?: string;
  artworkUrl?: string;
  sourceUrl?: string;
  embedSrc?: string;
};

export type SessionState = {
  title: string;
  items: SessionItem[];
  activeId: string | null;
};

// A cloud session row as listed in "My Sessions".
export type CloudSessionMeta = {
  id: string;
  title: string;
  updatedAt: string;
};

// A cloud session with its items loaded, ready to open in the editor.
export type CloudSession = CloudSessionMeta & {
  items: SessionItem[];
};
