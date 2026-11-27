/**
 * Favoritas, horários sem internet e cálculo do aviso de chegada.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { maisProximo, minutosAteParada } from '../src/services/avisoChegada';
import { alternarFavorita, ordenarComFavoritas } from '../src/services/favoritas';
import { comCache, semConexao } from '../src/services/offline';
import { ApiError } from '../src/services/api';

beforeEach(() => AsyncStorage.clear());

// três paradas em linha reta, ~1,1 km entre elas (0,01° de latitude)
const paradas = [
  { name: 'A', latitude: -27.1, longitude: -52.6, order: 1 },
  { name: 'B', latitude: -27.09, longitude: -52.6, order: 2 },
  { name: 'C', latitude: -27.08, longitude: -52.6, order: 3 },
];

test('minutos até a parada somam os trechos na ordem', () => {
  const onibus = { latitude: -27.1, longitude: -52.6, velocidade: 0 };
  // 2,2 km a 22 km/h ≈ 6 min
  expect(minutosAteParada(onibus, paradas, 'C')).toBeCloseTo(6.07, 1);
  expect(minutosAteParada({ ...onibus, velocidade: 44 }, paradas, 'C')).toBeCloseTo(3.03, 1);
});

test('ônibus que já passou da parada não conta', () => {
  const depoisDeB = { latitude: -27.081, longitude: -52.6, proximaParada: 'C' };
  expect(minutosAteParada(depoisDeB, paradas, 'B')).toBeNull();
  expect(minutosAteParada(depoisDeB, paradas, 'nao-existe')).toBeNull();
});

test('escolhe o ônibus que chega primeiro', () => {
  const longe = { id: 1, latitude: -27.1, longitude: -52.6 };
  const perto = { id: 2, latitude: -27.091, longitude: -52.6 };
  expect(maisProximo([longe, perto], paradas, 'C').onibus.id).toBe(2);
  expect(maisProximo([], paradas, 'C')).toBeNull();
});

test('favoritas: marca, desmarca e vão para o topo', async () => {
  let favs = await alternarFavorita({ numero: 7, nome: 'Centro - Efapi' });
  expect(favs).toEqual([{ numero: '7', nome: 'Centro - Efapi' }]);
  const linhas = [{ numero: '4' }, { numero: '7' }, { numero: '9' }];
  expect(ordenarComFavoritas(linhas, favs).map(l => l.numero)).toEqual(['7', '4', '9']);
  favs = await alternarFavorita({ numero: '7' });
  expect(favs).toEqual([]);
});

test('sem internet devolve a última cópia salva', async () => {
  const online = await comCache('horarios:7', async () => [{ id: 1, departure_time: '06:00' }]);
  expect(online.offline).toBe(false);
  const semRede = await comCache('horarios:7', async () => {
    throw new ApiError('Sem conexão', 0, 'rede');
  });
  expect(semRede.offline).toBe(true);
  expect(semRede.dados).toEqual([{ id: 1, departure_time: '06:00' }]);
  expect(semRede.salvoEm).toBe(online.salvoEm);
});

test('erro que não é de rede não usa a cópia', async () => {
  await comCache('linhas', async () => ['x']);
  await expect(
    comCache('linhas', async () => {
      throw new ApiError('Sessão expirada', 401, 'sessao');
    }),
  ).rejects.toThrow('Sessão expirada');
  expect(semConexao({ causa: 'timeout' })).toBe(true);
  expect(semConexao({ status: 404 })).toBe(false);
});
