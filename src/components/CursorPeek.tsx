"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import LogoMark from "@/components/LogoMark";

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** What the preview needs: a project card, or a project from the panel. */
export interface PeekProject {
  name: string;
  thumbnail: string;
  thumbnailDark?: string;
  accent: string;
  /** Brand logo in its own colours, shown on the brand background. */
  logo?: string;
  logoMark: string;
  brandBackground: string;
}

/**
 * A screenshot that floats beside the pointer while it rests on a project,
 * trailing it slightly. Pointers that hover only; touch screens skip it.
 */
export default function CursorPeek({ project, anchor }: { project: PeekProject | null; anchor: HTMLElement | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<PeekProject | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true));
    return () => clearTimeout(timeout);
  }, []);

  // Keep the last project while fading out, so the image doesn't vanish.
  useEffect(() => {
    if (!project) return;
    const timeout = setTimeout(() => setShown(project));
    return () => clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => {
      // Up and to the right of the pointer, clear of the line being read.
      tx = e.clientX + 20;
      ty = e.clientY - 172;
      if (!x && !y) [x, y] = [tx, ty];
    };
    const loop = () => {
      x += (tx - x) * (reduce ? 1 : 0.18);
      y += (ty - y) * (reduce ? 1 : 0.18);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    anchor.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(loop);
    return () => {
      anchor.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [anchor, mounted]);

  if (!mounted) return null;

  // Rendered on the body: a transformed ancestor (the side panel) would
  // otherwise become the frame of reference for "fixed".
  return createPortal(
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[60]">
      <div
        className={`w-56 overflow-hidden rounded-md shadow-[0_24px_48px_-20px_rgb(0_0_0/0.35),0_0_0_1px_rgb(0_0_0/0.04)] transition-[opacity,scale,rotate] duration-300 ${EASE} ${
          project ? "scale-100 rotate-[-2deg] opacity-100" : "scale-90 rotate-0 opacity-0"
        }`}
        style={{ background: shown?.brandBackground || shown?.accent }}
      >
        {shown?.thumbnail ? (
          <>
            <Image
              src={shown.thumbnail}
              alt=""
              width={448}
              height={280}
              className={`aspect-[16/10] w-full object-cover ${shown.thumbnailDark ? "block dark:hidden" : "block"}`}
            />
            {/* The dark capture, when the site has one, to match the theme. */}
            {shown.thumbnailDark && (
              <Image
                src={shown.thumbnailDark}
                alt=""
                width={448}
                height={280}
                className="hidden aspect-[16/10] w-full object-cover dark:block"
              />
            )}
          </>
        ) : (
          shown && (
            <div className="flex aspect-[16/10] items-center justify-center text-white/90">
              {shown.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shown.logo} alt="" className="max-h-[38%] max-w-[55%] object-contain" />
              ) : (
                <LogoMark logo={shown.logoMark} name={shown.name} align="center" className="h-8 w-1/2" />
              )}
            </div>
          )
        )}
      </div>
    </div>
    ,
    document.body,
  );
}
