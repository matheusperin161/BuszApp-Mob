import { dataCurta, distancia, hojeIso, hora, mascararCartao, tempoRelativo } from '../src/utils/formato';

test('distância em metros ou km', () => {
  expect(distancia(null)).toBe('—');
  expect(distancia('abc')).toBe('—');
  expect(distancia(350.6)).toBe('351 m');
  expect(distancia(1500)).toBe('1,5 km');
  expect(distancia('2300')).toBe('2,3 km');
});

test('datas vazias ou inválidas viram traço', () => {
  expect(dataCurta('')).toBe('—');
  expect(dataCurta('não é data')).toBe('—');
  expect(hora(null)).toBe('—');
  expect(dataCurta('2026-11-03T12:00:00')).toMatch(/^\d{2}\/11\/2026$/);
});

test('tempo relativo', () => {
  const agora = Date.now();
  const iso = ms => new Date(agora - ms).toISOString();
  expect(tempoRelativo(iso(10 * 1000))).toBe('agora');
  expect(tempoRelativo(iso(5 * 60000))).toBe('há 5 min');
  expect(tempoRelativo(iso(3 * 3600000))).toBe('há 3 h');
  expect(tempoRelativo(iso(24 * 3600000))).toBe('ontem');
});

test('cartão sem número e data de hoje', () => {
  expect(mascararCartao('')).toBe('•••• •••• •••• ••••');
  expect(hojeIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
