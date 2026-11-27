/**
 * Recurso REST do administrador — as mesmas rotas do painel do site (admin.html).
 *   GET   /admin/active-trips-count   ônibus em rota agora
 *   GET   /admin/all-bus-locations    mapa ao vivo (GPS dos últimos 15 min)
 *   GET   /admin/drivers?q=           motoristas
 *   GET   /admin/vehicles             frota
 *   GET   /admin/routes               linhas com paradas
 *   PATCH /admin/routes/:id           ativa/desativa linha
 *   GET   /admin/ratings              avaliações
 *   GET   /admin/all-transactions     recargas e passagens
 *   GET   /admin/users/cards          cartões dos passageiros
 * Cadastros:
 *   POST/PUT/DELETE /admin/drivers[/:id]                 motoristas (cria também o login)
 *   POST/PUT/DELETE /admin/vehicles[/:id]                frota
 *   POST            /admin/routes                        nova linha (+ origem/destino como paradas)
 *   GET/POST/PUT/DELETE /admin/routes/:id/stops[/:sid]   paradas da linha
 * Todas exigem sessão de admin no backend (403 para os outros perfis).
 */
import { apiRequest } from './api';

export function onibusEmRotaContagem() {
  return apiRequest('/admin/active-trips-count');
}

export async function onibusAoVivo() {
  return (await apiRequest('/admin/all-bus-locations')) || [];
}

export async function motoristas() {
  return (await apiRequest('/admin/drivers')) || [];
}

export async function veiculos() {
  return (await apiRequest('/admin/vehicles')) || [];
}

export async function rotas() {
  return (await apiRequest('/admin/routes')) || [];
}

export function ativarRota(id, ativa) {
  return apiRequest(`/admin/routes/${id}`, { method: 'PATCH', body: { active: ativa } });
}

export async function avaliacoes() {
  return (await apiRequest('/admin/ratings')) || [];
}

export async function transacoes() {
  return (await apiRequest('/admin/all-transactions')) || [];
}

export async function cartoes() {
  return (await apiRequest('/admin/users/cards')) || [];
}

/** "Linha_7" (nome interno do rastreio) → "Linha 7" */
export function nomeDaRota(rota) {
  return String(rota?.route_name ?? '').replace(/^Linha_/, 'Linha ');
}

/** resumo das recargas: total, valor, hoje (fuso do aparelho) */
export function resumoRecargas(lista) {
  const recargas = (lista || []).filter(t => t.transaction_type === 'recharge');
  const hoje = new Date().toDateString();
  const deHoje = recargas.filter(t => {
    const d = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(t.created_at) ? t.created_at : `${t.created_at}Z`);
    return d.toDateString() === hoje;
  });
  const soma = itens => itens.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  return {
    quantidade: recargas.length,
    valor: soma(recargas),
    hojeQuantidade: deHoje.length,
    hojeValor: soma(deHoje),
    ultimas: recargas.slice(0, 5),
  };
}

// ── Cadastros ────────────────────────────────────────────────────────────────

/** cria (sem id) ou edita (com id) um motorista; devolve o motorista salvo */
export async function salvarMotorista(id, dados) {
  const data = await apiRequest(id ? `/admin/drivers/${id}` : '/admin/drivers', {
    method: id ? 'PUT' : 'POST',
    body: dados,
  });
  return data?.driver;
}

export function excluirMotorista(id) {
  return apiRequest(`/admin/drivers/${id}`, { method: 'DELETE' });
}

export async function salvarVeiculo(id, dados) {
  const data = await apiRequest(id ? `/admin/vehicles/${id}` : '/admin/vehicles', {
    method: id ? 'PUT' : 'POST',
    body: dados,
  });
  return data?.vehicle;
}

export function excluirVeiculo(id) {
  return apiRequest(`/admin/vehicles/${id}`, { method: 'DELETE' });
}

/** linha nova: o backend já cria a origem e o destino como 1ª e 2ª paradas e os horários padrão */
export function criarLinha(dados) {
  return apiRequest('/admin/routes', { method: 'POST', body: dados });
}

export async function paradasDaRota(rotaId) {
  return (await apiRequest(`/admin/routes/${rotaId}/stops`)) || [];
}

export async function salvarParada(rotaId, id, dados) {
  const data = await apiRequest(
    id ? `/admin/routes/${rotaId}/stops/${id}` : `/admin/routes/${rotaId}/stops`,
    { method: id ? 'PUT' : 'POST', body: dados },
  );
  return data?.stop;
}

export function excluirParada(rotaId, id) {
  return apiRequest(`/admin/routes/${rotaId}/stops/${id}`, { method: 'DELETE' });
}

/**
 * Troca a posição de duas paradas (setinhas ↑ ↓ da lista).
 * O backend não tem "reordenar": salva a ordem de uma e depois da outra.
 */
export async function trocarOrdem(rotaId, a, b) {
  await salvarParada(rotaId, a.id, { order: b.order });
  await salvarParada(rotaId, b.id, { order: a.order });
}

/** linhas no formato "7 - Centro - Efapi" (é assim que motorista e veículo guardam a linha) */
export async function opcoesDeLinha() {
  const lista = (await apiRequest('/routes')) || [];
  return lista
    .map(l => ({
      id: `${l.route_number} - ${l.route_name}`,
      marcador: String(l.route_number),
      rotulo: l.route_name,
      detalhe: l.origin && l.destination ? `${l.origin} → ${l.destination}` : undefined,
    }))
    .sort((a, b) => a.marcador.localeCompare(b.marcador, 'pt-BR', { numeric: true }));
}

export const STATUS_MOTORISTA = [
  { id: 'ativo', rotulo: 'Ativo' },
  { id: 'afastado', rotulo: 'Afastado' },
  { id: 'inativo', rotulo: 'Inativo' },
];

export const STATUS_VEICULO = [
  { id: 'ativo', rotulo: 'Ativo' },
  { id: 'manutencao', rotulo: 'Manutenção' },
  { id: 'inativo', rotulo: 'Inativo' },
];

export const CATEGORIAS_CNH = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];
