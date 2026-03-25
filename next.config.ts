import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdagua.vtexassets.com",
      },
      {
        protocol: "https",
        hostname: "**.vtexassets.com",
      },
      {
        protocol: "https",
        hostname: "cdagua.vteximg.com.br",
      },
      {
        protocol: "https",
        hostname: "**.vteximg.com.br",
      },
    ],
  },
};

export default nextConfig;
