/**
 * Cliente HTTP único do app.
 * Toda tela passa por aqui — nunca chama fetch direto.
 * Nunca logue headers.Authorization: o token é credencial.
 *
 * Sessão no BusZapp (dois modos, o app aceita os dois):
 *   1. Token Bearer — o login manda "client": "mobile"; se o backend devolver
 *      um token, ele vai para o SecureStore e segue em todo pedido.
 *   2. Cookie de sessão — o backend publicado hoje responde só com o cookie.
 *      O fetch nativo (iOS/Android) guarda e reenvia o cookie sozinho
 *      com credentials: 'include'.
 * Ver persistencia_nativos_seguranca.md (material do professor).
 */
import { API_PREFIX } from './config';
import { obterToken, obterUsuario, removerToken } from './storage';

export const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  /**
   * status 0 = não houve resposta HTTP (rede ou timeout).
   * causa: 'rede' | 'timeout' | 'http' | 'sessao'
   * dados: corpo JSON da resposta (ex.: { not_verified: true })
   */
  constructor(message, status, causa = 'http', dados = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.causa = causa;
    this.dados = dados;
  }
}

function mensagemHttp(status, data) {
  // O Flask do BusZapp responde { error: "..." }; mantemos message por compatibilidade
  // só aceita texto: um { error: {...} } não pode virar "[object Object]" na tela
  const texto = data && [data.error, data.message].find(m => typeof m === 'string' && m.trim());
  if (texto) return texto;
  if (status === 400) return 'Pedido inválido.';
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para isso.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 409) return 'Conflito: esse dado já existe.';
  if (status === 429) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (status >= 500) return 'Erro no servidor. Tente mais tarde.';
  return `Erro HTTP ${status}`;
}

export async function apiRequest(
  path,
  { method = 'GET', body, form, auth = true, timeoutMs = TIMEOUT_MS, headers: extras } = {},
) {
  const headers = { Accept: 'application/json', ...(extras || {}) };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const [token, usuario] = await Promise.all([obterToken(), obterUsuario()]);
    if (!token && !usuario) {
      throw new ApiError('Sessão expirada. Faça login novamente.', 401, 'sessao');
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    const rota = path.startsWith('/') ? path : `/${path}`;
    response = await fetch(`${API_PREFIX}${rota}`, {
      method,
      headers,
      // form (FormData) é usado no upload da foto; o fetch monta o multipart sozinho
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new ApiError('O servidor demorou demais. Tente de novo.', 0, 'timeout');
    }
    throw new ApiError(
      'Sem conexão com o BusZapp. Confira sua internet (ou o endereço em config.js).',
      0,
      'rede',
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // HTML de erro do nginx (502, 504...) não vira mensagem na tela
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      await removerToken();
    }
    throw new ApiError(
      mensagemHttp(response.status, data),
      response.status,
      'http',
      data,
    );
  }

  return data;
}
