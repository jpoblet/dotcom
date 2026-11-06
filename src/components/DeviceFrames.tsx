import Image from "next/image";

/** "https://www.example.com/" -> "example.com" */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * The faintest edge, so a white screenshot doesn't melt into a white page.
 * Not a frame: no fill, no toolbar, nothing around the screen itself.
 */
const EDGE = "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-background-inverse)_8%,transparent)]";

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

/** A desktop screenshot, as it is: rounded corners and nothing else. */
export function BrowserFrame({ src, alt, sizes, priority, className = "" }: ShotProps) {
  return (
    // The outer box takes the caller's size and position; the inner one
    // holds the image, so "absolute" from a caller never fights "relative".
    <div className={className}>
      <div className={`relative aspect-[16/10] overflow-hidden rounded-[0.6rem] bg-background ${EDGE}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
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
