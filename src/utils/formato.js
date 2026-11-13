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

export function mascararCartao(numero) {
  const digitos = String(numero ?? '').replace(/\D/g, '');
  if (!digitos) return '•••• •••• •••• ••••';
  const fim = digitos.slice(-4);
  return `•••• •••• •••• ${fim}`;
}

export function distancia(metros) {
  if (metros == null) return '—';
  return metros >= 1000 ? `${(metros / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(metros)} m`;
}
