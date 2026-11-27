/**
 * Formatação pura para exibição: dinheiro, data e hora em pt-BR.
 * Sem JSX, sem API — igual ao validacao.js.
 */

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** valor inválido vira R$ 0,00 em vez de NaN na tela */
export function dinheiro(valor) {
  return moeda.format(Number(valor) || 0);
}

/**
 * O backend grava em UTC sem fuso ("2026-11-03T02:17:11").
 * Acrescentar o Z faz o JavaScript converter para o horário do aparelho.
 */
export function lerDataApi(texto) {
  if (!texto) return null;
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(texto) ? texto : `${texto}Z`;
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? null : data;
}

function doisDigitos(n) {
  return String(n).padStart(2, '0');
}

/** DD/MM/AAAA no horário do aparelho; '—' se a data vier vazia */
export function dataCurta(texto) {
  const d = lerDataApi(texto);
  if (!d) return '—';
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function dataHora(texto) {
  const d = lerDataApi(texto);
  if (!d) return '—';
  return `${dataCurta(texto)} às ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

export function hora(texto) {
  const d = lerDataApi(texto);
  if (!d) return '—';
  return `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

/** "há 3 min", "há 2 h", "ontem"... para notificações */
export function tempoRelativo(texto) {
  const d = lerDataApi(texto);
  if (!d) return '';
  const minutos = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return dataCurta(texto);
}

/** data de hoje no formato da API (AAAA-MM-DD), no fuso do aparelho */
export function hojeIso() {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

/** mostra só os 4 últimos dígitos do cartão */
export function mascararCartao(numero) {
  const digitos = String(numero ?? '').replace(/\D/g, '');
  if (!digitos) return '•••• •••• •••• ••••';
  const fim = digitos.slice(-4);
  return `•••• •••• •••• ${fim}`;
}

/** abaixo de 1 km mostra em metros; acima, em km com vírgula */
export function distancia(metros) {
  if (metros == null || metros === '') return '—';
  metros = Number(metros);
  if (!Number.isFinite(metros)) return '—';
  return metros >= 1000 ? `${(metros / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(metros)} m`;
}

/** só os dígitos de um texto ("123.456.789-09" → "12345678909") */
export function somenteDigitos(texto) {
  return String(texto ?? '').replace(/\D/g, '');
}

/** máscara de CPF enquanto digita: 000.000.000-00 */
export function mascaraCpf(texto) {
  const d = somenteDigitos(texto).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** máscara de telefone: (49) 99999-9999 */
export function mascaraTelefone(texto) {
  const d = somenteDigitos(texto).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** máscara de data: DD/MM/AAAA */
export function mascaraData(texto) {
  const d = somenteDigitos(texto).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "31/12/2027" → "2027-12-31" (null se a data não existir) */
export function dataBrParaIso(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(texto ?? '').trim());
  if (!m) return null;
  const [, dia, mes, ano] = m;
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (d.getFullYear() !== Number(ano) || d.getMonth() !== Number(mes) - 1 || d.getDate() !== Number(dia)) {
    return null;
  }
  return `${ano}-${mes}-${dia}`;
}

/** "2027-12-31" → "31/12/2027" */
export function dataIsoParaBr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** placa em maiúsculas, sem espaços: "abc1d23" → "ABC1D23" */
export function mascaraPlaca(texto) {
  return String(texto ?? '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
}
