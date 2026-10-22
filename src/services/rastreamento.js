/**
 * SERVICE — rastreamento
 * Rastreamento em tempo real: src/routes/viagens.py (/api)
 */
import { api } from './api';

/** Linhas ativas com as paradas em ordem. */
export function listarLinhas() {
  return api.get('/api/linhas');
}

/** Viagens em andamento da linha, com última posição, próxima parada e ETA. */
export function viagensDaLinha(linhaId) {
  return api.get(`/api/viagens/ativas?linha_id=${linhaId}`);
}
