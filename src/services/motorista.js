/**
 * Trajeto do motorista — o MESMO fluxo do Painel do Motorista do site
 * (motorista.html), para o passageiro ver o ônibus no site e no app:
 *
 *   GET  /routes                       linhas
 *   GET  /route/:numero/schedules      horários (cada um tem bus_id e bus_number)
 *   POST /auth/driver/trip/start       abre o trajeto do horário escolhido
 *   POST /update_location              posição do ônibus (bus_id do horário)
 *   POST /auth/driver/trip/stop        encerra (o ônibus sai do mapa)
 *   POST /incidents                    ocorrência para os passageiros
 *
 * O acompanhamento (site e app) consulta /bus_location/:bus_id do horário:
 * mostra "iniciado" pelo trajeto aberto e "onde está" pela última posição.
 *
 * O trajeto em andamento fica salvo no aparelho: se o app fechar,
 * ao abrir de novo o motorista continua de onde parou.
 */
import { apiRequest } from './api';
import { obterLocal, removerLocal, salvarLocal } from './storage';

const CHAVE_TRAJETO = 'trajeto_motorista';

export function meusDados() {
  return apiRequest('/auth/driver/me');
}

/** linhas no formato do app: { id, numero, nome, origem, destino } */
export async function linhasDoMotorista() {
  const lista = (await apiRequest('/routes')) || [];
  return lista
    .filter(l => l.active !== false)
    .map(l => ({
      id: l.id,
      numero: String(l.route_number),
      nome: l.route_name,
      origem: l.origin,
      destino: l.destination,
    }))
    .sort((a, b) => a.numero.localeCompare(b.numero, 'pt-BR', { numeric: true }));
}

export function trajetoSalvo() {
  return obterLocal(CHAVE_TRAJETO);
}

/** abre o trajeto no backend (DriverTrip) e guarda no aparelho */
export async function iniciarTrajeto({ linha, horario }) {
  await apiRequest('/auth/driver/trip/start', {
    method: 'POST',
    body: {
      bus_line: `${linha.numero} - ${linha.nome}`,
      departure_time: horario.departure_time,
      bus_number: horario.bus_number,
    },
  });
  const trajeto = { linha, horario, iniciadoEm: new Date().toISOString() };
  await salvarLocal(CHAVE_TRAJETO, trajeto);
  return trajeto;
}

/** manda a posição atual do ônibus do horário (o backend calcula velocidade e próxima parada) */
export function enviarLocalizacao(trajeto, posicao) {
  return apiRequest('/update_location', {
    method: 'POST',
    timeoutMs: 8000,
    body: {
      bus_id: trajeto.horario.bus_id,
      bus_number: trajeto.horario.bus_number,
      latitude: posicao.latitude,
      longitude: posicao.longitude,
      route_id: trajeto.linha.id,
    },
  });
}

export async function encerrarTrajeto() {
  try {
    await apiRequest('/auth/driver/trip/stop', { method: 'POST' });
  } finally {
    await removerLocal(CHAVE_TRAJETO);
  }
}

export const TIPOS_OCORRENCIA = [
  { id: 'atraso', rotulo: 'Atraso', icone: 'clock' },
  { id: 'pane', rotulo: 'Pane mecânica', icone: 'tool' },
  { id: 'acidente', rotulo: 'Acidente', icone: 'alert-triangle' },
  { id: 'outro', rotulo: 'Outro', icone: 'more-horizontal' },
];

export function registrarOcorrencia({ tipo, descricao, trajeto }) {
  return apiRequest('/incidents', {
    method: 'POST',
    body: {
      type: tipo,
      description: descricao,
      bus_number: trajeto?.horario?.bus_number,
      route_id: trajeto?.linha?.id,
      route_number: trajeto?.linha?.numero,
      route_name: trajeto?.linha?.nome,
      schedule_time: trajeto?.horario?.departure_time,
    },
  });
}
