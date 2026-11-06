import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/content";
import { BRAND, JLogo, brandFonts } from "@/lib/brand";

const profile = getProfile();

export const alt = `${profile.name}, ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BRAND.ink,
          color: BRAND.paper,
          fontFamily: "DM Sans",
        }}
      >
        <JLogo height={140} color={BRAND.paper} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 34, color: BRAND.muted }}>
            {profile.title}
          </div>
          <div style={{ fontSize: 26, color: BRAND.muted, marginTop: 24 }}>
            {profile.location}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: brandFonts() },
  );
}
