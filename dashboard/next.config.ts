import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.facebook.com' },
    ],
  },
}

export default nextConfig
