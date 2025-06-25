/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@jitsi/react-sdk'],
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
//   async redirects() {
//     return [
//       {
//         source: '/',
//         destination: '/chat',
//         permanent: false,
//       },
//     ]
//   },
}

module.exports = nextConfig
