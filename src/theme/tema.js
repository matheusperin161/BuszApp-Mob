/**
 * Tema claro / escuro do app (o "modo black").
 *
 *   modo 'sistema' → segue o tema do celular (padrão)
 *   modo 'claro' / 'escuro' → escolha do usuário, guardada no aparelho
 *
 * Como usar num componente:
 *   const useStyles = criarEstilos(({ cores, sombra }) => ({ card: { backgroundColor: cores.superficie } }));
 *   function Meu() {
 *     const styles = useStyles();          // estilos do tema ativo
 *     const { cores } = useTema();         // cores para props (ícone, spinner...)
 *   }
 * Trocar o tema redesenha o app inteiro na hora, sem reiniciar.
 *
 * Acessibilidade (Configurações → Acessibilidade), também guardadas no aparelho:
 *   escalaFonte    1 · 1,15 · 1,3 — o Label e o Input multiplicam o tamanho da letra
 *   altoContraste  textos secundários e bordas mais fortes
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { gradientesDe, paletas, sombraDe, sombraForteDe } from './index';

const CHAVE = '@buszapp:tema';
const CHAVE_ACESSO = '@buszapp:acessibilidade';
const ESCALAS = [1, 1.15, 1.3];
export const MODOS = ['sistema', 'claro', 'escuro'];

function chaveDaPaleta(eEscuro, contraste) {
  return `${eEscuro ? 'escuro' : 'claro'}${contraste ? 'Contraste' : ''}`;
}

function montarTema(eEscuro, modo, setModo, acesso = {}) {
  const { escalaFonte = 1, altoContraste = false, setAcessibilidade = () => {} } = acesso;
  return {
    escuro: eEscuro,
    modo,
    setModo,
    escalaFonte,
    altoContraste,
    setAcessibilidade,
    cores: paletas[chaveDaPaleta(eEscuro, altoContraste)],
    gradientes: gradientesDe(eEscuro),
    sombra: sombraDe(eEscuro),
    sombraForte: sombraForteDe(eEscuro),
  };
}

// um tema "de fábrica" por paleta, usado para criar os StyleSheets
const BASES = {};
for (const eEscuro of [false, true]) {
  for (const altoContraste of [false, true]) {
    BASES[chaveDaPaleta(eEscuro, altoContraste)] = montarTema(eEscuro, 'sistema', () => {}, { altoContraste });
  }
}

const TemaContext = createContext(BASES.claro);

export function TemaProvider({ children }) {
  const doSistema = useColorScheme();
  const [modo, setModoEstado] = useState('sistema');
  const [acesso, setAcesso] = useState({ escalaFonte: 1, altoContraste: false });

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then(salvo => {
        if (MODOS.includes(salvo)) setModoEstado(salvo);
      })
      .catch(() => {});
    AsyncStorage.getItem(CHAVE_ACESSO)
      .then(salvo => {
        const lido = salvo ? JSON.parse(salvo) : null;
        if (lido) {
          setAcesso({
            escalaFonte: ESCALAS.includes(lido.escalaFonte) ? lido.escalaFonte : 1,
            altoContraste: Boolean(lido.altoContraste),
          });
        }
      })
      .catch(() => {});
  }, []);

  const setAcessibilidade = useCallback(parcial => {
    setAcesso(atual => {
      const proximo = { ...atual, ...parcial };
      AsyncStorage.setItem(CHAVE_ACESSO, JSON.stringify(proximo)).catch(() => {});
      return proximo;
    });
  }, []);

  const setModo = useCallback(novo => {
    if (!MODOS.includes(novo)) return;
    setModoEstado(novo);
    AsyncStorage.setItem(CHAVE, novo).catch(() => {});
  }, []);

  const eEscuro = modo === 'escuro' || (modo === 'sistema' && doSistema === 'dark');
  const tema = useMemo(
    () => montarTema(eEscuro, modo, setModo, { ...acesso, setAcessibilidade }),
    [eEscuro, modo, setModo, acesso, setAcessibilidade],
  );

  return <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}

/** aplica a escala de fonte escolhida a um estilo de texto (fontSize e lineHeight) */
export function escalarTexto(estilo, escala) {
  if (escala === 1) return estilo;
  const plano = StyleSheet.flatten(estilo) || {};
  const extra = {};
  if (plano.fontSize) extra.fontSize = Math.round(plano.fontSize * escala);
  if (plano.lineHeight) extra.lineHeight = Math.round(plano.lineHeight * escala);
  return [estilo, extra];
}

/**
 * Cria um hook de estilos que acompanha o tema.
 * O StyleSheet de cada tema é criado uma vez só e reaproveitado.
 */
export function criarEstilos(fabrica) {
  const cache = {};
  return function useStyles() {
    const tema = useTema();
    const chave = chaveDaPaleta(tema.escuro, tema.altoContraste);
    if (!cache[chave]) {
      cache[chave] = StyleSheet.create(fabrica(BASES[chave]));
    }
    return cache[chave];
  };
}
