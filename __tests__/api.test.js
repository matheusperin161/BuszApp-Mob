/**
 * Cliente HTTP + sessão: modo token (backend com "client: mobile")
 * e modo cookie (backend publicado hoje).
 */
import { apiRequest } from '../src/services/api';
import { login, logout, sessaoAtiva } from '../src/services/auth';
import { obterToken, obterUsuario } from '../src/services/storage';

function resposta(status, corpo) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(corpo == null ? '' : JSON.stringify(corpo)),
  });
}

const user = { id: 7, username: 'Ana', email: 'ana@x.com', role: 'user', profile_picture: null };

beforeEach(async () => {
  global.fetch = jest.fn();
  await logout().catch(() => {});
  global.fetch.mockReset();
});

test('login com token grava no Keychain e manda Bearer', async () => {
  fetch.mockReturnValueOnce(resposta(200, { role: 'user', user, token: 'abc' }));
  await login('ana@x.com', '123456');
  expect(JSON.parse(fetch.mock.calls[0][1].body).client).toBe('mobile');
  expect(await obterToken()).toBe('abc');

  fetch.mockReturnValueOnce(resposta(200, { balance: 3 }));
  await apiRequest('/balance');
  expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer abc');
  expect(fetch.mock.calls[1][1].credentials).toBe('include');
});

test('login sem token (cookie) mantém a sessão pelo usuário gravado', async () => {
  fetch.mockReturnValueOnce(resposta(200, { role: 'user', user }));
  await login('ana@x.com', '123456');
  expect(await obterToken()).toBeNull();
  expect((await obterUsuario()).nome).toBe('Ana');

  fetch.mockReturnValueOnce(resposta(200, user));
  expect(await sessaoAtiva()).toBe(true);
  expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined();
});

test('e-mail não verificado vira causa nao_verificado', async () => {
  fetch.mockReturnValueOnce(resposta(403, { error: 'E-mail não verificado.', not_verified: true }));
  await expect(login('ana@x.com', '123456')).rejects.toMatchObject({ causa: 'nao_verificado' });
});

test('erro do Flask ({ error }) vira a mensagem', async () => {
  fetch.mockReturnValueOnce(resposta(401, { error: 'E-mail ou senha inválidos' }));
  await expect(login('ana@x.com', 'x')).rejects.toThrow('E-mail ou senha inválidos');
});

test('401 numa rota autenticada derruba a sessão', async () => {
  fetch.mockReturnValueOnce(resposta(200, { role: 'user', user, token: 'abc' }));
  await login('ana@x.com', '123456');
  fetch.mockReturnValueOnce(resposta(401, { error: 'Usuário não autenticado' }));
  expect(await sessaoAtiva()).toBe(false);
  expect(await obterToken()).toBeNull();
});

test('sem rede, sessaoAtiva mantém o usuário logado', async () => {
  fetch.mockReturnValueOnce(resposta(200, { role: 'user', user, token: 'abc' }));
  await login('ana@x.com', '123456');
  fetch.mockReturnValueOnce(Promise.reject(new TypeError('Network request failed')));
  expect(await sessaoAtiva()).toBe(true);
});

test('administrador entra no app', async () => {
  const admin = { ...user, role: 'admin' };
  fetch.mockReturnValueOnce(resposta(200, { role: 'admin', user: admin }));
  const { usuario } = await login('admin@x.com', '123456');
  expect(usuario.role).toBe('admin');
  expect((await obterUsuario()).role).toBe('admin');
});

test('perfil desconhecido é recusado e nada fica gravado', async () => {
  const outro = { ...user, role: 'operador' };
  fetch.mockReturnValueOnce(resposta(200, { role: 'operador', user: outro, token: 'tk-x' }));
  fetch.mockReturnValueOnce(resposta(200, { message: 'ok' })); // logout no servidor
  await expect(login('x@x.com', '123456')).rejects.toMatchObject({ causa: 'perfil', status: 403 });
  expect(fetch.mock.calls[1][0]).toMatch(/\/auth\/logout$/);
  expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer tk-x');
  expect(await obterToken()).toBeNull();
  expect(await obterUsuario()).toBeNull();
});

