/**
 * SCREEN — ExtratoScreen
 * Todas as movimentações do cartão ("Ver todas" da Home).
 */
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Cabecalho } from '../components/organisms/Cabecalho';
import { TransacaoList } from '../components/organisms/TransacaoList';
import { voltarAoLogin } from '../navigation/acoes';
import { listarTransacoes } from '../services/cartao';
import { cores } from '../theme';

export function ExtratoScreen({ navigation }) {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setTransacoes((await listarTransacoes()) || []);
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
      <Cabecalho titulo="Extrato" subtitulo="Recargas e passagens do cartão" voltar />
      <TransacaoList
        transacoes={transacoes}
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
