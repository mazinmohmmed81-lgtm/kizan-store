import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // ضروري لكي تعمل الصور في التصدير الثابت
  },
};

export default nextConfig;