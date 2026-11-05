import type { CSSProperties } from "react";
import Image from "next/image";

interface Props {
  name: string;
  accent: string;
  thumbnail?: string;
  /** next/image sizes, for when there is a thumbnail. */
  sizes: string;
  priority?: boolean;
  /** Size, aspect ratio and rounding of the frame. */
  className?: string;
}

/**
 * A project's image: its thumbnail when there is one, otherwise a cover
 * generated from its accent colour and initial (styles in globals.css).
 */
export default function ProjectCover({
  name,
  accent,
  thumbnail,
  sizes,
  priority,
  className = "",
}: Props) {
  const initial = name.match(/[A-Za-z0-9]/)?.[0] ?? "";
  return (
    <div
      className={`relative overflow-hidden border border-background-inverse/10 bg-background-secondary ${className}`}
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={name}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="project-cover"
          style={{ "--accent": accent } as CSSProperties}
          aria-hidden="true"
        >
          <span className="project-cover-monogram">{initial}</span>
        </div>
      )}
    </div>
  );
}
