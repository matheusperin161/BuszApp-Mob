/**
 * Validação pura: recebe texto, devolve string de erro ou null.
 * Sem JSX, sem API. O formulário decide quando chamar (blur / submit).
 *
 * Ver formularios_entrada_validacao.md
 */

export const LIMITES = {
  nomeMin: 2,
  nomeMax: 80,
  senhaMin: 6,
  textoMin: 1,
  textoMax: 500,
  codigoDigitos: 6,
  cartaoMin: 8,
  cartaoMax: 16,
  recargaMin: 1,
  recargaMax: 500,
};

/**
 * um @ e texto dos dois lados; TLD (.com) opcional para aceitar
 * admin@localhost do seed. Didático, não é RFC 5322.
 */
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+(\.[^\s@]+)?$/;

export function validarNome(valor) {
  const nome = String(valor ?? '').trim();
  if (!nome) return 'Informe o nome.';
  if (nome.length < LIMITES.nomeMin) {
    return `Nome precisa ter pelo menos ${LIMITES.nomeMin} caracteres.`;
  }
  if (nome.length > LIMITES.nomeMax) {
    return `Nome pode ter no máximo ${LIMITES.nomeMax} caracteres.`;
  }
  return null;
}

export function validarEmail(valor) {
  const email = String(valor ?? '').trim();
  if (!email) return 'Informe o e-mail.';
  if (!REGEX_EMAIL.test(email)) {
    return 'E-mail inválido. Use o formato nome@dominio.com.';
  }
  return null;
}

export function validarSenha(valor, { minima = false } = {}) {
  if (!valor) return 'Informe a senha.';
  if (minima && valor.length < LIMITES.senhaMin) {
    return `Senha precisa ter pelo menos ${LIMITES.senhaMin} caracteres.`;
  }
  return null;
}

export function validarConfirmacaoSenha(senha, confirmacao) {
  if (!confirmacao) return 'Repita a senha.';
  if (senha !== confirmacao) return 'As senhas não coincidem.';
  return null;
}

export function validarTexto(valor, { rotulo = 'texto' } = {}) {
  const texto = String(valor ?? '').trim();
  if (!texto) return `Escreva o ${rotulo}.`;
  if (texto.length < LIMITES.textoMin) {
    return `${rotulo} precisa ter pelo menos ${LIMITES.textoMin} caractere.`;
  }
  if (texto.length > LIMITES.textoMax) {
    return `${rotulo} pode ter no máximo ${LIMITES.textoMax} caracteres.`;
  }
  return null;
}

export function validarCodigo(valor) {
  const codigo = String(valor ?? '').trim();
  if (!codigo) return 'Informe o código recebido por e-mail.';
  if (!new RegExp(`^\\d{${LIMITES.codigoDigitos}}$`).test(codigo)) {
    return `O código tem ${LIMITES.codigoDigitos} números.`;
  }
  return null;
}

export function validarNumeroCartao(valor) {
  const digitos = String(valor ?? '').replace(/\D/g, '');
  if (!digitos) return 'Informe o número do cartão.';
  if (digitos.length < LIMITES.cartaoMin || digitos.length > LIMITES.cartaoMax) {
    return `O número tem entre ${LIMITES.cartaoMin} e ${LIMITES.cartaoMax} dígitos.`;
  }
  return null;
}

/** aceita "20", "20,50" ou "20.50" */
export function lerValor(valor) {
  const numero = Number(String(valor ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : NaN;
}

export function validarValorRecarga(valor) {
  if (valor === '' || valor == null) return 'Escolha ou digite um valor.';
  const numero = lerValor(valor);
  if (Number.isNaN(numero)) return 'Valor inválido.';
  if (numero < LIMITES.recargaMin) return `O mínimo é R$ ${LIMITES.recargaMin},00.`;
  if (numero > LIMITES.recargaMax) return `O máximo por recarga é R$ ${LIMITES.recargaMax},00.`;
  return null;
}

/** primeiro erro do mapa { campo: mensagem|null } — ou null se todos ok */
export function primeiroErro(mapa) {
  return Object.values(mapa).find(Boolean) ?? null;
}

/** só mostra o erro depois que o usuário saiu do campo ou tentou enviar */
export function erroVisivel(tocados, erros, campo) {
  return tocados[campo] ? erros[campo] : null;
}

/**
 * Força da senha de 0 a 4 (as quatro barrinhas do cadastro do site):
 * tamanho ≥ 6, tamanho ≥ 10, letras e números, maiúscula/minúscula ou símbolo.
 */
export function forcaSenha(senha) {
  const s = String(senha ?? '');
  if (!s) return 0;
  let pontos = 0;
  if (s.length >= LIMITES.senhaMin) pontos += 1;
  if (s.length >= 10) pontos += 1;
  if (/\d/.test(s) && /[a-zA-Z]/.test(s)) pontos += 1;
  if ((/[a-z]/.test(s) && /[A-Z]/.test(s)) || /[^a-zA-Z0-9]/.test(s)) pontos += 1;
  return pontos;
}
