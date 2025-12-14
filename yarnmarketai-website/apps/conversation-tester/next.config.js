/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript and ESLint checks during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_CONVERSATION_ENGINE_URL: process.env.NEXT_PUBLIC_CONVERSATION_ENGINE_URL || 'http://localhost:8003',
  },
}

module.exports = nextConfig
