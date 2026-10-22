/**
 * SERVICE — auth
 * Autenticação: src/routes/auth.py (/api/auth)
 */
import { api } from './api';

/** Retorna { role, user, driver? }. role: 'user' | 'admin' | 'motorista'. */
export function login(email, senha) {
  return api.post('/api/auth/login', { email: email.trim().toLowerCase(), password: senha, remember: true });
}

export function logout() {
  return api.post('/api/auth/logout');
}

/** Valida se o cookie de sessão ainda vale (401 se expirou). */
export function perfil() {
  return api.get('/api/auth/profile');
}
