"use client";

import { Fragment } from "react";

/**
 * A slow looping strip. Content is duplicated for a seamless wrap;
 * reduced motion gets a single static row.
 */
export function Marquee({
  items,
  className = "",
}: {
  items: readonly string[];
  className?: string;
}) {
  const row = (
    <>
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden="true" className="font-mono text-butter-deep/70">
            →
          </span>
        </Fragment>
      ))}
    </>
  );

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className="flex w-max items-center gap-6 animate-marquee motion-reduce:animate-none">
        <div className="flex items-center gap-6">{row}</div>
        <div className="flex items-center gap-6">{row}</div>
      </div>
    </div>
  );
}
