/**
 * HOOK — useEnvioPosicoes
 * Durante a viagem, registra a posição do aparelho a cada INTERVALO_ENVIO_POSICAO_MS
 * (RNF08) e envia ao servidor — só com o app aberto (CA08.3).
 * Toda posição passa pela fila persistente: sem rede, fica no aparelho e
 * vai em lote quando a conexão volta (CA08.7).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

import { INTERVALO_ENVIO_POSICAO_MS } from '../services/config';
import { criarFilaPosicoes } from '../services/filaPosicoes';
import { enviarPosicoes, finalizarViagem } from '../services/motorista';
import * as storage from '../services/storage';

export function useEnvioPosicoes(viagemId, { aoEncerrarNoServidor } = {}) {
  const [appAtivo, setAppAtivo] = useState(AppState.currentState === 'active');
  const [pausado, setPausado] = useState(false);
  const [online, setOnline] = useState(true);
  const [pendentes, setPendentes] = useState(0);
  const [ultimoEnvio, setUltimoEnvio] = useState(null);
  const [erroGps, setErroGps] = useState(null);

  const ultimaLeitura = useRef(null);
  const aoEncerrarRef = useRef(aoEncerrarNoServidor);
  aoEncerrarRef.current = aoEncerrarNoServidor;

  const fila = useMemo(
    () => (viagemId ? criarFilaPosicoes({ viagemId, armazenamento: storage, enviar: enviarPosicoes }) : null),
    [viagemId],
  );

  const enviando = useRef(null);

  // Um envio por vez: com a rede pendurada, os ticks não empilham requisições
  const descarregar = useCallback(() => {
    if (!fila) return Promise.resolve(null);
    if (enviando.current) return enviando.current;
    enviando.current = (async () => {
      try {
        const resultado = await fila.enviarPendentes();
        setPendentes(resultado.pendentes);
        // "Conectado" = o servidor respondeu; rede local sem internet também vale
        if (resultado.semConexao) setOnline(false);
        else if (!resultado.erro) setOnline(true);
        if (resultado.enviadas) setUltimoEnvio(new Date());
        if (resultado.encerrada) aoEncerrarRef.current?.();
        return resultado;
      } finally {
        enviando.current = null;
      }
    })();
    return enviando.current;
  }, [fila]);

  useEffect(() => {
    setPausado(false);
    ultimaLeitura.current = null;
  }, [viagemId]);

  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => setAppAtivo(estado === 'active'));
    return () => assinatura.remove();
  }, []);

  // Rede voltou → envia o que ficou guardado
  useEffect(() => {
    if (!fila) return undefined;
    fila.pendentes().then(setPendentes);
    // Só isConnected: isInternetReachable testa a internet, não o nosso servidor
    return NetInfo.addEventListener((estado) => {
      if (estado.isConnected === false) setOnline(false);
      else descarregar();
    });
  }, [fila, descarregar]);

  // GPS + envio periódico, só com a viagem ativa e o app em primeiro plano
  const transmitindo = Boolean(fila) && appAtivo && !pausado;
  useEffect(() => {
    if (!transmitindo) return undefined;
    let cancelado = false;
    let observador = null;

    const registrar = async () => {
      const leitura = ultimaLeitura.current;
      if (!leitura) return;
      const { latitude, longitude, speed } = leitura.coords;
      await fila.adicionar({
        latitude,
        longitude,
        velocidade: speed != null && speed >= 0 ? speed * 3.6 : null,
        registrado_em: new Date().toISOString(),
      });
      setPendentes((n) => n + 1);
      await descarregar();
    };

    (async () => {
      try {
        observador = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: INTERVALO_ENVIO_POSICAO_MS / 2, distanceInterval: 0 },
          (leitura) => {
            ultimaLeitura.current = leitura;
          },
        );
        if (cancelado) observador.remove();
        else setErroGps(null);
      } catch (erro) {
        if (!cancelado) setErroGps(erro);
      }
    })();

    const intervalo = setInterval(registrar, INTERVALO_ENVIO_POSICAO_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
      observador?.remove();
    };
  }, [transmitindo, fila, descarregar]);

  /**
   * CA08.8 — para o envio, manda as pendentes e finaliza no servidor.
   * Se ainda houver posições sem enviar (sem rede), não finaliza e retoma o envio.
   */
  const finalizar = useCallback(async () => {
    setPausado(true);
    try {
      await descarregar(); // espera um envio que já estivesse em andamento
      const resultado = await descarregar();
      if (resultado && resultado.pendentes > 0) {
        throw new Error(
          `Sem conexão: ${resultado.pendentes} posição(ões) ainda não foram enviadas. ` +
            'Tente finalizar quando a internet voltar.',
        );
      }
      await finalizarViagem(viagemId);
      await fila?.descartar();
    } catch (erro) {
      setPausado(false);
      throw erro;
    }
  }, [descarregar, fila, viagemId]);

  return { transmitindo, online, pendentes, ultimoEnvio, erroGps, finalizar };
}
