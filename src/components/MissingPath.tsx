"use client";

import { usePathname } from "next/navigation";

/** The address the visitor tried, for the 404 page. */
export default function MissingPath() {
  const path = usePathname();
  if (!path || path === "/") return null;
  return (
    <p className="font-mono text-xs text-foreground-secondary">
      Nothing lives at <span className="break-all text-foreground">{path}</span>
    </p>
  );
}
