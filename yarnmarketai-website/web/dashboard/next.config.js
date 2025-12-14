/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript type checking during builds (Railway production builds)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005',
    NEXT_PUBLIC_CONVERSATION_API_URL: process.env.NEXT_PUBLIC_CONVERSATION_API_URL || 'http://localhost:8003',
  },
}

module.exports = nextConfig
