const { default: next } = require('next')
const { postcss } = require('tailwindcss')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
