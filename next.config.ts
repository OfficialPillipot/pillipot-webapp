import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.flixcart.com",
      },
      {
        protocol: "https",
        hostname: "**.flixcart.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "static-assets-web.flixcart.com",
      },
    ],
  },
};

export default nextConfig;
