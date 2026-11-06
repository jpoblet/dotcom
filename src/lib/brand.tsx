/**
 * Shared pieces for the generated icons and link-preview images
 * (src/app/apple-icon.tsx, src/app/opengraph-image.tsx). Server-only.
 */
import fs from "node:fs";
import path from "node:path";

// Hex equivalents of --boulder-950 / --boulder-50 / --boulder-500 in
// globals.css; the image renderer doesn't understand oklch().
export const BRAND = {
  ink: "#030712",
  paper: "#f8fafc",
  muted: "#6b7280",
};

/** The J monogram from public/images/J-logo.svg (viewBox 120×223). */
export function JLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg
      width={(height * 120) / 223}
      height={height}
      viewBox="0 0 120 223"
      fill={color}
    >
      <path d="M25.2026 38.6127H109.732V8.14453H25.2026V38.6127Z" />
      <path d="M7.5 106.619L36.8689 101.319V115.667C37.0907 131.784 46.1389 139.071 58.5075 139.071C71.3164 139.071 79.2621 130.019 79.2621 116.333V8.14307H109.734V116.333C109.734 144.59 89.1975 167.999 58.7293 167.999C27.8143 167.999 7.5 147.682 7.5 116.995V106.619Z" />
      <path d="M4.28564 212.212H112.392V188.143H4.28564V212.212Z" />
    </svg>
  );
}

const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");

export function brandFonts() {
  return [
    {
      name: "DM Mono",
      data: fs.readFileSync(path.join(FONT_DIR, "DMMono-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "DM Mono",
      data: fs.readFileSync(path.join(FONT_DIR, "DMMono-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
  ];
}
