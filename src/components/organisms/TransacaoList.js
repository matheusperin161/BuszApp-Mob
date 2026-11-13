/**
 * ORGANISM — TransacaoList
 * Extrato do cartão. O cabeçalho (saldo, botões) vem pela prop
 * ListHeaderComponent — a tela inteira rola como uma lista só.
 */
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { extrairChave, listaVirtualizada } from '../../constants/lista';
import { useEspacoInferior } from '../../navigation/espacoInferior';
import { cores, espacamentos, raios } from '../../theme';
import { Label } from '../atoms/Label';
import { EstadoCarga } from '../molecules/EstadoCarga';
import { TransacaoItem } from '../molecules/TransacaoItem';

export function TransacaoList({
  transacoes,
  carregando,
  erro,
  onTentarDeNovo,
  onRefresh,
  refreshing,
  ListHeaderComponent,
}) {
  const espacoInferior = useEspacoInferior();
  const total = transacoes?.length ?? 0;
  // os itens formam um único card branco: arredonda só o primeiro e o último
  const renderItem = useCallback(
    ({ item, index }) => (
      <View
        style={[
          styles.fatia,
          index === 0 && styles.primeira,
          index === total - 1 && styles.ultima,
        ]}>
        <TransacaoItem transacao={item} ultima={index === total - 1} />
      </View>
    ),
    [total],
  );

  return (
    <FlatList
      data={erro ? [] : transacoes}
      keyExtractor={extrairChave}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        carregando || erro ? (
          <EstadoCarga carregando={carregando && !erro} erro={erro} onTentarDeNovo={onTentarDeNovo} />
        ) : (
          <Label variante="legenda" style={styles.vazio}>
            Nenhuma movimentação ainda. Faça a primeira recarga!
          </Label>
        )
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
  vazio: { textAlign: 'center', marginTop: espacamentos.md },
  fatia: { backgroundColor: cores.superficie, paddingHorizontal: espacamentos.lg },
  primeira: { borderTopLeftRadius: raios.xl, borderTopRightRadius: raios.xl, paddingTop: espacamentos.sm },
  ultima: { borderBottomLeftRadius: raios.xl, borderBottomRightRadius: raios.xl, paddingBottom: espacamentos.sm },
});
