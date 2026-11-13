/**
 * Recurso REST de avaliações
 * POST /submit-rating | GET /ratings (minhas avaliações)
 */
import { apiRequest } from './api';

export function enviarAvaliacao(avaliacao) {
  return apiRequest('/submit-rating', {
    method: 'POST',
    body: {
      overall_rating: avaliacao.geral,
      punctuality_rating: avaliacao.pontualidade,
      cleanliness_rating: avaliacao.limpeza,
      comfort_rating: avaliacao.conforto,
      service_rating: avaliacao.atendimento,
      comments: avaliacao.comentario,
      bus_line: avaliacao.linha,
      trip_date: avaliacao.data,
      trip_time: avaliacao.horario || undefined,
      schedule_departure: avaliacao.horario || undefined,
    },
  });
}

export function minhasAvaliacoes() {
  return apiRequest('/ratings');
}
