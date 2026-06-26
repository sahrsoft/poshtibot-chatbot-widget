/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'server.poshtibot.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig
