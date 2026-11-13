import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  obterLocal,
  obterToken,
  obterUsuario,
  removerLocal,
  removerToken,
  salvarLocal,
  salvarToken,
  salvarUsuario,
} from '../src/services/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
  await removerToken();
});

test('dado local salva, lê e remove', async () => {
  await salvarLocal('preferencias', { tema: 'escuro' });
  expect(await obterLocal('preferencias')).toEqual({ tema: 'escuro' });
  await removerLocal('preferencias');
  expect(await obterLocal('preferencias')).toBeNull();
});

test('JSON corrompido devolve null', async () => {
  await AsyncStorage.setItem('auth_usuario', '{quebrado');
  expect(await obterUsuario()).toBeNull();
  await AsyncStorage.setItem('preferencias', '{quebrado');
  expect(await obterLocal('preferencias')).toBeNull();
});

test('removerToken apaga token e perfil', async () => {
  await salvarToken('abc');
  await salvarUsuario({ id: 1, username: 'Ana' });
  await removerToken();
  expect(await obterToken()).toBeNull();
  expect(await obterUsuario()).toBeNull();
});
