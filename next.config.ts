import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Disabled: conflicts with Framer Motion's internal hook patterns in React 19
  reactCompiler: false,

  // Required: prevents Webpack/Turbopack from picking up the package.json
  // in the parent Cube/ directory as the workspace root
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
