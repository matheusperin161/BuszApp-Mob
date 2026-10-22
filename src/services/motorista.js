/**
 * SERVICE — motorista
 * Viagens do motorista: src/routes/viagens.py (/api/viagens)
 */
import { api } from './api';

/** { linhas, veiculos, sentidos } — só linhas e veículos ativos. */
export function opcoesViagem() {
  return api.get('/api/viagens/opcoes');
}

export async function viagemAtual() {
  const { viagem } = await api.get('/api/viagens/atual');
  return viagem;
}

export async function iniciarViagem({ linhaId, veiculoId, sentido }) {
  const { viagem } = await api.post('/api/viagens', { linha_id: linhaId, veiculo_id: veiculoId, sentido });
  return viagem;
}

/** posicoes: [{ latitude, longitude, velocidade, registrado_em }] */
export function enviarPosicoes(viagemId, posicoes) {
  return api.post(`/api/viagens/${viagemId}/posicoes`, { posicoes });
}

export function finalizarViagem(viagemId) {
  return api.post(`/api/viagens/${viagemId}/finalizar`);
}
