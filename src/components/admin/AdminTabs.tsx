"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/conversations", label: "Conversations" },
] as const;

/**
 * The admin's sections, drawn like the home page's Work / AI Notes tabs:
 * quiet labels with a soft hover, the current one underlined. The time
 * range carries over from one section to the next.
 */
export default function AdminTabs() {
  const pathname = usePathname();
  const range = useSearchParams().get("range");
  return (
    <nav aria-label="Admin sections" className="flex items-center gap-1">
      {TABS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={range ? `${href}?range=${range}` : href}
            aria-current={active ? "page" : undefined}
            className={`group/tab relative flex h-20 items-center text-xs transition-colors ${
              active ? "text-foreground" : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            <span className="relative flex items-center rounded-md px-2.5 py-1.5 transition-colors group-hover/tab:bg-background-inverse/6">
              {label}
              <span
                className={`absolute inset-x-2.5 -bottom-1 h-px origin-left bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
