export type SessionItem = {
  id: string;
  url: string;
};

export type SessionState = {
  title: string;
  items: SessionItem[];
  activeId: string | null;
};
