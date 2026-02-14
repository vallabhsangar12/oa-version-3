/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Force cache invalidation after architecture refactor
  generateBuildId: () => "arch-refactor-" + Date.now(),
}

export default nextConfig
