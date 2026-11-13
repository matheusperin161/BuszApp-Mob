import {
  lerValor,
  validarCodigo,
  validarEmail,
  validarNumeroCartao,
  validarValorRecarga,
} from '../src/utils/validacao';
import { dinheiro, lerDataApi, mascararCartao } from '../src/utils/formato';

test('e-mail', () => {
  expect(validarEmail('')).toBeTruthy();
  expect(validarEmail('joao@')).toBeTruthy();
  expect(validarEmail('joao@buszapp.com.br')).toBeNull();
});

test('código de 6 dígitos', () => {
  expect(validarCodigo('12345')).toBeTruthy();
  expect(validarCodigo('12a456')).toBeTruthy();
  expect(validarCodigo('123456')).toBeNull();
});

test('número do cartão aceita 8 a 16 dígitos', () => {
  expect(validarNumeroCartao('1234567')).toBeTruthy();
  expect(validarNumeroCartao('1234 5678')).toBeNull();
  expect(validarNumeroCartao('12345678901234567')).toBeTruthy();
});

test('valor da recarga', () => {
  expect(lerValor('20,50')).toBe(20.5);
  expect(validarValorRecarga('0,50')).toBeTruthy();
  expect(validarValorRecarga('abc')).toBeTruthy();
  expect(validarValorRecarga('35')).toBeNull();
  expect(validarValorRecarga('9999')).toBeTruthy();
});

test('formatação', () => {
  expect(dinheiro(4.5)).toMatch(/R\$\s?4,50/);
  expect(mascararCartao('1234567812345678')).toBe('•••• •••• •••• 5678');
  // data do backend vem em UTC sem fuso
  expect(lerDataApi('2026-11-03T02:17:11').toISOString()).toBe('2026-11-03T02:17:11.000Z');
});
