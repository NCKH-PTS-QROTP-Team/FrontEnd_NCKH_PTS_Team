module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};


// Updated: 2026-01-02 13:16:03