test('motorista entra normalmente', async () => {
  const motorista = { ...user, role: 'motorista' };
  fetch.mockReturnValueOnce(resposta(200, { role: 'motorista', user: motorista, driver: { id: 3 } }));
  const { usuario } = await login('carlos@x.com', '123456');
  expect(usuario.role).toBe('motorista');
  expect(usuario.motoristaId).toBe(3);
});

test('sessão gravada de um perfil sem acesso é encerrada ao abrir o app', async () => {
  fetch.mockReturnValueOnce(resposta(200, { role: 'user', user }));
  await login('ana@x.com', '123456');
  fetch.mockReturnValueOnce(resposta(200, { ...user, role: 'operador' })); // /auth/profile
  fetch.mockReturnValueOnce(resposta(200, {})); // /auth/logout
  expect(await sessaoAtiva()).toBe(false);
  expect(await obterUsuario()).toBeNull();
});

test('sem "Lembrar de mim" a sessão não volta ao reabrir o app', async () => {
  fetch.mockReturnValueOnce(resposta(200, { role: 'user', user }));
  await login('ana@x.com', '123456', false);
  expect(JSON.parse(fetch.mock.calls[0][1].body).remember).toBe(false);
  fetch.mockReturnValueOnce(resposta(200, {})); // /auth/logout
  expect(await sessaoAtiva()).toBe(false);
  expect(await obterUsuario()).toBeNull();
});

describe('trajeto do motorista (mesmas rotas do painel do site)', () => {
  const {
    encerrarTrajeto,
    enviarLocalizacao,
    iniciarTrajeto,
    trajetoSalvo,
  } = require('../src/services/motorista');
  const linha = { id: 3, numero: '7', nome: 'Centro - Efapi' };
  const horario = { id: 21, departure_time: '09:00', bus_id: 703, bus_number: '703' };

  beforeEach(async () => {
    fetch.mockReturnValueOnce(resposta(200, { role: 'motorista', user: { ...user, role: 'motorista' } }));
    await login('carlos@x.com', '123456');
  });

  test('iniciar abre o trajeto do horário e guarda no aparelho', async () => {
    fetch.mockReturnValueOnce(resposta(201, { message: 'Trajeto registrado' }));
    await iniciarTrajeto({ linha, horario });
    const [url, opcoes] = fetch.mock.calls[1];
    expect(url).toMatch(/\/auth\/driver\/trip\/start$/);
    expect(JSON.parse(opcoes.body)).toEqual({
      bus_line: '7 - Centro - Efapi',
      departure_time: '09:00',
      bus_number: '703',
    });
    expect((await trajetoSalvo()).horario.bus_id).toBe(703);
  });

  test('posição vai para /update_location com o bus_id do horário', async () => {
    fetch.mockReturnValueOnce(resposta(200, { success: true }));
    await enviarLocalizacao({ linha, horario }, { latitude: -27.1, longitude: -52.6 });
    const [url, opcoes] = fetch.mock.calls[1];
    expect(url).toMatch(/\/update_location$/);
    expect(JSON.parse(opcoes.body)).toMatchObject({ bus_id: 703, latitude: -27.1, longitude: -52.6, route_id: 3 });
  });

  test('encerrar chama trip/stop e apaga o trajeto salvo', async () => {
    fetch.mockReturnValueOnce(resposta(201, {}));
    await iniciarTrajeto({ linha, horario });
    fetch.mockReturnValueOnce(resposta(200, { message: 'Trajeto encerrado' }));
    await encerrarTrajeto();
    expect(fetch.mock.calls[2][0]).toMatch(/\/auth\/driver\/trip\/stop$/);
    expect(await trajetoSalvo()).toBeNull();
  });
});

test('resumo das recargas do admin soma só recargas', () => {
  const { resumoRecargas, nomeDaRota } = require('../src/services/admin');
  const agora = new Date().toISOString();
  const r = resumoRecargas([
    { id: 1, transaction_type: 'recharge', amount: 20, created_at: agora },
    { id: 2, transaction_type: 'usage', amount: -5.5, created_at: agora },
    { id: 3, transaction_type: 'recharge', amount: 10, created_at: '2020-01-01T10:00:00' },
  ]);
  expect(r).toMatchObject({ quantidade: 2, valor: 30, hojeQuantidade: 1, hojeValor: 20 });
  expect(nomeDaRota({ route_name: 'Linha_7' })).toBe('Linha 7');
});
