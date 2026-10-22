/**
 * SERVICE — admin
 * Painel administrativo: src/routes/admin.py (/api/admin)
 */
import { api, querystring } from './api';

/** Filtros: status ('ativo' | 'afastado' | 'inativo') e q (nome ou CPF). */
export function listarMotoristas({ status, q } = {}) {
  return api.get(`/api/admin/drivers${querystring({ status, q })}`);
}

export function obterMotorista(id) {
  return api.get(`/api/admin/drivers/${id}`);
}

export function criarMotorista(dados) {
  return api.post('/api/admin/drivers', dados);
}

export function editarMotorista(id, dados) {
  return api.put(`/api/admin/drivers/${id}`, dados);
}

/** 409 com motivo quando há viagem em andamento ou histórico. */
export function excluirMotorista(id) {
  return api.delete(`/api/admin/drivers/${id}`);
}

/** Todas as viagens em andamento, de todas as linhas (mapa do admin). */
export function viagensEmAndamento() {
  return api.get('/api/viagens/ativas');
}
