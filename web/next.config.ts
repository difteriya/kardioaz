import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this app dir. Without this, Next infers
  // the root from parent folders (the repo has planning docs above web/) and the
  // dev/build can fail to resolve the Next package. See PROJECT-PLAN.md §4.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Real post/media images are served from the existing kardio.az WordPress.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "kardio.az" }],
  },
};

export default nextConfig;
