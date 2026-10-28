/**
 * SERVICE — paradas
 * Paradas e associação a linhas (linha_parada): src/routes/paradas.py (/api/admin)
 */
import { api, querystring } from './api';

/** Filtros: status ('ativa' | 'inativa') e q (nome ou endereço). */
export function listarParadas({ status, q } = {}) {
  return api.get(`/api/admin/paradas${querystring({ status, q })}`);
}

export function obterParada(id) {
  return api.get(`/api/admin/paradas/${id}`);
}

/** Lat/lon fora de -90..90 / -180..180 é recusado pelo servidor (CA05.1). */
export function criarParada(dados) {
  return api.post('/api/admin/paradas', dados);
}

export function editarParada(id, dados) {
  return api.put(`/api/admin/paradas/${id}`, dados);
}

/** 409 com `dados.linhas` quando a parada está em uso por linha ativa (CA05.5). */
export function desativarParada(id) {
  return api.patch(`/api/admin/paradas/${id}/desativar`);
}

export function reativarParada(id) {
  return api.patch(`/api/admin/paradas/${id}/reativar`);
}

/** Paradas associadas à linha, em ordem, por sentido (CA05.2/CA05.4). */
export function paradasDaLinha(linhaId, sentido) {
  return api.get(`/api/admin/linhas/${linhaId}/paradas${querystring({ sentido })}`);
}

/** Associa uma parada existente à linha com sentido e ordem; ordem repetida no par linha/sentido é recusada (CA05.2/CA05.3). */
export function associarParada(linhaId, dados) {
  return api.post(`/api/admin/linhas/${linhaId}/paradas`, dados);
}

/** Remove a associação; o servidor reordena as demais do mesmo par linha/sentido (CA05.3). */
export function removerAssociacao(linhaId, associacaoId) {
  return api.delete(`/api/admin/linhas/${linhaId}/paradas/${associacaoId}`);
}
