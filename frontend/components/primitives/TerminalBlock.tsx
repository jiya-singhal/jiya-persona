/**
 * Fake-terminal chrome: title bar with three dots, mono body.
 * Server-safe; interactive content is provided by children.
 */
export function TerminalBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-panel/80 shadow-panel ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden="true" />
        <span className="ml-2 font-mono text-xs text-mist">{title}</span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed text-ivory sm:p-6">
        {children}
      </div>
    </div>
  );
}
