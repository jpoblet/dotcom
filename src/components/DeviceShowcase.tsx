import { BrowserFrame, PhoneFrame } from "@/components/DeviceFrames";

interface Props {
  name: string;
  url: string;
  desktopImage: string;
  /** Optional phone screenshot, overlapping the browser window. */
  mobileImage?: string;
}

/**
 * A live website, shown as a product shot: the desktop screenshot in a
 * minimal browser window and, overlapping it, a phone showing another part
 * of the site, to show it's responsive. Sizes are relative, so the
 * composition scales down on phones.
 */
export default function DeviceShowcase({ name, url, desktopImage, mobileImage }: Props) {
  return (
    <div className="relative aspect-[25/14]">
      <BrowserFrame
        src={desktopImage}
        url={url}
        alt={`${name} website on a desktop browser`}
        priority
        sizes="(min-width: 1008px) 770px, 80vw"
        className={`absolute top-0 left-0 ${mobileImage ? "w-[80%]" : "w-full"}`}
      />
      {mobileImage && (
        <PhoneFrame
          src={mobileImage}
          url={url}
          alt={`${name} website on a phone`}
          sizes="(min-width: 1008px) 200px, 21vw"
          className="absolute bottom-0 right-0 w-[21%]"
        />
      )}
    </div>
  );
}
