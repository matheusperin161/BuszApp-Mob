/**
 * Serviço do cartão: confere rota, método e nomes dos campos que o Flask espera.
 */
import { cadastrarCartao, recarregar } from '../src/services/cartao';
import { API_PREFIX } from '../src/services/config';
import { salvarToken } from '../src/services/storage';

beforeEach(async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{}') }),
  );
  await salvarToken('abc');
});

test('cadastrarCartao manda os campos em inglês para /card/register', async () => {
  await cadastrarCartao({ numero: '12345678', titular: 'Ana', tipo: 'estudante' });
  const [url, opcoes] = fetch.mock.calls[0];
  expect(url).toBe(`${API_PREFIX}/card/register`);
  expect(opcoes.method).toBe('POST');
  expect(JSON.parse(opcoes.body)).toEqual({
    card_number: '12345678',
    holder_name: 'Ana',
    card_type: 'estudante',
  });
});

test('recarregar manda valor e forma de pagamento para /recharge', async () => {
  await recarregar(20.5, 'pix');
  const [url, opcoes] = fetch.mock.calls[0];
  expect(url).toBe(`${API_PREFIX}/recharge`);
  expect(JSON.parse(opcoes.body)).toEqual({ amount: 20.5, payment_method: 'pix' });
});
