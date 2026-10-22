/**
 * Cliente HTTP único do app.
 * Toda tela passa por aqui — nunca chama fetch direto.
 *
 * Obs.: o backend Flask usa sessão (cookie), não Bearer token.
 * No Android/iOS o cookie de sessão é guardado pela camada nativa do fetch.
 */
import { API_URL } from './config';

export class ApiError extends Error {
  constructor(mensagem, { status = 0, dados = null } = {}) {
    super(mensagem);
    this.status = status;
    this.dados = dados;
  }

  /** Sem resposta do servidor (sem rede, servidor fora do ar). */
  get semConexao() {
    return this.status === 0;
  }
}

// Rede ruim pode deixar a conexão pendurada sem erro; sem limite, a fila de posições travaria
const TEMPO_LIMITE_MS = 15_000;

async function requisicao(metodo, caminho, corpo) {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  let resposta;
  let dados;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      credentials: 'include',
      headers: { Accept: 'application/json', ...(corpo !== undefined && { 'Content-Type': 'application/json' }) },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controle.signal,
    });
    dados = await resposta.json().catch(() => null);
  } catch {
    throw new ApiError('Sem conexão com o servidor.');
  } finally {
    clearTimeout(limite);
  }

  if (!resposta.ok) {
    throw new ApiError(dados?.error || `Erro ${resposta.status}`, { status: resposta.status, dados });
  }
  return dados;
}

export const api = {
  get: (caminho) => requisicao('GET', caminho),
  post: (caminho, corpo = {}) => requisicao('POST', caminho, corpo),
  put: (caminho, corpo = {}) => requisicao('PUT', caminho, corpo),
  patch: (caminho, corpo = {}) => requisicao('PATCH', caminho, corpo),
  delete: (caminho) => requisicao('DELETE', caminho),
};

/** Monta "?a=1&b=2" ignorando valores vazios. */
export function querystring(params) {
  const pares = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!pares.length) return '';
  return `?${pares.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`;
}
