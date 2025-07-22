/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@tensorflow/tfjs-node']
  },
  typescript: {
    // Enable TypeScript support
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint support
    ignoreDuringBuilds: false,
  },
  env: {
    // Expose environment variables to the client
    ENABLE_REALTIME: process.env.ENABLE_REALTIME,
    ENABLE_AI_WATCHING: process.env.ENABLE_AI_WATCHING,
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: '/ai/:path*',
        destination: '/api/ai/:path*',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Optimize for AI libraries
    if (isServer) {
      config.externals.push({
        '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node'
      });
    }

    // Handle file imports for AI models
    config.module.rules.push({
      test: /\.(json|bin)$/,
      type: 'asset/resource',
    });

    return config;
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig; 