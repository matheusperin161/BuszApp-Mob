/**
 * SERVICE — cartao
 * Cartão de transporte (RF11, RF12): src/routes/card.py (/api)
 *
 * Ainda não há banco ligado ao app (o MongoDB virá depois). Até lá, os cartões ficam
 * num repositório local que faz o papel do servidor: mesma interface, mesmas regras e
 * os mesmos erros (ApiError com status) que a API vai devolver. Na migração só este
 * arquivo muda — cada função vira um api.get/post e as telas continuam iguais.
 *
 * Como no servidor, o dono vem da sessão gravada, nunca de parâmetro da tela (CA06.3).
 * Saldo em centavos inteiros: sem erro de ponto flutuante.
 *
 * Entidade: { id, usuario_id, numero, saldo, status, criado_em, atualizado_em }
 */
import { ApiError } from './api';
import { lerJSON, lerSessao, salvarJSON } from './storage';
import { numeroCartao, somenteDigitos } from '../utils/validacao';

const CHAVE_BANCO = 'buszapp_cartoes';
const LIMITE_POR_USUARIO = 5;
const RECARGA_MAXIMA_CENTAVOS = 500_00;

// Serializa leitura+gravação: dois cadastros simultâneos não podem furar a unicidade
let corrente = Promise.resolve();
function emSerie(operacao) {
  const resultado = corrente.then(operacao);
  corrente = resultado.catch(() => {});
  return resultado;
}

const lerBanco = () => lerJSON(CHAVE_BANCO, []);
const agora = () => new Date().toISOString().slice(0, 19); // UTC sem fuso, como o backend
const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Equivale ao login_required do Flask: sem sessão válida, 401. */
async function usuarioLogado() {
  const sessao = await lerSessao();
  const id = sessao?.user?.id;
  if (id === undefined || id === null) throw new ApiError('Sessão expirada. Entre novamente.', { status: 401 });
  return { id: String(id), role: sessao.role };
}

/** Busca o cartão garantindo que é do usuário logado (404 inexistente, 403 de outro dono). */
function cartaoDoDono(banco, id, usuario) {
  const cartao = banco.find((c) => c.id === id);
  if (!cartao) throw new ApiError('Cartão não encontrado.', { status: 404 });
  if (cartao.usuario_id !== usuario.id) throw new ApiError('Você não tem acesso a este cartão.', { status: 403 });
  return cartao;
}

/** RF12 — cartões do passageiro logado, mais recentes primeiro (CA06.3). */
export function meusCartoes() {
  return emSerie(async () => {
    const usuario = await usuarioLogado();
    const banco = await lerBanco();
    return banco.filter((c) => c.usuario_id === usuario.id).reverse();
  });
}

export function obterCartao(id) {
  return emSerie(async () => cartaoDoDono(await lerBanco(), id, await usuarioLogado()));
}

/** RF11 — número único no sistema; nasce com saldo zero e ativo (CA06.1, CA06.2). */
export function cadastrarCartao(numero) {
  return emSerie(async () => {
    const usuario = await usuarioLogado();
    if (usuario.role !== 'user') throw new ApiError('Só passageiros cadastram cartão.', { status: 403 });
    const erro = numeroCartao(numero);
    if (erro) throw new ApiError(erro, { status: 422 });

    const digitos = somenteDigitos(numero);
    const banco = await lerBanco();
    if (banco.some((c) => c.numero === digitos)) {
      throw new ApiError('Este número de cartão já está cadastrado.', { status: 409 });
    }
    if (banco.filter((c) => c.usuario_id === usuario.id).length >= LIMITE_POR_USUARIO) {
      throw new ApiError(`Limite de ${LIMITE_POR_USUARIO} cartões por passageiro.`, { status: 422 });
    }

    const data = agora();
    const cartao = {
      id: novoId(),
      usuario_id: usuario.id,
      numero: digitos,
      saldo: 0,
      status: 'ativo',
      criado_em: data,
      atualizado_em: data,
    };
    await salvarJSON(CHAVE_BANCO, [...banco, cartao]);
    return cartao;
  });
}

/** CA06.6 — perda/roubo: só o dono bloqueia, e não há desbloqueio pelo app. */
export function bloquearCartao(id) {
  return emSerie(async () => {
    const usuario = await usuarioLogado();
    const banco = await lerBanco();
    const cartao = cartaoDoDono(banco, id, usuario);
    if (cartao.status !== 'ativo') throw new ApiError(`O cartão já está ${cartao.status}.`, { status: 409 });
    cartao.status = 'bloqueado';
    cartao.atualizado_em = agora();
    await salvarJSON(CHAVE_BANCO, banco);
    return cartao;
  });
}

/** CA06.7 — admin vê os cartões de todos, somente leitura (não existe função de edição para ele). */
export function listarTodosCartoes({ status } = {}) {
  return emSerie(async () => {
    const usuario = await usuarioLogado();
    if (usuario.role !== 'admin') throw new ApiError('Acesso restrito ao administrador.', { status: 403 });
    const banco = await lerBanco();
    return (status ? banco.filter((c) => c.status === status) : banco).reverse();
  });
}

/**
 * Único ponto que altera o saldo (CA06.5) — usado pela recarga e pelo débito de tarifa (CRUD 07).
 * Cartão bloqueado/cancelado recusa os dois (CA06.6).
 */
function movimentar(id, centavos, { debito }) {
  return emSerie(async () => {
    if (!Number.isInteger(centavos) || centavos <= 0) throw new ApiError('Valor inválido.', { status: 422 });
    const usuario = await usuarioLogado();
    const banco = await lerBanco();
    const cartao = cartaoDoDono(banco, id, usuario);
    if (cartao.status !== 'ativo') {
      throw new ApiError(`Cartão ${cartao.status}: recarga e débito estão bloqueados.`, { status: 409 });
    }
    if (!debito && centavos > RECARGA_MAXIMA_CENTAVOS) {
      throw new ApiError('Valor acima do limite de recarga.', { status: 422 });
    }
    if (debito && cartao.saldo < centavos) throw new ApiError('Saldo insuficiente.', { status: 422 });
    cartao.saldo += debito ? -centavos : centavos;
    cartao.atualizado_em = agora();
    await salvarJSON(CHAVE_BANCO, banco);
    return cartao;
  });
}

export const recarregar = (id, centavos) => movimentar(id, centavos, { debito: false });
export const debitarTarifa = (id, centavos) => movimentar(id, centavos, { debito: true });
