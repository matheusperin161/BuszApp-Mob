/**
 * Cadastros do admin no app: máscaras, validações e chamadas ao backend.
 */
import { opcoesDeLinha, salvarMotorista, salvarParada, trocarOrdem } from '../src/services/admin';
import { apiRequest } from '../src/services/api';
import {
  dataBrParaIso,
  dataIsoParaBr,
  mascaraCpf,
  mascaraData,
  mascaraPlaca,
  mascaraTelefone,
} from '../src/utils/formato';
import { cpfValido, obrigatorio, validarInteiro } from '../src/utils/validacao';

jest.mock('../src/services/api', () => ({ apiRequest: jest.fn() }));

beforeEach(() => apiRequest.mockReset());

test('máscaras de CPF, telefone, data e placa', () => {
  expect(mascaraCpf('52998224725')).toBe('529.982.247-25');
  expect(mascaraCpf('5299')).toBe('529.9');
  expect(mascaraTelefone('49999998888')).toBe('(49) 99999-8888');
  expect(mascaraTelefone('4933221100')).toBe('(49) 3322-1100');
  expect(mascaraData('31122027')).toBe('31/12/2027');
  expect(mascaraPlaca('abc 1d23')).toBe('ABC1D23');
});

test('data BR ↔ ISO, recusando datas que não existem', () => {
  expect(dataBrParaIso('31/12/2027')).toBe('2027-12-31');
  expect(dataBrParaIso('31/02/2027')).toBeNull();
  expect(dataBrParaIso('12/2027')).toBeNull();
  expect(dataIsoParaBr('2027-12-31')).toBe('31/12/2027');
  expect(dataIsoParaBr(null)).toBe('');
});

test('CPF com dígito verificador e validações simples', () => {
  expect(cpfValido('529.982.247-25')).toBe(true);
  expect(cpfValido('529.982.247-24')).toBe(false);
  expect(cpfValido('111.111.111-11')).toBe(false);
  expect(obrigatorio('  ', 'o nome')).toBe('Informe o nome.');
  expect(obrigatorio('Ana', 'o nome')).toBeNull();
  expect(validarInteiro('44', { rotulo: 'a capacidade', min: 1, max: 300 })).toBeNull();
  expect(validarInteiro('4,5', { rotulo: 'a capacidade', min: 1, max: 300 })).toMatch(/inteiro/);
  expect(validarInteiro('0', { rotulo: 'a capacidade', min: 1, max: 300 })).toMatch(/entre 1 e 300/);
});

test('motorista novo é POST e edição é PUT', async () => {
  apiRequest.mockResolvedValue({ driver: { id: 5 } });
  expect(await salvarMotorista(null, { nome: 'Ana' })).toEqual({ id: 5 });
  expect(apiRequest).toHaveBeenLastCalledWith('/admin/drivers', { method: 'POST', body: { nome: 'Ana' } });
  await salvarMotorista(5, { nome: 'Ana' });
  expect(apiRequest).toHaveBeenLastCalledWith('/admin/drivers/5', { method: 'PUT', body: { nome: 'Ana' } });
});

test('trocar a ordem de duas paradas', async () => {
  apiRequest.mockResolvedValue({ stop: {} });
  await trocarOrdem(3, { id: 10, order: 1 }, { id: 11, order: 2 });
  expect(apiRequest).toHaveBeenNthCalledWith(1, '/admin/routes/3/stops/10', { method: 'PUT', body: { order: 2 } });
  expect(apiRequest).toHaveBeenNthCalledWith(2, '/admin/routes/3/stops/11', { method: 'PUT', body: { order: 1 } });
  await salvarParada(3, null, { name: 'X' });
  expect(apiRequest).toHaveBeenLastCalledWith('/admin/routes/3/stops', { method: 'POST', body: { name: 'X' } });
});

test('linhas no formato "7 - Centro - Efapi"', async () => {
  apiRequest.mockResolvedValue([{ route_number: '7', route_name: 'Centro - Efapi', origin: 'Centro', destination: 'Efapi' }]);
  const [linha] = await opcoesDeLinha();
  expect(linha.id).toBe('7 - Centro - Efapi');
  expect(linha.detalhe).toBe('Centro → Efapi');
});
