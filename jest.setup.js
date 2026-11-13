/* eslint-env jest */
/**
 * Mocks das bibliotecas nativas: no Jest não existe Android/iOS,
 * então Keychain, AsyncStorage, GPS, câmera e notificações viram dublês.
 */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('react-native-keychain', () => {
  let salvo = null;
  return {
    ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'x' },
    setGenericPassword: jest.fn(async (usuario, senha) => {
      salvo = { username: usuario, password: senha };
      return true;
    }),
    getGenericPassword: jest.fn(async () => salvo || false),
    resetGenericPassword: jest.fn(async () => {
      salvo = null;
      return true;
    }),
  };
});

jest.mock('@notifee/react-native', () => require('@notifee/react-native/jest-mock'));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
  setRNConfiguration: jest.fn(),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({ didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return { WebView: View };
});
