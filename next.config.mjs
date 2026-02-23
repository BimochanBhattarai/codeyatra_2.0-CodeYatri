/** @type {import('next').NextConfig} */

const api_url =
  // process.env.API_URL || "https://toptiergaming-z0f5.onrender.com";
  process.env.API_URL || "https://api.bimochanbhattarai.com.np";

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
        hostname: "api.bimochanbhattarai.com.np",
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
