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
      <div className="flex h-[clamp(1.25rem,3.2vw,2rem)] items-center gap-[0.35em] border-b border-background-inverse/10 px-[0.8em] text-[clamp(0.45rem,1vw,0.6875rem)]">
        <span className="size-[0.7em] rounded-full bg-background-inverse/15" />
        <span className="size-[0.7em] rounded-full bg-background-inverse/15" />
        <span className="size-[0.7em] rounded-full bg-background-inverse/15" />
        {/* Address bar as a wireframe: a blank field, no text. */}
        <span aria-hidden="true" className="mx-auto h-[0.95em] w-1/3 rounded-full bg-background-inverse/8" />
      </div>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}

/**
 * A screenshot in a phone with a thin dark bezel and a mobile browser's
 * wireframe address bar. The screen keeps the captures' exact proportions (390 x 844),
 * so nothing is cropped.
 */
export function PhoneFrame({
  src,
  url,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  url?: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[clamp(0.8rem,2.6vw,1.75rem)] border-[clamp(3px,0.6vw,6px)] border-foreground bg-foreground ${className}`}
    >
      <div className="overflow-hidden rounded-[clamp(0.6rem,2vw,1.35rem)] bg-background">
        {url && (
          <div className="flex items-center justify-center border-b border-background-inverse/10 px-[8%] pt-[7%] pb-[4%]">
            <span aria-hidden="true" className="h-[clamp(0.35rem,0.75vw,0.6rem)] w-3/5 rounded-full bg-background-inverse/8" />
          </div>
        )}
        <div className="relative aspect-[390/844]">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}
