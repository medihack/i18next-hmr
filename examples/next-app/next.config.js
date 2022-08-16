/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    if (config.mode === 'development') {
      const { FileWatchHMRPlugin } = require('file-watch-hmr/plugin');
      const path = require('path');
      config.plugins.push(
        new FileWatchHMRPlugin({
          folders: [path.resolve(__dirname, 'locales')],
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
