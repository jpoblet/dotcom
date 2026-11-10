import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The chat route reads the Markdown files in /content at request time, so
  // make sure they are bundled with the serverless function on deploy.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**/*"],
  },
  // The projects page and the /projects/<slug> pages are gone: case studies
  // now open in the home page's side panel, at /work/<slug>. Old links land
  // in the right place.
  async redirects() {
    return [
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/projects/:slug", destination: "/work/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
