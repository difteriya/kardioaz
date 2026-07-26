import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Standalone output bundles a self-contained server at .next/standalone/server.js
  // — the startup file Plesk's Passenger needs. On deploy, copy .next/static and
  // public/ next to it (standalone doesn't include them). See PLESK-DEPLOY.md.
  output: "standalone",
  // Pin the Turbopack workspace root to this app dir. Without this, Next infers
  // the root from parent folders (the repo has planning docs above web/) and the
  // dev/build can fail to resolve the Next package. See PROJECT-PLAN.md §4.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Post/media images come from the headless WordPress on cms.kardio.az.
  // kardio.az is kept for the old-site images and og:image references.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cms.kardio.az" },
      { protocol: "https", hostname: "kardio.az" },
    ],
  },
};

export default nextConfig;
