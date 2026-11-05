import Image from "next/image";

interface Props {
  name: string;
  url: string;
  desktopImage: string;
  /** Optional phone screenshot, overlapping the browser window. */
  mobileImage?: string;
}

/** "https://www.example.com/" -> "example.com" */
const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * A live website, shown as a product shot: the desktop screenshot in a
 * minimal browser window and, overlapping it, a phone showing another part
 * of the site, to show it's responsive. Sizes are relative to the panel, so
 * the composition scales down on phones.
 */
export default function DeviceShowcase({ name, url, desktopImage, mobileImage }: Props) {
  return (
    <div className="relative aspect-[16/11] overflow-hidden rounded-sm border border-background-inverse/10 bg-background-secondary">
      {/* Browser window */}
      <div
        className={`absolute top-[7%] left-[5%] overflow-hidden rounded-[0.6rem] border border-background-inverse/15 bg-background shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] ${
          mobileImage ? "w-[78%]" : "w-[90%]"
        }`}
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
          <Image
            src={desktopImage}
            alt={`${name} website on a desktop browser`}
            fill
            priority
            sizes="(min-width: 1008px) 750px, 80vw"
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* Phone */}
      {mobileImage && (
        <div className="absolute bottom-[7%] right-[5%] w-[21%] aspect-[9/19.5] overflow-hidden rounded-[clamp(0.8rem,2.6vw,1.75rem)] border-[clamp(3px,0.6vw,6px)] border-foreground bg-foreground shadow-[0_24px_60px_-16px_rgb(0_0_0/0.45)]">
          <div className="relative h-full w-full overflow-hidden rounded-[clamp(0.6rem,2vw,1.35rem)]">
            <Image
              src={mobileImage}
              alt={`${name} website on a phone`}
              fill
              sizes="(min-width: 1008px) 200px, 21vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      )}
    </div>
  );
}
