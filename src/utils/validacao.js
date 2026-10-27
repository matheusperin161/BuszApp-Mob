/**
 * Validação pura: recebe texto, devolve string de erro ou null.
 * Sem JSX, sem API. O formulário decide quando chamar (blur / submit).
 */

export const somenteDigitos = (valor = '') => String(valor).replace(/\D/g, '');

export function obrigatorio(valor, rotulo = 'Campo') {
  return String(valor ?? '').trim() ? null : `${rotulo} é obrigatório`;
}

export function email(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor ?? '').trim()) ? null : 'E-mail inválido';
}

/** CPF pelos dois dígitos verificadores (mesma regra do backend). */
export function cpfValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i += 1) soma += Number(d[i]) * (tamanho + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(d[tamanho])) return false;
  }
  return true;
}

export function cpf(valor) {
  return cpfValido(valor) ? null : 'CPF inválido';
}

/** "DD/MM/AAAA" → "AAAA-MM-DD" ou null se a data não existir. */
export function dataBRParaISO(valor) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(valor ?? '').trim());
  if (!m) return null;
  const [, dia, mes, ano] = m.map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function dataBR(valor) {
  return dataBRParaISO(valor) ? null : 'Data inválida (DD/MM/AAAA)';
}

export function senha(valor, { opcional = false } = {}) {
  if (opcional && !valor) return null;
  return String(valor ?? '').length >= 6 ? null : 'A senha deve ter pelo menos 6 caracteres';
}

/** Número do cartão de transporte: só dígitos, de 8 a 16 (CA06.1). */
export function numeroCartao(valor) {
  const d = somenteDigitos(valor);
  return d.length >= 8 && d.length <= 16 ? null : 'O número do cartão deve ter de 8 a 16 dígitos';
}
