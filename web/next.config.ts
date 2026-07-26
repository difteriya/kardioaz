import type { NextConfig } from "next";
import path from "node:path";
import fs from "node:fs";

/**
 * Old-site → new-site 301s. The old WordPress used slugs with Azerbaijani
 * letters (ə/ü/ç/ş/ğ/ö/ı); the migration folded them to ASCII. These redirects
 * preserve the SEO of every already-indexed URL by permanently pointing the old
 * path at the new one. Generated during migration (migration/README.md).
 *
 * Read at build time and baked into the build — the file only needs to exist
 * when `next build` runs (the server git-pulls the whole repo, so it does).
 * Wrapped so a missing/broken file logs and yields zero redirects instead of
 * failing the production build.
 */
function loadRedirects(): { source: string; destination: string; permanent: boolean }[] {
  try {
    const file = path.resolve(__dirname, "../migration/301-redirects.json");
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    console.warn("[next.config] 301 redirects not loaded:", (err as Error).message);
    return [];
  }
}

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
  // Old Azerbaijani-letter slugs → new ASCII slugs (SEO preservation at cut-over).
  async redirects() {
    return loadRedirects();
  },
};

export default nextConfig;
