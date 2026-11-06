import Image from "next/image";

/** "https://www.example.com/" -> "example.com" */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

interface ShotProps {
  src: string;
  /** Kept for callers; screens are no longer tinted. */
  tint?: string;
  /** Kept for callers; no address bar is drawn. */
  url?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * A desktop screenshot in a browser drawn as a wireframe: a hairline window
 * and a top bar with three outlined dots and an outlined address bar,
 * centred. Line work only, no fills, so it reads as a sketch around the
 * real screen.
 */
export function BrowserFrame({ src, alt, sizes, priority, className = "" }: ShotProps) {
  const line = "border-background-inverse/20";
  return (
    // The outer box takes the caller's size and position; the inner one
    // holds the window, so "absolute" from a caller never fights "relative".
    <div className={className}>
      <div className={`overflow-hidden rounded-[0.6rem] border ${line} bg-background`}>
        <div
          aria-hidden="true"
          className={`relative flex h-[clamp(1.25rem,3vw,1.875rem)] items-center gap-[0.4em] border-b ${line} px-[0.85em] text-[clamp(0.45rem,1vw,0.6875rem)]`}
        >
          <span className={`size-[0.75em] rounded-full border ${line}`} />
          <span className={`size-[0.75em] rounded-full border ${line}`} />
          <span className={`size-[0.75em] rounded-full border ${line}`} />
          <span
            className={`absolute top-1/2 left-1/2 h-[1.1em] w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full border ${line}`}
          />
        </div>
        <div className="relative aspect-[16/10]">
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

/**
 * A phone screenshot with a phone's rounded corners, no device drawn
 * around it. Keeps the captures' proportions (390 x 844), so nothing is
 * cropped. Where it overlaps a desktop shot, a ring of the page colour
 * separates the two.
 */
export function PhoneFrame({ src, alt, sizes, className = "" }: ShotProps) {
  return (
    <div className={className}>
      <div className="relative aspect-[390/844] overflow-hidden rounded-[clamp(0.75rem,2.2vw,1.5rem)] bg-background shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-background-inverse)_8%,transparent),0_0_0_5px_var(--color-background)]">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}
