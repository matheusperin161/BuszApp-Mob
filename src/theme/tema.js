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
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { gradientesDe, paletas, sombraDe, sombraForteDe } from './index';

const CHAVE = '@buszapp:tema';
export const MODOS = ['sistema', 'claro', 'escuro'];

function montarTema(eEscuro, modo, setModo) {
  return {
    escuro: eEscuro,
    modo,
    setModo,
    cores: eEscuro ? paletas.escuro : paletas.claro,
    gradientes: gradientesDe(eEscuro),
    sombra: sombraDe(eEscuro),
    sombraForte: sombraForteDe(eEscuro),
  };
}

const TEMA_CLARO = montarTema(false, 'sistema', () => {});
const TEMA_ESCURO = montarTema(true, 'sistema', () => {});

const TemaContext = createContext(TEMA_CLARO);

export function TemaProvider({ children }) {
  const doSistema = useColorScheme();
  const [modo, setModoEstado] = useState('sistema');

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then(salvo => {
        if (MODOS.includes(salvo)) setModoEstado(salvo);
      })
      .catch(() => {});
  }, []);

  const setModo = useCallback(novo => {
    if (!MODOS.includes(novo)) return;
    setModoEstado(novo);
    AsyncStorage.setItem(CHAVE, novo).catch(() => {});
  }, []);

  const eEscuro = modo === 'escuro' || (modo === 'sistema' && doSistema === 'dark');
  const tema = useMemo(() => montarTema(eEscuro, modo, setModo), [eEscuro, modo, setModo]);

  return <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}

/**
 * Cria um hook de estilos que acompanha o tema.
 * O StyleSheet de cada tema é criado uma vez só e reaproveitado.
 */
export function criarEstilos(fabrica) {
  const cache = {};
  return function useStyles() {
    const tema = useTema();
    const chave = tema.escuro ? 'escuro' : 'claro';
    if (!cache[chave]) {
      cache[chave] = StyleSheet.create(fabrica(tema.escuro ? TEMA_ESCURO : TEMA_CLARO));
    }
    return cache[chave];
  };
}
