/**
 * Lotação, QR Code, escala e gráficos: chamadas ao backend e utilitários de data/hora.
 */
import { escalas, estatisticas, salvarEscala } from '../src/services/admin';
import { apiRequest } from '../src/services/api';
import { gerarQrEmbarque } from '../src/services/cartao';
import { cobrarPorQr, informarLotacao, minhaEscala, registrarOcorrencia } from '../src/services/motorista';
import { horaValida, isoLocal, mascaraHora, rotuloDoDia, somarDias } from '../src/utils/formato';

jest.mock('../src/services/api', () => ({ apiRequest: jest.fn(async () => ({})) }));

beforeEach(() => apiRequest.mockClear());

test('datas e horas da escala', () => {
  const agora = new Date(2026, 10, 27, 10, 0); // sexta 27/11/2026
  expect(rotuloDoDia('2026-11-27', agora)).toBe('Hoje');
  expect(rotuloDoDia('2026-11-28', agora)).toBe('Amanhã');
  expect(rotuloDoDia('2026-11-30', agora)).toBe('Seg 30/11');
  expect(somarDias('2026-11-30', 2)).toBe('2026-12-02');
  expect(isoLocal(agora)).toBe('2026-11-27');
  expect(mascaraHora('0630')).toBe('06:30');
  expect(horaValida('23:59')).toBe(true);
  expect(horaValida('24:00')).toBe(false);
});

test('motorista: lotação, QR, escala e ocorrência com local', async () => {
  await informarLotacao('lotado');
  expect(apiRequest).toHaveBeenLastCalledWith('/auth/driver/trip/lotacao', { method: 'POST', body: { lotacao: 'lotado' } });
  await cobrarPorQr('tok');
  expect(apiRequest).toHaveBeenLastCalledWith('/embarque', { method: 'POST', body: { token: 'tok' } });
  await minhaEscala(7);
  expect(apiRequest).toHaveBeenLastCalledWith('/auth/driver/escala?dias=7');
  await registrarOcorrencia({ tipo: 'pane', descricao: '', posicao: { latitude: -27, longitude: -52 } });
  expect(apiRequest.mock.calls.at(-1)[1].body).toMatchObject({ type: 'pane', latitude: -27, longitude: -52 });
});

test('passageiro gera o QR e admin usa escala e gráficos', async () => {
  await gerarQrEmbarque();
  expect(apiRequest).toHaveBeenLastCalledWith('/card/qr');
  await escalas('2026-11-27', '2026-12-03');
  expect(apiRequest).toHaveBeenLastCalledWith('/admin/escalas?de=2026-11-27&ate=2026-12-03');
  await salvarEscala(4, { fim: '15:00' });
  expect(apiRequest).toHaveBeenLastCalledWith('/admin/escalas/4', { method: 'PUT', body: { fim: '15:00' } });
  await estatisticas(90);
  expect(apiRequest).toHaveBeenLastCalledWith('/admin/estatisticas?dias=90');
});

test('dados do widget: saldo, 1ª favorita e horários', () => {
  const { dadosDoWidget } = require('../src/services/widget');
  const d = dadosDoWidget({
    cartao: { card_number: '123', card_balance: 12.5 },
    favorita: { numero: 7, nome: 'Centro - Efapi' },
    horarios: [{ departure_time: '06:00' }, { departure_time: '09:00' }],
  });
  expect(d.saldo).toBe(12.5);
  expect(d.linha).toEqual({ numero: '7', nome: 'Centro - Efapi' });
  expect(d.horarios).toEqual(['06:00', '09:00']);
  expect(dadosDoWidget({ cartao: {}, favorita: null, horarios: [] })).toMatchObject({ saldo: null, linha: null });
});
