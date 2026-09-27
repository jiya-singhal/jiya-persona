/**
 * A cute app window: lilac title bar with three outlined dots, mono body.
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
    <div className={`sticker overflow-hidden rounded-[20px] bg-card ${className ?? ""}`}>
      <div className="flex items-center gap-2 border-b-1.5 border-outline bg-lilac px-4 py-2.5">
        <span className="h-3 w-3 rounded-full border-1.5 border-on-pastel bg-blush" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full border-1.5 border-on-pastel bg-butter" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full border-1.5 border-on-pastel bg-mint" aria-hidden="true" />
        <span className="ml-2 font-mono text-xs text-on-pastel">{title}</span>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed text-ink sm:p-6">
        {children}
      </div>
    </div>
  );
}
