/**
 * Linhas, paradas, horários e posição dos ônibus.
 *   GET /routes                 → linhas (número, nome, origem, destino, tarifa)
 *   GET /linhas                 → linhas de rastreamento com paradas (id usado nas viagens)
 *   GET /route/:numero/schedules→ horários de saída de cada ônibus
 *   GET /route/:numero           → paradas da linha (mesmas do site)
 *   GET /bus_location/:busId    → última posição do ônibus daquele horário
 *   GET /viagens/ativas?linha_id→ viagens em andamento (motoristas usando o app)
 * Todas são públicas no backend, mas o app só mostra para quem está logado.
 */
import { apiRequest } from './api';

export function listarLinhas() {
  return apiRequest('/routes');
}

export function listarLinhasRastreio() {
  return apiRequest('/linhas', { auth: false });
}

export function listarHorarios(numeroLinha) {
  return apiRequest(`/route/${encodeURIComponent(numeroLinha)}/schedules`, { auth: false });
}

export async function paradasDaLinha(numeroLinha) {
  const data = await apiRequest(`/route/${encodeURIComponent(numeroLinha)}`, { auth: false });
  return data?.stop_points ?? [];
}

export function posicaoDoOnibus(busId) {
  return apiRequest(`/bus_location/${busId}`, { auth: false });
}

export function viagensAtivas(linhaId) {
  return apiRequest(`/viagens/ativas?linha_id=${linhaId}`, { auth: false });
}

/** junta /routes (tarifa, origem/destino) com /linhas (id de rastreio e paradas) pelo número */
export async function carregarLinhasCompletas() {
  const [linhas, rastreio] = await Promise.all([
    listarLinhas(),
    listarLinhasRastreio().catch(() => []),
  ]);
  const porNumero = new Map((rastreio || []).map(item => [String(item.numero), item]));
  return (linhas || []).map(linha => {
    const extra = porNumero.get(String(linha.route_number));
    return {
      id: linha.id,
      numero: linha.route_number,
      nome: linha.route_name,
      origem: linha.origin,
      destino: linha.destination,
      tarifa: linha.fare,
      rastreioId: extra?.id ?? null,
      paradas: extra?.paradas ?? [],
    };
  });
}
