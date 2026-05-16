/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Body size limit ke liye (Experimental but works)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // Server Actions ke liye
    },
  },
};

module.exports = nextConfig;