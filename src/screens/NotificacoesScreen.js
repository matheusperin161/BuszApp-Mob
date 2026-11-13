/**
 * SCREEN — NotificacoesScreen (o sino do cabeçalho)
 * Avisos do BusZapp (recargas, saldo baixo, ocorrências nas linhas).
 * Ao abrir, os avisos contam como vistos e a bolinha do sino apaga.
 */
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Cabecalho } from '../components/organisms/Cabecalho';
import { NotificacaoList } from '../components/organisms/NotificacaoList';
import { voltarAoLogin } from '../navigation/acoes';
import { listarNotificacoes, marcarTodasComoVistas, ultimoIdVisto } from '../services/notificacoes';
import { cores } from '../theme';

export function NotificacoesScreen({ navigation }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [ultimoVisto, setUltimoVisto] = useState(Infinity);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [lista, corte] = await Promise.all([listarNotificacoes(), ultimoIdVisto()]);
      setNotificacoes(lista);
      setUltimoVisto(corte);
      await marcarTodasComoVistas(lista);
    } catch (e) {
      if (e.status === 401) {
        voltarAoLogin(navigation);
        return;
      }
      setErro(e.message);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return (
    <View style={styles.flex}>
      <Cabecalho titulo="Notificações" subtitulo="Avisos do BusZapp" voltar semAcoes />
      <NotificacaoList
        notificacoes={notificacoes}
        ultimoVisto={ultimoVisto}
        carregando={carregando}
        erro={erro}
        onTentarDeNovo={() => {
          setCarregando(true);
          carregar();
        }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          carregar();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cores.fundo },
});
