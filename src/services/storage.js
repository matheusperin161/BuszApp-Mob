/**
 * SERVICE — storage (versão Expo)
 *
 * - seguro (expo-secure-store): dados da sessão do usuário logado.
 * - local (AsyncStorage): volume maior e não sensível, como a fila de posições offline.
 *
 * A sessão só é legível com o aparelho desbloqueado e não vai para backups/outros aparelhos.
 * Conteúdo corrompido é tratado como ausente (nunca derruba o app na abertura).
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_SESSAO = 'buszapp_sessao';
const OPCOES_SEGURO = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

function analisar(bruto, padrao) {
  if (!bruto) return padrao;
  try {
    return JSON.parse(bruto);
  } catch {
    return padrao;
  }
}

export async function salvarSessao(sessao) {
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(sessao), OPCOES_SEGURO);
}

export async function lerSessao() {
  return analisar(await SecureStore.getItemAsync(CHAVE_SESSAO, OPCOES_SEGURO), null);
}

export async function limparSessao() {
  await SecureStore.deleteItemAsync(CHAVE_SESSAO, OPCOES_SEGURO);
}

export async function lerJSON(chave, padrao = null) {
  return analisar(await AsyncStorage.getItem(chave), padrao);
}

export async function salvarJSON(chave, valor) {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function remover(chave) {
  await AsyncStorage.removeItem(chave);
}
