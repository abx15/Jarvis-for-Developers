/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-dev-os/ui', '@ai-dev-os/config'],
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
