"use client";

import { useState } from "react";
import { CommandPalette } from "./CommandPalette";
import { CatWalk } from "./CatWalk";
import { useKonami } from "./useKonami";

/**
 * Single client-side mount point for the site's hidden layer.
 * All listeners attach in effects; nothing touches window during SSR.
 */
export function EasterEggs() {
  const [cat, setCat] = useState(false);

  useKonami(() => {
    setCat(false);
    requestAnimationFrame(() => setCat(true));
  });

  return (
    <>
      <CommandPalette />
      {cat && <CatWalk onDone={() => setCat(false)} />}
    </>
  );
}
