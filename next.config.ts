import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The chat route reads the Markdown files in /content at request time, so
  // make sure they are bundled with the serverless function on deploy.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**/*"],
  },
};

export default nextConfig;
