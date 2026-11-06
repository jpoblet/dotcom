"use client";

import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ProjectLogoTile from "@/components/ProjectLogoTile";

export interface IndexItem {
  key: string;
  name: string;
  /** Internal case-study path, or the live site for websites. */
  href?: string;
  external?: boolean;
  role: string;
  year: string;
  accent: string;
  logo: string;
  brandBackground: string;
}

interface Props {
  items: IndexItem[];
  /** "large": case studies, set huge. "small": websites. */
  size: "large" | "small";
}

/**
 * A typographic index of projects. On devices with a pointer, hovering a row
 * dims the others, nudges the name, and shows a floating preview (the
 * brand's logo in its colours) that follows the cursor. Touch devices see
 * the tile inline instead.
 */
export default function ProjectIndexList({ items, size }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  // The preview eases towards the cursor rather than snapping to it.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      if (preview.current) {
        // Offset to the right of the cursor, so it never covers the name.
        preview.current.style.transform = `translate3d(${current.current.x + 32}px, ${current.current.y}px, 0) translate(0, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onMove = (event: MouseEvent) => {
    target.current = { x: event.clientX, y: event.clientY };
  };

  const large = size === "large";
  const activeItem = active === null ? null : items[active];

  return (
    <div onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <ol className="border-t border-background-inverse/15">
        {items.map((item, index) => {
          const dimmed = active !== null && active !== index;
          const row = (
            <>
              <span className="tabular-nums text-xs text-foreground-secondary pt-[0.6em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span
                  className={`block font-medium tracking-[-0.04em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 sm:group-hover:translate-x-6 ${
                    large
                      ? "text-[clamp(2.25rem,7.5vw,7rem)] leading-[0.95]"
                      : "text-[clamp(1.5rem,3.6vw,3rem)] leading-none"
                  }`}
                >
                  {item.name}
                  {item.external && item.href && (
                    <ArrowUpRight className="inline-block ml-2 size-[0.5em] align-[0.15em] opacity-40 transition-opacity group-hover:opacity-100" />
                  )}
                </span>
                {/* Touch devices: no hover preview, so show the tile inline. */}
                <span className="block [@media(hover:hover)]:hidden mt-4">
                  <ProjectLogoTile
                    project={item}
                    sizes="100vw"
                    compact={!large}
                    className={`rounded-sm ${large ? "w-full aspect-[16/9]" : "w-40 aspect-[16/10]"}`}
                  />
                </span>
              </span>
              <span className="hidden sm:block text-right text-xs leading-relaxed text-foreground-secondary pt-[0.6em]">
                {item.role && <span className="block">{item.role}</span>}
                <span className="block">{item.year || "Coming soon"}</span>
              </span>
            </>
          );
          const className = `group grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr_14rem] items-start gap-x-4 border-b border-background-inverse/15 animate-suggestion-in ${
            large ? "py-6 sm:py-8" : "py-4 sm:py-5"
          }`;
          const style = { animationDelay: `${index * 70}ms` };
          return (
            // Dimming lives on the item: the row's entrance animation would
            // otherwise hold its opacity at 1.
            <li
              key={item.key}
              onMouseEnter={() => setActive(index)}
              className={`transition-opacity duration-300 ${dimmed ? "opacity-25" : "opacity-100"}`}
            >
              {item.href && !item.external ? (
                <Link href={item.href} className={className} style={style}>
                  {row}
                </Link>
              ) : item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
                  {row}
                </a>
              ) : (
                <div className={className} style={style}>
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Floating preview (pointer devices only). */}
      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 hidden [@media(hover:hover)]:block"
      >
        <div
          className={`transition-[opacity,scale,rotate] duration-300 ease-out ${
            activeItem ? "opacity-100 scale-100 rotate-[-3deg]" : "opacity-0 scale-75 rotate-0"
          }`}
        >
          {activeItem && (
            <ProjectLogoTile
              key={activeItem.key}
              project={activeItem}
              sizes="22rem"
              compact={!large}
              className={`rounded-sm shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45)] ${
                large ? "w-[22rem] aspect-[3/2]" : "w-[15rem] aspect-[3/2]"
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
