import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Disabled: conflicts with Framer Motion's internal hook patterns in React 19
  reactCompiler: false,

  // Pins the workspace root to this directory so Turbopack never infers it
  // from a lockfile or package.json further up the OneDrive tree
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
