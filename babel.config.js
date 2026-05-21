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
            // Web: bypass Font.isLoaded gate; native vẫn dùng @expo/vector-icons gốc
            '^@expo/vector-icons$': './components/expo-vector-icons.ts',
          },
        },
      ],
      // Temporarily disabled NativeWind to fix web text node errors
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};


// Updated: 2026-01-02 13:16:03
