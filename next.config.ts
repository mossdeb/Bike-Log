import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — there's an unrelated stray
  // package-lock.json in the user's home directory that Next.js otherwise
  // picks up as a false-positive monorepo root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
