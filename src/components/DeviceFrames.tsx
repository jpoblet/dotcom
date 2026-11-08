import Image from "next/image";

/** "https://www.example.com/" -> "example.com" */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

interface ShotProps {
  src: string;
  /** The same screen captured in dark mode, shown when the site is dark. */
  darkSrc?: string;
  /** Kept for callers; screens are no longer tinted. */
  tint?: string;
  /** Kept for callers; no address is drawn. */
  url?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** The faint outline both frames share. */
const OUTLINE = "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-background-inverse)_9%,transparent)]";
/** Grey for the wireframe's dots and address bar. */
const MARK = "bg-background-inverse/10";

/**
 * The screenshot, light or dark to match the site. With a dark capture, both
 * are in the page and the theme shows one (the hidden one isn't fetched).
 */
function Screen({ src, darkSrc, alt, sizes, priority }: Omit<ShotProps, "className" | "tint" | "url">) {
  const cls = "object-cover object-top";
  if (!darkSrc) return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={cls} />;
  return (
    <>
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={`${cls} dark:hidden`} />
      <Image src={darkSrc} alt={alt} fill sizes={sizes} className={`${cls} hidden dark:block`} />
    </>
  );
}

/**
 * A desktop screenshot in a browser drawn as a wireframe: a faint outline,
 * and a top bar with three grey dots and a grey address bar, centred.
 */
export function BrowserFrame({ src, darkSrc, alt, sizes, priority, className = "" }: ShotProps) {
  return (
    // The outer box takes the caller's size and position; the inner one
    // holds the window, so "absolute" from a caller never fights "relative".
    <div className={className}>
      <div className={`overflow-hidden rounded-[0.6rem] bg-background ${OUTLINE}`}>
        <div
          aria-hidden="true"
          className="relative flex h-[clamp(1.25rem,3vw,1.875rem)] items-center gap-[0.4em] border-b border-background-inverse/[0.09] px-[0.85em] text-[clamp(0.45rem,1vw,0.6875rem)]"
        >
          <span className={`size-[0.75em] rounded-full ${MARK}`} />
          <span className={`size-[0.75em] rounded-full ${MARK}`} />
          <span className={`size-[0.75em] rounded-full ${MARK}`} />
          <span
            className={`absolute top-1/2 left-1/2 h-[1.1em] w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full ${MARK}`}
          />
        </div>
        <div className="relative aspect-[16/10]">
          <Screen src={src} darkSrc={darkSrc} alt={alt} sizes={sizes} priority={priority} />
        </div>
      </div>
    </div>
  );
}

/**
 * A phone screenshot in the same wireframe: the faint outline with a
 * phone's rounded corners, and a mobile browser's bar above the screen (a
 * grey address bar). Keeps the captures' proportions (390 x 844), so
 * nothing is cropped. Where it overlaps a desktop shot, a ring of the page
 * colour separates the two.
 */
export function PhoneFrame({ src, darkSrc, alt, sizes, className = "" }: ShotProps) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-[clamp(0.75rem,2.2vw,1.5rem)] bg-background shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-background-inverse)_9%,transparent),0_0_0_5px_var(--color-background)]">
        <div
          aria-hidden="true"
          className="flex h-[clamp(1rem,2.6vw,1.75rem)] items-center justify-center border-b border-background-inverse/[0.09]"
        >
          <span className={`h-[38%] w-3/5 rounded-full ${MARK}`} />
        </div>
        <div className="relative aspect-[390/844]">
          <Screen src={src} darkSrc={darkSrc} alt={alt} sizes={sizes} />
        </div>
      </div>
    </div>
  );
}
