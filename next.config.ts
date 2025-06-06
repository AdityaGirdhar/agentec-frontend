import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/github/add-repo",
        destination: "http://127.0.0.1:8000/github/add-repo",
      },
    ];
  },
};

export default nextConfig;