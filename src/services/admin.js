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
