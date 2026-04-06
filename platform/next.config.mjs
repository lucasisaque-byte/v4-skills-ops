/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://v4-skills-ops-production.up.railway.app'
    ).replace(/\/$/, '')
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backend}/:path*`,
      },
    ]
  },
}

export default nextConfig
