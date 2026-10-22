/**
 * HOOK — useAtualizacaoPeriodica
 * Busca dados agora e de novo a cada `intervalo` ms, só com a tela em foco.
 */
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useAtualizacaoPeriodica(buscar, intervalo, dependencias = []) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  const atualizar = useCallback(async () => {
    try {
      setDados(await buscarRef.current());
      setErro(null);
      setAtualizadoEm(new Date());
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setDados(null);
      atualizar();
      const id = setInterval(atualizar, intervalo);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [atualizar, intervalo, ...dependencias]),
  );

  return { dados, erro, atualizadoEm, atualizar };
}
