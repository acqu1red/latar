/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')();

const nextConfig = {
  output: "export", // Для статического экспорта
  images: {
    unoptimized: true, // Для статического экспорта
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
