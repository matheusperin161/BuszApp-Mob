/**
 * Erros do cliente HTTP: rede, timeout, respostas sem JSON e mensagens padrão.
 * auth: false para não depender de sessão gravada.
 */
import { apiRequest } from '../src/services/api';
import { API_PREFIX } from '../src/services/config';

function resposta(status, texto = '') {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(texto),
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

test('sem rede vira causa rede com status 0', async () => {
  fetch.mockRejectedValueOnce(new TypeError('Network request failed'));
  await expect(apiRequest('/lines', { auth: false })).rejects.toMatchObject({
    status: 0,
    causa: 'rede',
  });
});

test('pedido abortado vira causa timeout', async () => {
  const abortado = new Error('Aborted');
  abortado.name = 'AbortError';
  fetch.mockRejectedValueOnce(abortado);
  await expect(apiRequest('/lines', { auth: false })).rejects.toMatchObject({
    status: 0,
    causa: 'timeout',
  });
});
