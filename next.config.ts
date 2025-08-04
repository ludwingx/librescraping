import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignora errores de ESLint durante el build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignora errores de TypeScript durante el build
  },
  images: {
    domains: [
      "noticias-admin-panel.vercel.app",
      "tuto-noticias-test.vercel.app",
      "i.postimg.cc",
      "placeholder.com" 
    ],
  },
};

export default nextConfig;
