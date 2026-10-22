/**
 * SERVICE — storage (versão Expo)
 *
 * - seguro (expo-secure-store): dados da sessão do usuário logado.
 * - local (AsyncStorage): volume maior e não sensível, como a fila de posições offline.
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_SESSAO = 'buszapp_sessao';

export async function salvarSessao(sessao) {
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(sessao));
}

export async function lerSessao() {
  const bruto = await SecureStore.getItemAsync(CHAVE_SESSAO);
  return bruto ? JSON.parse(bruto) : null;
}

export async function limparSessao() {
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
}

export async function lerJSON(chave, padrao = null) {
  const bruto = await AsyncStorage.getItem(chave);
  return bruto ? JSON.parse(bruto) : padrao;
}

export async function salvarJSON(chave, valor) {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function remover(chave) {
  await AsyncStorage.removeItem(chave);
}
