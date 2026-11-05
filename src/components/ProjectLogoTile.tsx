import ProjectCover from "@/components/ProjectCover";

interface Props {
  /** A project, or a chat card's data: both carry these fields. */
  project: { name: string; accent: string; logo: string; brandBackground: string };
  /** Used for the generated cover when the project has no logo. */
  sizes: string;
  /** Size, aspect ratio and rounding of the tile. */
  className?: string;
  /** Small tiles give the logo more of the space, so it stays legible. */
  compact?: boolean;
}

/**
 * The project's brand logo on its brand background, for the projects page.
 * Projects without a logo fall back to the generated cover.
 */
export default function ProjectLogoTile({
  project,
  sizes,
  className = "",
  compact = false,
}: Props) {
  if (!project.logo) {
    return (
      <ProjectCover
        name={project.name}
        accent={project.accent}
        sizes={sizes}
        className={className}
      />
    );
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-background-inverse/10 ${className}`}
      style={{ background: project.brandBackground }}
    >
      {/* Plain img: logos are small, and some are SVG. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.logo}
        alt={`${project.name} logo`}
        loading="lazy"
        className={`object-contain transition-transform duration-500 group-hover:scale-105 ${
          compact ? "max-w-[72%] max-h-[62%]" : "max-w-[45%] max-h-[38%]"
        }`}
      />
    </div>
  );
}
