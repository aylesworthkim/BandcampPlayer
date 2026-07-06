export default function SessionTitle({
  title,
  onChange,
}: {
  title: string;
  onChange: (title: string) => void;
}) {
  return (
    <input
      value={title}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Session title"
      placeholder="Untitled Sesh"
      spellCheck={false}
      className="w-full rounded-lg bg-transparent text-4xl font-bold tracking-tight text-white outline-none placeholder:text-zinc-700 focus:bg-zinc-900/40"
    />
  );
}
