/**
 * Recurso REST /notifications — avisos do sistema (recarga, saldo baixo,
 * ocorrências nas linhas registradas pelos motoristas).
 *
 * O backend não tem rota para "marcar como lida"; o app guarda no aparelho
 * o maior id já visto — é isso que acende/apaga a bolinha do sino.
 */
import { apiRequest } from './api';
import { obterLocal, salvarLocal } from './storage';

const CHAVE_VISTO = 'notificacoes_ultimo_id_visto';
const CACHE_MS = 30000;
let cache = { em: 0, lista: null };

export async function listarNotificacoes({ usarCache = false } = {}) {
  if (usarCache && cache.lista && Date.now() - cache.em < CACHE_MS) {
    return cache.lista;
  }
  const lista = (await apiRequest('/notifications')) || [];
  cache = { em: Date.now(), lista };
  return lista;
}

/** quantos avisos chegaram depois da última visita à tela de avisos */
export async function contarNaoVistas({ usarCache = true } = {}) {
  const [lista, ultimoVisto] = await Promise.all([
    listarNotificacoes({ usarCache }),
    obterLocal(CHAVE_VISTO),
  ]);
  const corte = Number(ultimoVisto) || 0;
  return lista.filter(n => !n.read && Number(n.id) > corte).length;
}

export async function marcarTodasComoVistas(lista) {
  const maior = Math.max(0, ...(lista || []).map(n => Number(n.id) || 0));
  await salvarLocal(CHAVE_VISTO, maior);
}

/** id mais alto já visto — a tela de avisos destaca os mais novos que ele */
export async function ultimoIdVisto() {
  return Number(await obterLocal(CHAVE_VISTO)) || 0;
}
