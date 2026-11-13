/**
 * Preferências do aparelho — não são segredo.
 * Sobrevivem ao logout (o token não).
 */
import { obterLocal, salvarLocal } from './storage';

const CHAVE = 'prefs_app';

export const PREFS_PADRAO = {
  // aviso local quando o saldo do cartão fica abaixo de R$ 5,00
  avisoSaldoBaixo: true,
  // mapa do acompanhamento atualiza sozinho a cada 5 s
  atualizacaoAutomatica: true,
  // número da linha aberta por último — atalho na tela inicial
  ultimaLinha: null,
};

export async function obterPreferencias() {
  const gravadas = await obterLocal(CHAVE);
  return { ...PREFS_PADRAO, ...(gravadas || {}) };
}

export async function salvarPreferencias(prefs) {
  const atual = await obterPreferencias();
  const proxima = { ...atual, ...prefs };
  await salvarLocal(CHAVE, proxima);
  return proxima;
}
