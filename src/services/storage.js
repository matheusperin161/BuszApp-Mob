/**
 * SERVICE — storage (versão React Native CLI)
 *
 * Duas gavetas de propósito diferente:
 *   1. Segredo (token da API) → react-native-keychain (Keychain / Keystore)
 *   2. Dado local não secreto (perfil, preferências) → AsyncStorage
 *
 * Senha nunca é gravada. Ver persistencia_nativos_seguranca.md
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const SERVICO_TOKEN = 'br.com.buszapp.mobile.auth';
const CHAVE_USUARIO = 'auth_usuario';

export async function salvarToken(token) {
  await Keychain.setGenericPassword('token', token, {
    service: SERVICO_TOKEN,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function obterToken() {
  const creds = await Keychain.getGenericPassword({ service: SERVICO_TOKEN });
  return creds ? creds.password : null;
}

export async function removerToken() {
  await Keychain.resetGenericPassword({ service: SERVICO_TOKEN });
  await AsyncStorage.removeItem(CHAVE_USUARIO);
}

export async function salvarUsuario(usuario) {
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export async function obterUsuario() {
  const raw = await AsyncStorage.getItem(CHAVE_USUARIO);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function salvarLocal(chave, valor) {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function obterLocal(chave) {
  const raw = await AsyncStorage.getItem(chave);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function removerLocal(chave) {
  await AsyncStorage.removeItem(chave);
}
