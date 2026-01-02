const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Thêm resolver cho path alias
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname),
  },
};

module.exports = config;


// Updated: 2026-01-02 13:16:03
