import Image from "next/image";

/** "https://www.example.com/" -> "example.com" */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** A screenshot in a minimal browser window (dots and an address bar). */
export function BrowserFrame({
  src,
  url,
  alt,
  sizes,
  priority,
  className = "",
}: {
  src: string;
  url: string;
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
        <span className="mx-auto max-w-[60%] truncate rounded-full bg-background-inverse/6 px-[1.2em] py-[0.15em] text-foreground-secondary">
          {displayUrl(url)}
        </span>
      </div>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}

/** A screenshot in a phone with a thin dark bezel. */
export function PhoneFrame({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={`aspect-[9/19.5] overflow-hidden rounded-[clamp(0.8rem,2.6vw,1.75rem)] border-[clamp(3px,0.6vw,6px)] border-foreground bg-foreground ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[clamp(0.6rem,2vw,1.35rem)]">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}
