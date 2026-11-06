import Image from "next/image";

/** "https://www.example.com/" -> "example.com" */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** A screenshot in a minimal browser window (dots and a wireframe address bar). */
export function BrowserFrame({
  src,
  alt,
  sizes,
  priority,
  className = "",
}: {
  src: string;
  /** The site's address (not shown: the bar is a wireframe). */
  url?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[0.6rem] border border-background-inverse/15 bg-background ${className}`}
    >
      <div className="relative flex h-[clamp(1.25rem,3.2vw,2rem)] items-center gap-[0.35em] border-b border-background-inverse/10 px-[0.8em] text-[clamp(0.45rem,1vw,0.6875rem)]">
        <span className="size-[0.7em] rounded-full bg-background-inverse/15" />
        <span className="size-[0.7em] rounded-full bg-background-inverse/15" />
        <span className="size-[0.7em] rounded-full bg-background-inverse/15" />
        {/* Address bar as a wireframe: a blank field, no text. */}
        {/* Centred on the whole window, not just the space after the dots. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[0.95em] w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background-inverse/8"
        />
      </div>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}

/**
 * A screenshot in a phone: the same hairline outline as the browser, the
 * screen inset from the edges, a wireframe address bar on top and a
 * wireframe toolbar (back, forward, share, bookmarks, tabs) at the bottom.
 * The capture is shown at full width and trimmed slightly at the bottom by
 * the toolbar.
 */
export function PhoneFrame({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  /** The site's address (not shown: the bars are wireframes). */
  url?: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[clamp(0.75rem,2.2vw,1.5rem)] border border-background-inverse/15 bg-background ${className}`}
    >
      {/* Percentages below resolve against this wrapper (the phone's own
          width), even when the phone is absolutely positioned. */}
      <div className="px-[5%]">
      {/* Address bar */}
      <div aria-hidden="true" className="flex items-center justify-center pt-[9%] pb-[5%]">
        <span className="h-[clamp(0.35rem,0.75vw,0.6rem)] w-3/5 rounded-full bg-background-inverse/8" />
      </div>
      {/* Screen */}
      <div className="relative aspect-[390/780] overflow-hidden rounded-[clamp(0.2rem,0.5vw,0.4rem)] border border-background-inverse/10">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
      </div>
      {/* Toolbar */}
      <div aria-hidden="true" className="flex items-center justify-between px-[6%] pt-[6%] pb-[9%]">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="aspect-square w-[9%] rounded-[25%] bg-background-inverse/10" />
        ))}
      </div>
      </div>
    </div>
  );
}
