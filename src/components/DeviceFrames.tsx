import type { CSSProperties } from "react";
import Image from "next/image";

/**
 * Colours for a frame tinted by the screen it shows: a translucent wash of
 * the screenshot's background, a hairline in the same hue, and dots and
 * wireframe bars that stay visible on light or dark screens.
 */
function frameColors(tint?: string): CSSProperties {
  if (!tint) {
    return {
      "--frame-bg": "var(--color-background)",
      "--frame-line": "color-mix(in oklab, var(--color-background-inverse) 15%, transparent)",
      "--frame-mark": "color-mix(in oklab, var(--color-background-inverse) 9%, transparent)",
    } as CSSProperties;
  }
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(tint.slice(i, i + 2), 16) / 255);
  const dark = 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
  return {
    "--frame-bg": `color-mix(in oklab, ${tint} 55%, var(--color-background))`,
    "--frame-line": `color-mix(in oklab, color-mix(in oklab, ${tint} 75%, var(--color-background-inverse)) 45%, transparent)`,
    "--frame-mark": dark ? "rgb(255 255 255 / 0.22)" : "rgb(0 0 0 / 0.1)",
  } as CSSProperties;
}

/** "https://www.example.com/" -> "example.com" */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** A screenshot in a minimal browser window (dots and a wireframe address bar). */
export function BrowserFrame({
  src,
  tint,
  alt,
  sizes,
  priority,
  className = "",
}: {
  src: string;
  /** Background colour of the screenshot; the frame takes a tint of it. */
  tint?: string;
  /** The site's address (not shown: the bar is a wireframe). */
  url?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      style={frameColors(tint)}
      className={`overflow-hidden rounded-[0.6rem] border border-[var(--frame-line)] bg-[var(--frame-bg)] ${className}`}
    >
      <div className="relative flex h-[clamp(1.25rem,3.2vw,2rem)] items-center gap-[0.35em] border-b border-[var(--frame-line)] px-[0.8em] text-[clamp(0.45rem,1vw,0.6875rem)]">
        <span className="size-[0.7em] rounded-full bg-[var(--frame-mark)]" />
        <span className="size-[0.7em] rounded-full bg-[var(--frame-mark)]" />
        <span className="size-[0.7em] rounded-full bg-[var(--frame-mark)]" />
        {/* Address bar as a wireframe: a blank field, no text. */}
        {/* Centred on the whole window, not just the space after the dots. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[0.95em] w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--frame-mark)]"
        />
      </div>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}

/**
 * A screenshot in a phone: the same hairline outline as the browser, a
 * wireframe address bar, and the screen set in from the edges so it
 * breathes. The screen keeps the captures' proportions (390 x 844), so
 * nothing is cropped. Tinted by the screen it shows, like the browser.
 */
export function PhoneFrame({
  src,
  tint,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  tint?: string;
  /** The site's address (not shown: the bar is a wireframe). */
  url?: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      style={frameColors(tint)}
      className={`overflow-hidden rounded-[clamp(0.9rem,2.6vw,1.75rem)] border border-[var(--frame-line)] bg-[var(--frame-bg)] ${className}`}
    >
      {/* Percentages resolve against this wrapper (the phone's own width),
          even when the phone is absolutely positioned. */}
      <div className="px-[7%] pb-[7%]">
        <div aria-hidden="true" className="flex items-center justify-center pt-[8%] pb-[6%]">
          <span className="h-[clamp(0.35rem,0.75vw,0.6rem)] w-1/2 rounded-full bg-[var(--frame-mark)]" />
        </div>
        <div className="relative aspect-[390/844] overflow-hidden rounded-[clamp(0.3rem,0.9vw,0.6rem)]">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}
