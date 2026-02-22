/** @type {import('next').NextConfig} */

const api_url =
  // process.env.API_URL || "https://toptiergaming-z0f5.onrender.com";
  process.env.API_URL || "http://localhost:4000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${api_url}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "toptiergaming-z0f5.onrender.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "**",
      },
    ],
    unoptimized: true,
  },
  env: {
    IMAGE_BASE_URL: process.env.IMAGE_BASE_URL,
  },
};

export default nextConfig;
