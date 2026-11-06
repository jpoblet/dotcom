import type { CSSProperties } from "react";

interface Props {
  logo: string;
  name: string;
  /** Size and placement of the box the logo is fitted into. */
  className?: string;
  /** Where the logo sits in its box. */
  align?: "left" | "center";
}

/**
 * A brand logo with no background, drawn in the current text colour. The
 * logo file is used as a mask, so light, dark and coloured logos all read
 * the same in both themes. Without a logo, the project's initial stands in.
 */
export default function LogoMark({ logo, name, className = "", align = "left" }: Props) {
  if (!logo) {
    return (
      <span
        aria-hidden="true"
        className={`flex items-center font-medium text-foreground-secondary ${align === "center" ? "justify-center" : ""} ${className}`}
      >
        {name.match(/[A-Za-z0-9]/)?.[0]}
      </span>
    );
  }
  const position = align === "center" ? "center" : "left center";
  return (
    <span
      role="img"
      aria-label={`${name} logo`}
      className={`block bg-current ${className}`}
      style={
        {
          maskImage: `url("${logo}")`,
          WebkitMaskImage: `url("${logo}")`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: position,
          WebkitMaskPosition: position,
        } as CSSProperties
      }
    />
  );
}
