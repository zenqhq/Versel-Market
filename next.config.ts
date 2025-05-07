
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add the new hostname here
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      // Add media.discordapp.net hostname
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        port: '',
        pathname: '/**',
      },
      // Add discord.com (which redirects to cdn.discordapp.com sometimes)
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // Explicitly allow cdn.discordapp.com
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
