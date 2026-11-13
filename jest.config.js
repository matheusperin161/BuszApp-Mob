module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // O preset padrão não transpila as bibliotecas que adicionamos
  // (React Navigation, screens, gesture-handler, WebView, AsyncStorage...),
  // que são publicadas em ESM. Sem isso o Jest quebra em `export`.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native[^/]*|@react-native(-community)?' +
      '|@react-navigation|react-native-screens|react-native-safe-area-context' +
      '|react-native-gesture-handler|react-native-webview|react-native-keychain' +
      '|react-native-image-picker|@notifee|@react-native-async-storage)/)',
  ],
};
