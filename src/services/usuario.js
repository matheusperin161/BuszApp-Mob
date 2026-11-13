/**
 * Recurso REST /auth/profile e /auth/profile/picture
 * GET dados | PUT nome/e-mail/senha | POST foto (multipart) | DELETE foto
 */
import { apiRequest } from './api';
import { API_BASE_URL } from './config';

export function obterPerfil() {
  return apiRequest('/auth/profile');
}

/** senha é opcional: vazia mantém a atual */
export function atualizarPerfil({ nome, email, senha }) {
  const body = { username: nome, email };
  if (senha) body.password = senha;
  return apiRequest('/auth/profile', { method: 'PUT', body });
}

export function enviarFoto(uri) {
  const extensao = (uri.split('.').pop() || 'jpg').toLowerCase();
  const tipo = extensao === 'png' ? 'image/png' : 'image/jpeg';
  const form = new FormData();
  form.append('picture', {
    uri,
    name: `avatar.${extensao === 'png' ? 'png' : 'jpg'}`,
    type: tipo,
  });
  return apiRequest('/auth/profile/picture', { method: 'POST', form, timeoutMs: 30000 });
}

export function removerFoto() {
  return apiRequest('/auth/profile/picture', { method: 'DELETE' });
}

/** o backend devolve "/uploads/avatars/x.jpg"; a Image precisa da URL completa */
export function urlDaFoto(caminho) {
  if (!caminho) return null;
  if (caminho.startsWith('http')) return caminho;
  return `${API_BASE_URL}${caminho}?v=${Date.now()}`;
}
