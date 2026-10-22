/**
 * Sessão do usuário logado (role decide quais navegadores existem — CA02.1).
 *
 * Ao abrir o app, restaura a sessão salva e confere com o servidor.
 * Sem conexão, mantém a sessão salva: o motorista precisa continuar a viagem offline.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authService from '../services/auth';
import { lerSessao, limparSessao, salvarSessao } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null); // { role, user, driver? }
  const [restaurando, setRestaurando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const salva = await lerSessao();
        if (!salva) return;
        try {
          await authService.perfil();
          setSessao(salva);
        } catch (erro) {
          if (erro.semConexao) setSessao(salva);
          else await limparSessao();
        }
      } finally {
        setRestaurando(false);
      }
    })();
  }, []);

  const entrar = useCallback(async (email, senha) => {
    const { role, user, driver } = await authService.login(email, senha);
    const nova = { role, user, driver: driver ?? null };
    await salvarSessao(nova);
    setSessao(nova);
  }, []);

  const sair = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // sem rede: limpa localmente mesmo assim
    }
    await limparSessao();
    setSessao(null);
  }, []);

  const valor = useMemo(() => ({ sessao, restaurando, entrar, sair }), [sessao, restaurando, entrar, sair]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return contexto;
}
