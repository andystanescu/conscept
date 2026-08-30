import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* GoDaddy builds from source and manages the production runtime. */
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
