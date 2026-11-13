/**
 * ORGANISM — NotificacaoList
 * Avisos do sistema, do mais novo para o mais antigo.
 */
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { extrairChave, listaVirtualizada } from '../../constants/lista';
import { useEspacoInferior } from '../../navigation/espacoInferior';
import { cores, espacamentos } from '../../theme';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { EstadoCarga } from '../molecules/EstadoCarga';
import { NotificacaoItem } from '../molecules/NotificacaoItem';

export function NotificacaoList({
  notificacoes,
  ultimoVisto = Infinity,
  carregando,
  erro,
  onTentarDeNovo,
  onRefresh,
  refreshing,
}) {
  const espacoInferior = useEspacoInferior();
  const renderItem = useCallback(
    ({ item }) => <NotificacaoItem notificacao={item} novo={!item.read && Number(item.id) > ultimoVisto} />,
    [ultimoVisto],
  );

  const semDados = !notificacoes || notificacoes.length === 0;
  if ((carregando && semDados) || (erro && semDados)) {
    return (
      <EstadoCarga carregando={carregando && !erro} erro={erro} onTentarDeNovo={onTentarDeNovo} />
    );
  }

  return (
    <FlatList
      data={notificacoes}
      keyExtractor={extrairChave}
      renderItem={renderItem}
      ListEmptyComponent={
        <View style={styles.vazio}>
          <Icone nome="bell-off" cor={cores.textoFraco} tamanho={44} style={styles.emoji} />
          <Label variante="legenda" style={styles.centro}>
            Nenhum aviso por enquanto. Recargas, saldo baixo e ocorrências nas linhas aparecem aqui.
          </Label>
        </View>
      }
      contentContainerStyle={[styles.lista, { paddingBottom: styles.lista.paddingBottom + espacoInferior }]}
      refreshing={refreshing}
      onRefresh={onRefresh}
      {...listaVirtualizada}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: espacamentos.md, paddingTop: espacamentos.lg, paddingBottom: espacamentos.xl, flexGrow: 1 },
  vazio: { alignItems: 'center', marginTop: espacamentos.xl, paddingHorizontal: espacamentos.lg },
  emoji: { marginBottom: espacamentos.md },
  centro: { textAlign: 'center' },
});
