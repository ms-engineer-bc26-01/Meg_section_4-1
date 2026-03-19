/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker コンテナ内でのホットリロード対応 (3-1 要件)
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
