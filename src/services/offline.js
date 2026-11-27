/**
 * SERVICE — horários e paradas sem internet.
 *
 * Toda consulta de linhas, horários e paradas passa por comCache():
 *   com internet → busca no servidor e guarda uma cópia no aparelho
 *   sem internet → devolve a última cópia guardada, com a data em que foi salva
 * Em Configurações dá para baixar de uma vez os horários de todas as linhas
 * (útil antes de sair de casa, para consultar no ponto sem sinal).
 */
import { carregarLinhasCompletas, listarHorarios, paradasDaLinha } from './linhas';
import { obterLocal, salvarLocal } from './storage';

const PREFIXO = 'offline:';
const CHAVE_RESUMO = `${PREFIXO}resumo`;

/** erro de rede, timeout ou servidor fora: vale cair para a cópia */
export function semConexao(erro) {
  return erro?.causa === 'rede' || erro?.causa === 'timeout' || erro?.status === 0 || erro?.status >= 500;
}

/**
 * Busca com cópia de segurança.
 * Devolve { dados, offline, salvoEm } — offline=true quando veio da cópia.
 */
export async function comCache(chave, buscar) {
  try {
    const dados = await buscar();
    const salvoEm = new Date().toISOString();
    await salvarLocal(PREFIXO + chave, { dados, salvoEm }).catch(() => {});
    return { dados, offline: false, salvoEm };
  } catch (e) {
    if (!semConexao(e)) throw e;
    const copia = await obterLocal(PREFIXO + chave).catch(() => null);
    if (!copia) throw e;
    return { dados: copia.dados, offline: true, salvoEm: copia.salvoEm };
  }
}

export const chaves = {
  linhas: () => 'linhas',
  horarios: numero => `horarios:${numero}`,
  paradas: numero => `paradas:${numero}`,
};

export function linhasComCache() {
  return comCache(chaves.linhas(), carregarLinhasCompletas);
}

export function horariosComCache(numero) {
  return comCache(chaves.horarios(numero), () => listarHorarios(numero));
}

export function paradasComCache(numero) {
  return comCache(chaves.paradas(numero), () => paradasDaLinha(numero));
}

/**
 * Baixa linhas, horários e paradas de todas as linhas.
 * progresso(feitas, total) é chamado a cada linha.
 */
export async function baixarTudo(progresso = () => {}) {
  const { dados: linhas, offline } = await linhasComCache();
  if (offline) throw new Error('Sem internet agora. Conecte-se para baixar os horários.');
  let feitas = 0;
  progresso(0, linhas.length);
  for (const linha of linhas) {
    await Promise.all([horariosComCache(linha.numero), paradasComCache(linha.numero)]).catch(() => {});
    feitas += 1;
    progresso(feitas, linhas.length);
  }
  const resumo = { linhas: linhas.length, salvoEm: new Date().toISOString() };
  await salvarLocal(CHAVE_RESUMO, resumo);
  return resumo;
}

/** { linhas, salvoEm } do último download completo (ou null) */
export function resumoOffline() {
  return obterLocal(CHAVE_RESUMO).catch(() => null);
}
