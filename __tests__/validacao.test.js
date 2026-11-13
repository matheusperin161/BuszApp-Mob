import {
  erroVisivel,
  forcaSenha,
  lerValor,
  primeiroErro,
  validarCodigo,
  validarConfirmacaoSenha,
  validarNome,
  validarSenha,
  validarTexto,
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

test('valor com ponto de milhar', () => {
  expect(lerValor('1.234,56')).toBe(1234.56);
  expect(lerValor('20.50')).toBe(20.5);
  expect(lerValor(' 35 ')).toBe(35);
});

test('nome, senha e confirmação', () => {
  expect(validarNome(' ')).toBeTruthy();
  expect(validarNome('A')).toBeTruthy();
  expect(validarNome('  Ana  ')).toBeNull();
  expect(validarNome('x'.repeat(81))).toBeTruthy();

  expect(validarSenha('')).toBeTruthy();
  expect(validarSenha('123')).toBeNull();
  expect(validarSenha('123', { minima: true })).toBeTruthy();
  expect(validarSenha('123456', { minima: true })).toBeNull();

  expect(validarConfirmacaoSenha('abc123', '')).toBeTruthy();
  expect(validarConfirmacaoSenha('abc123', 'abc124')).toBeTruthy();
  expect(validarConfirmacaoSenha('abc123', 'abc123')).toBeNull();
});

test('texto livre', () => {
  expect(validarTexto('', { rotulo: 'comentário' })).toBe('Escreva o comentário.');
  expect(validarTexto('x'.repeat(501), { rotulo: 'comentário' })).toMatch(/^Comentário pode ter/);
  expect(validarTexto('Ônibus pontual')).toBeNull();
});

test('força da senha vai de 0 a 4', () => {
  expect(forcaSenha('')).toBe(0);
  expect(forcaSenha('abc')).toBe(0);
  expect(forcaSenha('abcdef')).toBe(1);
  expect(forcaSenha('abcdef12')).toBe(2);
  expect(forcaSenha('abcdefgh12')).toBe(3);
  expect(forcaSenha('Abcdefgh12')).toBe(4);
});

test('primeiro erro e erro visível só após tocar o campo', () => {
  expect(primeiroErro({ nome: null, email: 'E-mail inválido.', senha: 'Informe a senha.' })).toBe(
    'E-mail inválido.',
  );
  expect(primeiroErro({ nome: null, email: null })).toBeNull();

  const erros = { email: 'E-mail inválido.' };
  expect(erroVisivel({}, erros, 'email')).toBeNull();
  expect(erroVisivel({ email: true }, erros, 'email')).toBe('E-mail inválido.');
});
