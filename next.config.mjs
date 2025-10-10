/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'server.poshtibot.com',
                port: '', // Optional, can be omitted if using standard ports (80 for HTTP, 443 for HTTPS)
                pathname: '/**', // Optional, allows all paths; adjust if you want to restrict to specific paths
            }
        ]
    }
}

export default nextConfig