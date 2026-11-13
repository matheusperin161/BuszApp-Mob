/**
 * Recurso REST do cartão de transporte (mesmas rotas da tela Recarga do site)
 * GET /balance | GET /card/info | POST /card/register | POST /recharge | GET /transactions
 */
import { apiRequest } from './api';

export function obterSaldo() {
  return apiRequest('/balance');
}

export function obterCartao() {
  return apiRequest('/card/info');
}

export function cadastrarCartao({ numero, titular, tipo }) {
  return apiRequest('/card/register', {
    method: 'POST',
    body: { card_number: numero, holder_name: titular, card_type: tipo },
  });
}

/** formaPagamento: 'pix' | 'cartao' */
export function recarregar(valor, formaPagamento) {
  return apiRequest('/recharge', {
    method: 'POST',
    body: { amount: valor, payment_method: formaPagamento },
  });
}

export function listarTransacoes() {
  return apiRequest('/transactions');
}
