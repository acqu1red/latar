/** @type {import('next').NextConfig} */
// const withNextIntl = require('next-intl/plugin')(
//   './src/i18n.ts'
// );

const nextConfig = {
  output: "export", // Для статического экспорта
  trailingSlash: true,
  basePath: "/latar", // Для GitHub Pages
  assetPrefix: "/latar", // Для статических файлов
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

module.exports = nextConfig;
