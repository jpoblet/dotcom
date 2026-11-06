import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import {
  getProfile,
  getProject,
  getProjects,
  hasPage,
  projectMeta,
} from "@/lib/content";
import { BRAND, JLogo, brandFonts } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project preview";

// Prerender one image per built project page, like the page itself.
export function generateStaticParams() {
  return getProjects()
    .filter(hasPage)
    .map((project) => ({ slug: project.slug }));
}

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/** A local PNG/JPEG thumbnail from /public as a data URL, if there is one. */
function thumbnailSrc(thumbnail: string): string | undefined {
  if (!thumbnail.startsWith("/")) return undefined;
  const mime = MIME[path.extname(thumbnail).toLowerCase()];
  const file = path.join(process.cwd(), "public", thumbnail);
  if (!mime || !fs.existsSync(file)) return undefined;
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

export default async function ProjectImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  const { name } = getProfile();
  const thumb = project ? thumbnailSrc(project.thumbnail) : undefined;
  const meta = project ? projectMeta(project) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BRAND.ink,
          color: BRAND.paper,
          fontFamily: "DM Sans",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <JLogo height={56} color={BRAND.paper} />
            <div style={{ fontSize: 26, color: BRAND.muted }}>{name}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {meta && (
              <div style={{ fontSize: 24, color: BRAND.muted }}>{meta}</div>
            )}
            <div
              style={{
                fontSize: thumb ? 52 : 64,
                fontWeight: 700,
                letterSpacing: -1.5,
                lineHeight: 1.15,
              }}
            >
              {project?.name ?? "Project"}
            </div>
            {project?.summary && (
              <div
                style={{
                  fontSize: 26,
                  color: BRAND.muted,
                  lineHeight: 1.4,
                  // Keep long summaries to three lines.
                  display: "block",
                  lineClamp: 3,
                }}
              >
                {project.summary}
              </div>
            )}
          </div>
        </div>
        {thumb && (
          <img
            src={thumb}
            alt=""
            width={480}
            height={630}
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
    ),
    { ...size, fonts: brandFonts() },
  );
}
