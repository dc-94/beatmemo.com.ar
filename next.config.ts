import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
    allowedDevOrigins: ["192.168.1.42", "*.nip.io", "192.168.100.86.nip.io"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/djmbcrliu/**",
      },
    ],
  },
};

export default nextConfig;