/**
 * Autenticação REST do BusZapp:
 *   POST /auth/login · POST /auth/register · GET /auth/profile · POST /auth/logout
 *   POST /auth/resend-verification
 *   POST /auth/forgot-password · /auth/verify-reset-code · /auth/reset-password
 *
 * Mesmo modelo do projeto do professor: a tela chama login(), o service
 * grava a sessão (token no SecureStore, dados do usuário no AsyncStorage)
 * e sessaoAtiva() confere no backend ao reabrir o app.
 */
import { ApiError, apiRequest } from './api';
import {
  obterLocal,
  obterToken,
  removerLocal,
  salvarLocal,
  obterUsuario,
  removerToken,
  salvarToken,
  salvarUsuario,
} from './storage';

/**
 * Perfis que entram no app: passageiro ("user"), motorista e administrador.
 * O admin tem as abas de administração (Geral, Mapa, Cadastros, Avaliações).
 * Um perfil fora desta lista é recusado e nada fica gravado no aparelho.
 */
export const PERFIS_DO_APP = ['user', 'motorista', 'admin'];
export const MSG_PERFIL_RECUSADO = 'Este tipo de conta não tem acesso ao aplicativo. Use o site do BusZapp.';

// "Lembrar de mim" desmarcado: a sessão vale só até fechar o app
const CHAVE_SESSAO_TEMPORARIA = 'sessao_temporaria';

function montarUsuario(user, motorista) {
  return {
    id: user.id,
    nome: user.username,
    login: user.email,
    role: user.role,
    fotoUrl: user.profile_picture || null,
    criadoEm: user.created_at || null,
    motoristaId: motorista?.id ?? null,
  };
}

async function persistirSessao(data) {
  const usuario = montarUsuario(data.user, data.driver);
  const tarefas = [salvarUsuario(usuario)];
  // Backend com token (rota "client: mobile") → SecureStore. Sem token → sessão por cookie.
  if (data.token) {
    tarefas.push(salvarToken(data.token));
  }
  await Promise.all(tarefas);
  return { token: data.token || null, usuario };
}

export async function login(email, senha, lembrar = true) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password: senha, remember: lembrar, client: 'mobile' },
    });
    if (!PERFIS_DO_APP.includes(data?.user?.role)) {
      // encerra a sessão que o backend acabou de abrir e não grava nada no aparelho
      await apiRequest('/auth/logout', {
        method: 'POST',
        auth: false,
        headers: data?.token ? { Authorization: `Bearer ${data.token}` } : undefined,
        timeoutMs: 5000,
      }).catch(() => {});
      throw new ApiError(MSG_PERFIL_RECUSADO, 403, 'perfil');
    }
    if (lembrar) {
      await removerLocal(CHAVE_SESSAO_TEMPORARIA);
    } else {
      await salvarLocal(CHAVE_SESSAO_TEMPORARIA, true);
    }
    return persistirSessao(data);
  } catch (e) {
    if (e instanceof ApiError && e.dados?.not_verified) {
      e.causa = 'nao_verificado';
    }
    throw e;
  }
}

/**
 * Cadastro não abre sessão: o BusZapp exige confirmar o e-mail antes do
 * primeiro login. A tela leva o usuário para "Verifique seu e-mail".
 */
export async function registrar({ nome, login: email, senha }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    auth: false,
    body: { username: nome, email, password: senha },
  });
}

export function reenviarVerificacao(email) {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
    auth: false,
    body: { email },
  });
}

export function solicitarCodigo(email) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email },
  });
}

export function verificarCodigo(email, codigo) {
  return apiRequest('/auth/verify-reset-code', {
    method: 'POST',
    auth: false,
    body: { email, code: codigo },
  });
}

export function redefinirSenha({ email, codigo, senha, confirmacao }) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: {
      email,
      code: codigo,
      new_password: senha,
      confirm_password: confirmacao,
    },
  });
}

/**
 * Ao abrir o app: há sessão gravada e o backend ainda aceita?
 * Diferente do exemplo do professor, uma falha de REDE não derruba a sessão
 * (o passageiro pode abrir o app sem sinal); só um 401 manda para o login.
 */
export async function sessaoAtiva() {
  const [token, usuario, temporaria] = await Promise.all([
    obterToken(),
    obterUsuario(),
    obterLocal(CHAVE_SESSAO_TEMPORARIA),
  ]);
  if (!token && !usuario) return false;
  if (temporaria) {
    // o usuário entrou sem "Lembrar de mim": ao reabrir o app, pede login de novo
    await logout();
    return false;
  }
  try {
    const perfil = await apiRequest('/auth/profile');
    if (!PERFIS_DO_APP.includes(perfil?.role)) {
      await logout();
      return false;
    }
    await salvarUsuario({ ...usuario, ...montarUsuario(perfil, null), motoristaId: usuario?.motoristaId ?? null });
    return true;
  } catch (e) {
    if (e.status === 401 || e.causa === 'sessao') {
      await removerToken();
      return false;
    }
    return Boolean(usuario) && PERFIS_DO_APP.includes(usuario.role);
  }
}

export async function obterSessao() {
  return obterUsuario();
}

export async function atualizarSessao(dados) {
  const atual = await obterUsuario();
  const proximo = { ...atual, ...dados };
  await salvarUsuario(proximo);
  return proximo;
}

export async function logout() {
  try {
    // invalida o token/cookie no servidor; se estiver sem rede, sai assim mesmo
    await apiRequest('/auth/logout', { method: 'POST', timeoutMs: 5000 });
  } catch {
    // ignora
  }
  await Promise.all([removerToken(), removerLocal(CHAVE_SESSAO_TEMPORARIA)]);
}
