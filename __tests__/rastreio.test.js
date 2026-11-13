/**
 * Envio da localização do motorista (services/rastreio):
 * liga o GPS, manda cada posição para /update_location e desliga ao encerrar.
 */
import Geolocation from '@react-native-community/geolocation';
import notifee from '@notifee/react-native';

import { login, logout } from '../src/services/auth';
import { assinar, iniciarRastreio, pararRastreio, tarefaDoServico } from '../src/services/rastreio';

function resposta(status, corpo) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(corpo ?? {})),
  });
}

const motorista = { id: 9, username: 'Carlos', email: 'c@x.com', role: 'motorista' };
const trajeto = {
  linha: { id: 3, numero: '7', nome: 'Centro - Efapi' },
  horario: { id: 21, departure_time: '09:00', bus_id: 703, bus_number: '703' },
  iniciadoEm: '2026-11-03T12:00:00Z',
};
const esperar = () => new Promise(r => setTimeout(r, 0));

beforeEach(async () => {
  global.fetch = jest.fn(() => resposta(200, {}));
  await logout().catch(() => {});
  fetch.mockReset();
  fetch.mockReturnValueOnce(resposta(200, { role: 'motorista', user: motorista }));
  await login('c@x.com', '123456');
  fetch.mockImplementation(() => resposta(200, { success: true }));
  Geolocation.watchPosition.mockClear();
});

afterEach(async () => {
  await pararRastreio();
});

test('cada posição do GPS vai para /update_location com o ônibus do horário', async () => {
  const eventos = [];
  const sair = assinar((estado, evento) => evento && eventos.push(evento.texto));
  await iniciarRastreio(trajeto);
  await esperar();
  expect(Geolocation.watchPosition).toHaveBeenCalled();

  const aoMudar = Geolocation.watchPosition.mock.calls[0][0];
  aoMudar({ coords: { latitude: -27.1, longitude: -52.61, accuracy: 10, speed: 5 }, timestamp: Date.now() });
  await esperar();
  await esperar();

  const envio = fetch.mock.calls.find(([url]) => url.endsWith('/update_location'));
  expect(JSON.parse(envio[1].body)).toMatchObject({ bus_id: 703, bus_number: '703', latitude: -27.1 });
  expect(eventos).toContain('GPS conectado — passageiros já veem o ônibus');
  sair();
});

test('encerrar desliga o GPS e o serviço da notificação', async () => {
  await iniciarRastreio(trajeto);
  await esperar();
  await pararRastreio();
  expect(Geolocation.clearWatch).toHaveBeenCalled();
});

test('a tarefa do serviço sem trajeto salvo desliga o serviço na hora', async () => {
  notifee.stopForegroundService.mockClear();
  await tarefaDoServico();
  expect(notifee.stopForegroundService).toHaveBeenCalled();
});
