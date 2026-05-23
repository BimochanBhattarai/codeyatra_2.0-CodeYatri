/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.65",
        port: "4000",
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
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.65:4000",
    IMAGE_BASE_URL: process.env.IMAGE_BASE_URL,
  },
};

export default nextConfig;