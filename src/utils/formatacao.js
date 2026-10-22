/**
 * Formatação pura para exibição (moeda, data/hora, distância).
 */
import { somenteDigitos } from './validacao';

/** Máscara progressiva de CPF enquanto o usuário digita. */
export function mascaraCpf(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length > 9) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  if (d.length > 3) return d.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return d;
}

/** Máscara progressiva de data DD/MM/AAAA. */
export function mascaraData(valor) {
  const d = somenteDigitos(valor).slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

/** "AAAA-MM-DD" → "DD/MM/AAAA". */
export function isoParaDataBR(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Datas do backend vêm em UTC sem fuso ("2026-10-21T22:10:00").
 * Converte para Date local.
 */
export function utcParaDate(iso) {
  if (!iso) return null;
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
}

export function hora(iso) {
  const data = utcParaDate(iso);
  if (!data) return '—';
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

export function minutos(valor) {
  if (valor == null) return '—';
  if (valor < 1) return 'menos de 1 min';
  return `${Math.round(valor)} min`;
}

export function distancia(metros) {
  if (metros == null) return '—';
  return metros >= 1000 ? `${(metros / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(metros)} m`;
}
